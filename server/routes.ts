import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Content, ContentRegistration, Thread, User } from "@db/schema";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./constants";
import { authenticateUser, authorizeContentCreator, authorizeSubscriber, createUser, loginUser } from "./auth";
import { v4 as uuidv4 } from 'uuid';
import {Op} from "sequelize";
import {Thread as ThreadType} from 'types'

const openai = new OpenAI();

// Extend the Request type to include the user property
declare module 'express' {
  interface Request {
    user?: {
      id: number;
      role: string;
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

const ContentCreatorView = {
  listContents: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const creatorContents = await Content.findAll({
        where: { creatorId: req.user!.id },
        include: [{ model: ContentRegistration }]
      });
      res.json(creatorContents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contents' });
    }
  }],

  listSubscribers: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const contentSubscribers = await ContentRegistration.findAll({
        where: { contentId },
        include: [{
          model: User,
          attributes: ['id', 'name', 'email']
        }]
      });
      res.json(contentSubscribers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
  }],

  removeSubscriber: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.contentId);
      const subscriberId = parseInt(req.params.subscriberId);
      await ContentRegistration.destroy({
        where: {
          contentId,
          subscriberId,
        },
      });
      res.json({ message: 'Subscriber removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove subscriber' });
    }
  }],
};

const SubscriberView = {
  listSubscriptions: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const subscriberSubscriptions = await ContentRegistration.findAll({
        where: { subscriberId: req.user!.id },
        include: [{
          model: Content,
          attributes: ['id', 'name', 'description', 'isPublic', 'ready']
        }]
      });
      res.json(subscriberSubscriptions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
  }],

  getSubscribedContents: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const subscriptions = await ContentRegistration.findAll({
        where: { subscriberId: req.user!.id },
        include: [{
          model: Content,
          attributes: ['id', 'name', 'description', 'isPublic', 'ready']
        }]
      });

      const contents = subscriptions.map(sub => sub.get('content'));
      res.json(contents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subscribed contents' });
    }
  }]
};

const ContentView = {
  create: [authorizeContentCreator, upload.array('files', 5), async (req: Request, res: Response) => {
    try {
      const sharingId = req.body.isPublic ? uuidv4() : null;
      const content = await Content.create({
        name: req.body.name,
        description: req.body.description,
        creatorId: req.user!.id,
        isPublic: req.body.isPublic,
        sharingId,
        modelInfo: req.body.modelInfo || {},
      });
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create content' });
    }
  }],

  update: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const [updated] = await Content.update({
        name: req.body.name,
        description: req.body.description,
        isPublic: req.body.isPublic,
        sharingId: req.body.sharingId,
        ready: req.body.ready,
        modelInfo: req.body.modelInfo,
      }, {
        where: { id: contentId, creatorId: req.user!.id },
      });
      if (updated) {
        const updatedContent = await Content.findByPk(contentId);
        res.json(updatedContent);
      } else {
        res.status(404).json({ error: 'Content not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update content' });
    }
  }],

  register: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await Content.findByPk(contentId);

      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }

      if (!content.isPublic) {
        return res.status(403).json({ error: 'Content is not public' });
      }

      const registration = await ContentRegistration.create({
        subscriberId: req.user!.id,
        contentId,
      });
      res.json(registration);
    } catch (error) {
      res.status(500).json({ error: 'Failed to register for content' });
    }
  }],

  unregister: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      await ContentRegistration.destroy({
        where: {
          subscriberId: req.user!.id,
          contentId,
        },
      });
      res.json({ message: 'Unregistered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unregister from content' });
    }
  }],

  getByInviteLink: async (req: Request, res: Response) => {
    try {
      const inviteLink = req.query.link as string;
      if (!inviteLink) {
        return res.status(400).json({ error: 'Invite link is required' });
      }

      const content = await Content.findOne({
        where: { sharingId: inviteLink },
        attributes: ['id', 'name', 'description', 'creatorId', 'isPublic']
      });

      if (!content) {
        return res.status(404).json({ error: 'Content not found or invite link expired' });
      }

      res.json(content);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch content by invite link' });
    }
  }
};

