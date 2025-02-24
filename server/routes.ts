import type {Express, Request, Response} from "express";
import {createServer, type Server} from "http";
import multer, {FileFilterCallback} from "multer";
import path from "path";
import {db} from "@db";
import {contentCreators, contentRegistrations, contents, subscribers, threads} from "@db/schema";
import {and, eq} from "drizzle-orm";
import OpenAI from "openai";
import {SYSTEM_PROMPT} from "./constants.ts";
import {authenticateUser, authorizeContentCreator, authorizeSubscriber, generateToken} from "./auth";
import bcrypt from 'bcrypt';
import {v4 as uuidv4} from 'uuid';

const openai = new OpenAI();

// Extend the Request type to include the user property
declare module 'express' {
  interface Request {
    user?: {
      id: number;
    };
  }
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {fileSize: 5 * 1024 * 1024}, // 5MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
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

// Password hashing function
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Login views
const AuthView = {
  loginContentCreator: async (req: Request, res: Response) => {
    try {
      const {email, password} = req.body;
      const [contentCreator] = await db.select()
        .from(contentCreators)
        .where(eq(contentCreators.email, email));

      if (!contentCreator) {
        return res.status(404).json({error: 'Content creator not found'});
      }

      const isValidPassword = await bcrypt.compare(password, contentCreator.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({error: 'Invalid password'});
      }

      // Generate and return a token (you can use JWT or any other method)
      const token = generateToken(contentCreator.id);
      res.json({token});
    } catch (error) {
      res.status(500).json({error: 'Failed to login'});
    }
  },

  loginSubscriber: async (req: Request, res: Response) => {
    try {
      const {email, password} = req.body;
      const [subscriber] = await db.select()
        .from(subscribers)
        .where(eq(subscribers.email, email));

      if (!subscriber) {
        return res.status(404).json({error: 'Subscriber not found'});
      }

      const isValidPassword = await bcrypt.compare(password, subscriber.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({error: 'Invalid password'});
      }

      // Generate and return a token (you can use JWT or any other method)
      const token = generateToken(subscriber.id);
      res.json({token});
    } catch (error) {
      res.status(500).json({error: 'Failed to login'});
    }
  },
};

// Updated ContentCreatorView and SubscriberView to hash passwords
const ContentCreatorView = {
  create: async (req: Request, res: Response) => {
    try {
      const passwordHash = await hashPassword(req.body.password);
      const [contentCreator] = await db.insert(contentCreators)
        .values({
          email: req.body.email,
          passwordHash,
        })
        .returning();
      res.json(contentCreator);
    } catch (error) {
      res.status(500).json({error: 'Failed to create content creator'});
    }
  },

  listContents: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const creatorContents = await db.select()
        .from(contents)
        .where(eq(contents.creatorId, req.user!.id));
      res.json(creatorContents);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch contents'});
    }
  }],

  listSubscribers: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const contentSubscribers = await db.select()
        .from(contentRegistrations)
        .where(eq(contentRegistrations.contentId, contentId));
      res.json(contentSubscribers);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch subscribers'});
    }
  }],

  removeSubscriber: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.contentId);
      const subscriberId = parseInt(req.params.subscriberId);
      await db.delete(contentRegistrations)
        .where(and(
          eq(contentRegistrations.contentId, contentId),
          eq(contentRegistrations.subscriberId, subscriberId)
        ));
      res.json({message: 'Subscriber removed successfully'});
    } catch (error) {
      res.status(500).json({error: 'Failed to remove subscriber'});
    }
  }],
};

const SubscriberView = {
  create: async (req: Request, res: Response) => {
    try {
      const passwordHash = await hashPassword(req.body.password);
      const [subscriber] = await db.insert(subscribers)
        .values({
          email: req.body.email,
          passwordHash,
        })
        .returning();
      res.json(subscriber);
    } catch (error) {
      res.status(500).json({error: 'Failed to create subscriber'});
    }
  },

  listSubscriptions: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const subscriberSubscriptions = await db.select()
        .from(contentRegistrations)
        .where(eq(contentRegistrations.subscriberId, req.user!.id));
      res.json(subscriberSubscriptions);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch subscriptions'});
    }
  }],
};

