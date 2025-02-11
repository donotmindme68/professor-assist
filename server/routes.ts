import type {Express} from "express";
import {createServer, type Server} from "http";
import multer from "multer";
import path from "path";
import {db} from "@db";
import {files, messages, threads, users} from "@db/schema";
import {eq} from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024}, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf', 'text/plain', 'text/markdown'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

export function registerRoutes(app: Express): Server {
    // Create a new user
    app.post('/api/users', async (req, res) => {
        try {
            const [user] = await db.insert(users)
                .values({
                    username: req.body.username,
                    email: req.body.email,
                })
                .returning();
            res.json(user);
        } catch (error) {
            res.status(500).json({error: 'Failed to create user'});
        }
    });

    // Create a new thread
    app.post('/api/threads', async (req, res) => {
        try {
            const [thread] = await db.insert(threads)
                .values({
                    userId: req.body.userId,
                    subjectType: req.body.subjectType,
                })
                .returning();
            res.json(thread);
        } catch (error) {
            res.status(500).json({error: 'Failed to create thread'});
        }
    });

    // Append to a thread (optionally send to OpenAI API)
    app.post('/api/threads/:id/messages', upload.array('files', 5), async (req, res) => {
        try {
            const threadId = parseInt(req.params.id);
            const {content, role, useOpenAI} = req.body;

            // Append the user message to the thread
            const [message] = await db.insert(messages)
                .values({
                    threadId,
                    content,
                    role,
                })
                .returning();

            // Handle file uploads if any
            if (req.files && req.files.length > 0) {
                const uploadedFiles = req.files as Express.Multer.File[];
                const filesData = uploadedFiles.map(file => ({
                    messageId: message.id,
                    filename: file.originalname,
                    contentType: file.mimetype,
                    path: file.path
                }));

                await db.insert(files)
                    .values(filesData)
                    .returning();
            }

            let assistantResponse = null;

            // Optionally send to OpenAI API
            if (useOpenAI) {
                // Fetch the thread history
                const threadHistory = await db.query.messages.findMany({
                    where: eq(messages.threadId, threadId),
                    orderBy: (messages, {asc}) => [asc(messages.createdAt)],
                });

                // Prepare messages for OpenAI
                const openAIMessages = threadHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                }));

                // Send to OpenAI API
                const completion = await openai.chat.completions.create({
                    messages: openAIMessages,
                    model: "gpt-4o-mini",
                });

                assistantResponse = completion.choices[0].message.content;

                // Append the assistant response to the thread
                const [assistantMessage] = await db.insert(messages)
                    .values({
                        threadId,
                        content: assistantResponse ?? "",
                        role: 'assistant',
                    })
                    .returning();

                assistantResponse = assistantMessage.content;
            }

            res.json({message, assistantResponse});
        } catch (error) {
            console.error('Failed to append to thread:', error);
            res.status(500).json({error: 'Failed to append to thread'});
        }
    });

    // Get thread history
    app.get('/api/threads/:id', async (req, res) => {
        try {
            const threadId = parseInt(req.params.id);
            const thread = await db.query.threads.findFirst({
                where: eq(threads.id, threadId),
                with: {
                    messages: {
                        with: {
                            files: true,
                        },
                    },
                },
            });

            if (!thread) {
                return res.status(404).json({error: 'Thread not found'});
            }

            res.json(thread);
        } catch (error) {
            res.status(500).json({error: 'Failed to fetch thread'});
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}