const ThreadView = {
  create: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const thread = await Thread.create({
        name: req.body.name,
        subscriberId: req.user!.id,
        contentId: req.body.contentId,
        messages: req.body.messages || [],
        metaInfo: req.body.metaInfo || {},
      });

      let assistantResponse = null;

      if (req.body.generateCompletion && req.body.messages?.length > 0) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...req.body.messages,
          ],
        });

        assistantResponse = completion.choices[0].message.content;

        await Thread.update(
          { messages: [...thread.messages, { role: 'assistant', content: assistantResponse }] },
          { where: { id: thread.id } }
        );
      }

      res.status(201).json({
        ...thread.dataValues,
        assistantResponse,
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({ error: 'Failed to create thread' });
    }
  }],

  update: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const { messages, metaInfo, generateCompletion, append } = req.body;

      const thread = await Thread.findOne({
        where: { id: threadId, subscriberId: req.user!.id }
      });

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      const updatedMessages = append
        ? [...thread.messages, ...messages]
        : messages;

      const [updated] = await Thread.update(
        {
          messages: updatedMessages,
          metaInfo: metaInfo || thread.metaInfo,
        },
        {
          where: { id: threadId, subscriberId: req.user!.id },
        }
      );

      let assistantResponse = null;

      if (updated && generateCompletion) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...updatedMessages,
          ],
        });

        assistantResponse = completion.choices[0].message.content;

        await Thread.update(
          { messages: [...updatedMessages, { role: 'assistant', content: assistantResponse }] },
          { where: { id: threadId } }
        );
      }

      const updatedThread = await Thread.findByPk(threadId);
      res.json({
        ...updatedThread!.dataValues,
        assistantResponse,
      });
    } catch (error) {
      console.error('Error updating thread:', error);
      res.status(500).json({ error: 'Failed to update thread' });
    }
  }],

  get: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const thread = await Thread.findOne({
        where: { id: threadId, subscriberId: req.user!.id }
      });

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      let assistantResponse = null;
      if (req.body.generateCompletion && thread.messages.length > 0) {
        const completion = await openai.chat.completions.create({
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...thread.messages],
          model: "gpt-4",
        });
        assistantResponse = completion.choices[0].message.content;
      }

      res.json({
        ...thread.dataValues,
        assistantResponse
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch thread' });
    }
  }],

  delete: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const deleted = await Thread.destroy({
        where: { id: threadId, subscriberId: req.user!.id }
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      res.json({ message: 'Thread deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete thread' });
    }
  }],

  listByContent: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.contentId);
      const threads = await Thread.findAll({
        where: {
          contentId,
          subscriberId: req.user!.id
        },
        order: [['createdAt', 'DESC']]
      });
      res.json(threads);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch threads' });
    }
  }]
};

const PublicContentView = {
  list: async (req: Request, res: Response) => {
    try {
      const publicContents = await Content.findAll({
        where: { isPublic: true },
        attributes: ['id', 'name', 'description', 'creatorId', 'isPublic']
      });
      res.json(publicContents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch public contents' });
    }
  },

  search: async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const contents = await Content.findAll({
        where: {
          isPublic: true,
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { description: { [Op.iLike]: `%${query}%` } }
          ]
        },
        attributes: ['id', 'name', 'description', 'creatorId', 'isPublic']
      });

      res.json(contents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search contents' });
    }
  }
};

// Register routes
export function registerRoutes(app: Express): Server {
  // Authentication routes
  app.post('/api/login', loginUser);
  app.post('/api/register', createUser);
  app.use('/api/*path', authenticateUser);

  // User profile route
  app.get('/api/user/profile', async (req: Request, res: Response) => {
    try {
      const user = await User.findByPk(req.user!.id, {
        attributes: { exclude: ['passwordHash'] }
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // ContentCreator routes
  app.get('/api/content-creators/contents', ContentCreatorView.listContents);
  app.get('/api/content-creators/contents/:id/subscribers', ContentCreatorView.listSubscribers);
  app.delete('/api/content-creators/contents/:contentId/subscribers/:subscriberId/remove', ContentCreatorView.removeSubscriber);

  // Subscriber routes
  app.get('/api/subscribers/subscriptions', SubscriberView.listSubscriptions);
  app.get('/api/subscribers/contents', SubscriberView.getSubscribedContents);

  // Content routes
  app.post('/api/contents/create', ContentView.create);
  app.put('/api/contents/:id', ContentView.update);
  app.post('/api/contents/:id/register', ContentView.register);
  app.delete('/api/contents/:id/unregister', ContentView.unregister);
  app.get('/api/contents/by-invite', ContentView.getByInviteLink);

  // Thread routes
  app.post('/api/threads/create', ThreadView.create);
  app.put('/api/threads/:id/update', ThreadView.update);
  app.get('/api/threads/:id', ThreadView.get);
  app.delete('/api/threads/:id/delete', ThreadView.delete);
  app.get('/api/threads/by-content/:contentId', ThreadView.listByContent);
  app.patch('/api/threads/:id/name', async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Valid name is required' });
      }

      const [updated] = await Thread.update(
        { name },
        { where: { id: threadId, subscriberId: req.user!.id } }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Thread not found or not authorized' });
      }

      const updatedThread = await Thread.findByPk(threadId);
      res.json(updatedThread);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update thread name' });
    }
  });

  // Public content routes
  app.get('/api/public-contents', PublicContentView.list);
  app.get('/api/public-contents/search', PublicContentView.search);

  const httpServer = createServer(app);
  return httpServer;
}