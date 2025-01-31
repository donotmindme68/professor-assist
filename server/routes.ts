import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { db } from "@db";
import { files, questions } from "@db/schema";
import { eq } from "drizzle-orm";

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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
  // Create a new question
  app.post('/api/questions', async (req, res) => {
    try {
      const [question] = await db.insert(questions)
        .values({
          content: req.body.content,
          responseContent: req.body.responseContent,
          citations: req.body.citations
        })
        .returning();
      res.json(question);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create question' });
    }
  });

  // Upload files for a question
  app.post('/api/questions/:id/files', upload.array('files', 5), async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const uploadedFiles = req.files as Express.Multer.File[];

      const filesData = uploadedFiles.map(file => ({
        questionId,
        filename: file.originalname,
        contentType: file.mimetype,
        path: file.path
      }));

      const savedFiles = await db.insert(files)
        .values(filesData)
        .returning();

      res.json(savedFiles);
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload files' });
    }
  });

  // Get a question with its files
  app.get('/api/questions/:id', async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const question = await db.query.questions.findFirst({
        where: eq(questions.id, questionId),
        with: {
          files: true
        }
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json(question);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch question' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