const ContentView = {
  create: [authorizeContentCreator, upload.array('files', 5), async (req: Request, res: Response) => {
    try {
      const sharingId = req.body.isPublic ? uuidv4() : null;
      const [content] = await db.insert(contents)
        .values({
          creatorId: req.user!.id,
          // instructions: req.body.instructions,
          isPublic: req.body.isPublic,
          sharingId,
        })
        .returning();
      res.json(content);
    } catch (error) {
      res.status(500).json({error: 'Failed to create content'});
    }
  }],

  update: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const [content] = await db.update(contents)
        .set({
          isPublic: req.body.isPublic,
          sharingId: req.body.sharingId,
          ready: req.body.ready,
        })
        .where(eq(contents.id, contentId))
        .returning();
      res.json(content);
    } catch (error) {
      res.status(500).json({error: 'Failed to update content'});
    }
  }],

  register: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const [registration] = await db.insert(contentRegistrations)
        .values({
          subscriberId: req.user!.id,
          contentId: contentId,
        })
        .returning();
      res.json(registration);
    } catch (error) {
      res.status(500).json({error: 'Failed to register for content'});
    }
  }],

  unregister: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      await db.delete(contentRegistrations)
        .where(and(
          eq(contentRegistrations.subscriberId, req.user!.id),
          eq(contentRegistrations.contentId, contentId)
        ));
      res.json({message: 'Unregistered successfully'});
    } catch (error) {
      res.status(500).json({error: 'Failed to unregister from content'});
    }
  }],
};

const ThreadView = {
  create: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const [thread] = await db.insert(threads)
        .values({
          subscriberId: req.user!.id,
          contentId: req.body.contentId,
          messages: req.body.messages,
          metaInfo: req.body.metaInfo,
        })
        .returning();

      if (req.body.generateCompletion) {
        const completion = await openai.chat.completions.create({
          messages: [{role: "system", content: SYSTEM_PROMPT}, ...req.body.messages],
          model: "gpt-4",
        });
        thread.completion = completion.choices[0].message.content;
      }

      res.json(thread);
    } catch (error) {
      res.status(500).json({error: 'Failed to create thread'});
    }
  }],

  update: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const [thread] = await db.update(threads)
        .set({
          messages: req.body.messages,
          metaInfo: req.body.metaInfo,
        })
        .where(eq(threads.id, threadId))
        .returning();

      if (req.body.generateCompletion) {
        const completion = await openai.chat.completions.create({
          messages: [{role: "system", content: SYSTEM_PROMPT}, ...req.body.messages],
          model: "gpt-4",
        });
        thread.completion = completion.choices[0].message.content;
      }

      res.json(thread);
    } catch (error) {
      res.status(500).json({error: 'Failed to update thread'});
    }
  }],

  get: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const [thread] = await db.select()
        .from(threads)
        .where(eq(threads.id, threadId));

      if (req.body.generateCompletion) {
        const completion = await openai.chat.completions.create({
          messages: [{role: "system", content: SYSTEM_PROMPT}, ...thread.messages],
          model: "gpt-4",
        });
        thread.completion = completion.choices[0].message.content;
      }

      res.json(thread);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch thread'});
    }
  }],

  delete: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      await db.delete(threads)
        .where(eq(threads.id, threadId));
      res.json({message: 'Thread deleted successfully'});
    } catch (error) {
      res.status(500).json({error: 'Failed to delete thread'});
    }
  }],
};

// Public Courses and Registration
const PublicContentView = {
  list: async (req: Request, res: Response) => {
    try {
      const publicContents = await db.select()
        .from(contents)
        .where(eq(contents.isPublic, true));
      res.json(publicContents);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch public contents'});
    }
  },
};

// Register routes
export function registerRoutes(app: Express): Server {
  // Authentication middleware
  app.use('/api/*path', authenticateUser);

  // ContentCreator routes
  app.post('/api/content-creators/create', ContentCreatorView.create);
  app.get('/api/content-creators/contents/create', ContentCreatorView.listContents);
  app.get('/api/content-creators/contents/:id/subscribers', ContentCreatorView.listSubscribers);
  app.delete('/api/content-creators/contents/:contentId/subscribers/:subscriberId/remove', ContentCreatorView.removeSubscriber);

  // Subscriber routes
  app.post('/api/subscribers/create', SubscriberView.create);
  app.get('/api/subscribers/subscriptions', SubscriberView.listSubscriptions);

  // Content routes
  app.post('/api/contents/create', ContentView.create);
  app.put('/api/contents/:id', ContentView.update);
  app.post('/api/contents/:id/register', ContentView.register);
  app.delete('/api/contents/:id/unregister', ContentView.unregister);

  // Thread routes
  app.post('/api/threads/create', ThreadView.create);
  app.put('/api/threads/:id', ThreadView.update);
  app.get('/api/threads/:id', ThreadView.get);
  app.delete('/api/threads/:id', ThreadView.delete);

  // Public content routes
  app.get('/api/public-contents', PublicContentView.list);

  const httpServer = createServer(app);
  return httpServer;
}