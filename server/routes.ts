import type {Express, Request, Response} from "express";
import {createServer, type Server} from "http";
import multer, {FileFilterCallback} from "multer";
import path from "path";
import {Content, ContentCreator, ContentRegistration, Subscriber, Thread, User} from "@db/schema";
import {ASSISTANT_SYSTEM_PROMPT, ASSISTANT_SYSTEM_PROMPT_INCLUDE_SPEECH} from "./constants";
import {authenticateUser, authorizeContentCreator, authorizeSubscriber, createUser, loginUser} from "./auth";
import {Op} from "sequelize";
import openai from "./aiClient.ts"
import './training.ts'
import {train_content} from "./training.ts";
import {generateRandomString} from "@/utils";
import {Message} from "@/types";
import fs from 'fs'
import {ChatCompletionMessageParam} from "openai/src/resources/chat/completions";

// Extend the Request type to include the user property
declare module 'express' {
  interface Request {
    user?: {
      id: number;
      role: string;
    };
  }
}


const generateCompletion = async (model: string, messages: Message[], includeSpeech = false) => {
  const mapped = messages.map(m => ({
    role: m.role,
    content: [{type: 'text', text: m.content}],
  } as ChatCompletionMessageParam))


  mapped.unshift({
    role: 'system',
    // content: includeSpeech ? ASSISTANT_SYSTEM_PROMPT_INCLUDE_SPEECH : ASSISTANT_SYSTEM_PROMPT
    content: ASSISTANT_SYSTEM_PROMPT
  });

  const completion = await openai.chat.completions.create({
    model: model,
    // model: "gpt-4o-mini",
    messages: mapped,
    response_format: {
      "type": "text"
    },
    temperature: 1,
    max_completion_tokens: 10000,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });

  const assistantResponse = completion.choices[0].message

  if (includeSpeech) {
    const speech = await openai.chat.completions.create({
      model: "gpt-4o-audio-preview", // model, //todo: fix
      messages: [{
        role: 'system',
        content: [{
          type: 'text',
          text: `Act as a narriator and speak aloud what the user provides you - do not change any thing or try to react to what the user says - JUST  Narriate`
        }]
      }, {
        role: 'user',
        content: [{
          type: 'text',
          // text: assistantResponse.content!.split('\n\n')[0]
          text: assistantResponse.content!
        }]
      }]
      , modalities: ["text", "audio"],
      audio: {
        "voice": "ash",
        "format": "wav"
      },
      temperature: 1,
      max_completion_tokens: 10000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    assistantResponse.audio = speech.choices[0].message.audio!
  }


  return {
    role: 'assistant',
    // 'content': assistantResponse.content!.split('\n\n').slice(1).join('\n\n'),
    content: assistantResponse.content,
    audio: assistantResponse.audio
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

const ContentCreatorView = {
  listContents: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      let creatorContents = (await Content.findAll({
        where: {creatorId: req.user!.id},
        include: [{model: ContentRegistration}]
      })).map(e => e.dataValues);

      creatorContents = await Promise.all(creatorContents.map(async (c) => {
        if (c.ready === false && c.error === null) {
          const job = await openai.fineTuning.jobs.retrieve(c.modelInfo.jobId)
          if (job.status === 'succeeded') {
            c.ready = true
            c.modelInfo.model = job.fine_tuned_model!
            await Content.update({ready: true}, {where: {id: c.id}})
          } else if (job.status in ['failed', 'cancelled']) {
            c.error = job.error
            await Content.update({error: job.status === 'failed' ? job.error : 'cancelled'}, {where: {id: c.id}})
          }
        }
        return Promise.resolve(c)
      }))

      res.json(creatorContents);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch contents'});
    }
  }],

  listSubscribers: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const _contentSubscribers = await ContentRegistration.findAll({
        where: {contentId: 8},
        include: [{
          model: Subscriber,
          as: 'subscriber',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }]
        }]
      }) as (ContentRegistration & { subscriber: Subscriber & { user: User } })[];
      res.json(_contentSubscribers.map(c => c.dataValues).map(c => ({
        ...c.subscriber.user.dataValues,
        id: c.subscriberId,
        joinedAt: c.createdAt
      })));
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch subscribers'});
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
      res.json({message: 'Subscriber removed successfully'});
    } catch (error) {
      res.status(500).json({error: 'Failed to remove subscriber'});
    }
  }],
};

const SubscriberView = {
  listSubscribedContents: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const subscriptions: ContentRegistration[] = await ContentRegistration.findAll({
        where: {subscriberId: req.user!.id},
        attributes: ['createdAt'],  // Fetch only createdAt from ContentRegistration
        include: [{
          model: Content,
          attributes: ['id', 'name', 'description', 'isPublic', 'ready'],
          include: [{
            model: ContentCreator,
            attributes: [],
            include: [{
              model: User,
              attributes: [['name', 'creatorName'], ['email', 'creatorEmail']]
            }]
          }]
        }]
      });

      type SubscriptionData = {
        createdAt: Date;
        id: number;
        name: string;
        description: string;
        isPublic: boolean;
        ready: boolean;
        creatorName: string | null;
        creatorEmail: string | null;
      };

      const flattenedSubscriptions: SubscriptionData[] = subscriptions.map(sub => {
        const content = sub.dataValues.content?.dataValues || {};
        const creator = sub.dataValues.content?.dataValues.ContentCreator?.dataValues.User?.dataValues || {};

        return {
          createdAt: sub.dataValues.createdAt,
          id: content.id,
          name: content.name,
          description: content.description,
          isPublic: content.isPublic,
          ready: content.ready,
          creatorName: creator.creatorName || null,
          creatorEmail: creator.creatorEmail || null
        };
      });


      res.status(200).json(flattenedSubscriptions);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch subscribed contents'});
    }
  }]
};

const ContentView = {
  create: [authorizeContentCreator, upload.array('files', 5), async (req: Request, res: Response) => {
    try {
      const {name, description, isPublic, modelInfo: _modelInfo} = req.body;
      const modelInfo = JSON.parse(_modelInfo)
      const files = req.files as Express.Multer.File[];

      const job = await train_content(files, modelInfo.prompt, modelInfo.type);

      const content = await Content.create({
        name: name,
        description: description,
        creatorId: req.user!.id,
        isPublic: isPublic,
        modelInfo: {...modelInfo, jobId: job.id},
      });
      res.json(content);
    } catch (error) {
      res.status(500).json({error: 'Failed to create content'});
    }
  }],

  toremove: [authorizeContentCreator, async (req: Request, res: Response) => { //todo: remove
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
        where: {id: contentId, creatorId: req.user!.id},
      });
      if (updated) {
        const updatedContent = await Content.findByPk(contentId);
        res.json(updatedContent);
      } else {
        res.status(404).json({error: 'Content not found'});
      }
    } catch (error) {
      res.status(500).json({error: 'Failed to update content'});
    }
  }],

  setPublic: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const [updated] = await Content.update({
        isPublic: req.body.isPublic,
      }, {
        where: {id: contentId, creatorId: req.user!.id},
      });
      if (updated) {
        const updatedContent = (await Content.findByPk(contentId))?.dataValues;
        res.json(updatedContent);
      } else {
        res.status(404).json({error: 'Content not found'});
      }
    } catch (error) {
      res.status(500).json({error: 'Failed to update content'});
    }
  }],


  rotateLink: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const [updated] = await Content.update({
        sharingId: generateRandomString(16),
      }, {
        where: {id: contentId, creatorId: req.user!.id},
      });
      if (updated) {
        const updatedContent = (await Content.findByPk(contentId))?.dataValues;
        res.json(updatedContent);
      } else {
        res.status(404).json({error: 'Content not found'});
      }
    } catch (error) {
      res.status(500).json({error: 'Failed to update content'});
    }
  }],

  removeLink: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const [updated] = await Content.update({
        sharingId: null
      }, {
        where: {id: contentId, creatorId: req.user!.id},
      });
      if (updated) {
        const updatedContent = (await Content.findByPk(contentId))?.dataValues;
        res.json(updatedContent);
      } else {
        res.status(404).json({error: 'Content not found'});
      }
    } catch (error) {
      res.status(500).json({error: 'Failed to update content'});
    }
  }],

  delete: [authorizeContentCreator, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const result = await Content.destroy({
        where: {id: contentId, creatorId: req.user!.id},
      });
      if (result) {
        res.json({"message": "Content deleted successfully"});
      } else {
        res.status(404).json({error: 'Content not found'});
      }
    } catch (error) {
      res.status(500).json({error: 'Failed to update content'});
    }
  }],

  register: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = (await Content.findByPk(contentId))?.dataValues;

      if (!content) {
        return res.status(404).json({error: 'Content not found'});
      }

      if (!content.isPublic) {
        return res.status(403).json({error: 'Content is not public'});
      }

      const registration = (await ContentRegistration.create({
        subscriberId: req.user!.id,
        contentId,
      })).dataValues;
      res.json(registration);
    } catch (error) {
      res.status(500).json({error: 'Failed to register for content'});
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
      res.json({message: 'Unregistered successfully'});
    } catch (error) {
      res.status(500).json({error: 'Failed to unregister from content'});
    }
  }],

  getByInviteLink: async (req: Request, res: Response) => {
    try {
      const inviteLink = req.query.link as string;
      if (!inviteLink) {
        return res.status(400).json({error: 'Invite link is required'});
      }

      const content = await Content.findOne({
        where: {sharingId: inviteLink},
        attributes: ['id', 'name', 'description', 'creatorId', 'isPublic']
      });

      if (!content) {
        return res.status(404).json({error: 'Content not found or invite link expired'});
      }

      res.json(content);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch content by invite link'});
    }
  },
};


const ThreadView = {
  create: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const content = (await Content.findByPk(req.body.contentId!))?.dataValues

      if (!content)
        return res.status(404).json({error: 'Content not found'});

      const simpleMessages = req.body.messages || []
      const messagesWithVoice = [...simpleMessages]

      if (req.body.generateCompletion && req.body.messages?.length > 0) {
        const assistantResponse = await generateCompletion(
          content.modelInfo.model!,
          req.body.messages,
          req.body.includeSpeech
        )

        messagesWithVoice.push(assistantResponse)
        simpleMessages.push({...assistantResponse, audio: undefined})
      }

      const thread = (await Thread.create({
        name: req.body.name,
        subscriberId: req.user!.id,
        contentId: req.body.contentId,
        messages: simpleMessages,
        metaInfo: req.body.metaInfo || {},
      })).dataValues;

      res.status(201).json({...thread, messages: messagesWithVoice});
    } catch
      (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({error: 'Failed to create thread'});
    }
  }
  ],

  update: [authorizeSubscriber, async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const {messages = [], metaInfo, includeSpeech, append} = req.body;

      const thread = (await Thread.findOne({
        where: {id: threadId, subscriberId: req.user!.id}
      }))?.dataValues;

      if (!thread) {
        return res.status(404).json({error: 'Thread not found'});
      }

      const content = (await Content.findByPk(thread.contentId))?.dataValues

      if (!content)
        return res.status(404).json({error: 'Content not found'});

      const simpleMessages = (append
        ? [...thread.messages, ...messages]
        : messages).map((m: Message) => ({
        role: m.role,
        content: m.content,
      }));
      const messagesWithVoice = [...simpleMessages]

      if (req.body.generateCompletion && req.body.messages?.length > 0) {
        const assistantResponse = await generateCompletion(
          content.modelInfo.model!,
          req.body.messages,
          includeSpeech
        )

        messagesWithVoice.push(assistantResponse)
        simpleMessages.push({...assistantResponse, audio: undefined})
      }


      const _ = await Thread.update(
        {
          messages: simpleMessages,
          metaInfo: metaInfo || thread.metaInfo,
        },
        {
          where: {id: threadId, subscriberId: req.user!.id},
        }
      );


      const updatedThread = await Thread.findByPk(threadId);
      res.json({
        ...updatedThread!.dataValues, messages: messagesWithVoice
      });
    } catch (error) {
      console.error('Error updating thread:', error);
      res.status(500).json({error: 'Failed to update thread'});
    }
  }],

  get:
    [authorizeSubscriber, async (req: Request, res: Response) => {
      try {
        const threadId = parseInt(req.params.id);
        const thread = (await Thread.findOne({
          where: {id: threadId, subscriberId: req.user!.id}
        }))?.dataValues;

        if (!thread) {
          return res.status(404).json({error: 'Thread not found'});
        }

        let assistantResponse = null;
        if (req.body.generateCompletion && thread.messages.length > 0) {
          const completion = await openai.chat.completions.create({
            messages: thread.messages,
            model: "gpt-4",
          });
          assistantResponse = completion.choices[0].message.content;
        }

        res.json({
          ...thread.dataValues,
          assistantResponse
        });
      } catch (error) {
        res.status(500).json({error: 'Failed to fetch thread'});
      }
    }],

  delete:
    [authorizeSubscriber, async (req: Request, res: Response) => {
      try {
        const threadId = parseInt(req.params.id);
        const deleted = await Thread.destroy({
          where: {id: threadId, subscriberId: req.user!.id}
        });

        if (!deleted) {
          return res.status(404).json({error: 'Thread not found'});
        }

        res.json({message: 'Thread deleted successfully'});
      } catch (error) {
        res.status(500).json({error: 'Failed to delete thread'});
      }
    }],

  listByContent:
    [authorizeSubscriber, async (req: Request, res: Response) => {
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
        res.status(500).json({error: 'Failed to fetch threads'});
      }
    }]
};

const PublicContentView = {
  list: async (req: Request, res: Response) => {
    try {
      const publicContents = await Content.findAll({
        where: {isPublic: true},
        attributes: ['id', 'name', 'description', 'creatorId', 'isPublic'],
        include: [{
          model: ContentCreator,
          include: [{
            model: User,
            as: 'user',  // Alias for the user (creator)
            attributes: [
              ['name', 'creatorName'],  // Renaming 'name' to 'creatorName'
              ['email', 'creatorEmail'] // Renaming 'email' to 'creatorEmail'
            ]
          }]
        }]
      });
      res.json(publicContents);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch public contents'});
    }
  },

  search: async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({error: 'Search query is required'});
      }

      const contents = await Content.findAll({
        where: {
          isPublic: true,
          [Op.or]: [
            {name: {[Op.iLike]: `%${query}%`}},
            {description: {[Op.iLike]: `%${query}%`}}
          ]
        },
        attributes: ['id', 'name', 'description', 'creatorId', 'isPublic']
      });

      res.json(contents);
    } catch (error) {
      res.status(500).json({error: 'Failed to search contents'});
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
        attributes: {exclude: ['passwordHash']}
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({error: 'Failed to fetch user profile'});
    }
  });

  // ContentCreator routes
  app.get('/api/content-creators/contents', ContentCreatorView.listContents);
  app.get('/api/content-creators/contents/:id/subscribers', ContentCreatorView.listSubscribers);
  app.delete('/api/content-creators/contents/:contentId/subscribers/:subscriberId/remove', ContentCreatorView.removeSubscriber); //todo: fix
  app.put('/api/content-creators/contents/:contentId/subscribers/:subscriberId/remove', ContentCreatorView.removeSubscriber);

  app.post('/api/contents/create', ContentView.create);
  app.put('/api/contents/:id/set_public', ContentView.setPublic);
  app.put('/api/contents/:id/rotate_link', ContentView.rotateLink);
  app.put('/api/contents/:id/remove_link', ContentView.removeLink);
  app.put('/api/contents/:id/delete', ContentView.delete);
  app.delete('/api/contents/:id/delete', ContentView.delete);
  app.put('/api/contents/:id/delete', ContentView.delete);

  // Subscriber routes
  app.get('/api/subscribers/contents', SubscriberView.listSubscribedContents);

  app.post('/api/contents/:id/register', ContentView.register);
  app.delete('/api/contents/:id/unregister', ContentView.unregister);
  app.put('/api/contents/:id/unregister', ContentView.unregister);
  app.get('/api/contents/by-invite', ContentView.getByInviteLink);

  app.post('/api/threads/create', ThreadView.create);
  app.put('/api/threads/:id/update', ThreadView.update);
  app.get('/api/threads/:id', ThreadView.get);
  app.delete('/api/threads/:id/delete', ThreadView.delete);
  app.put('/api/threads/:id/delete', ThreadView.delete);
  app.get('/api/threads/by-content/:contentId', ThreadView.listByContent);
  app.patch('/api/threads/:id/name', async (req: Request, res: Response) => {
    try {
      const threadId = parseInt(req.params.id);
      const {name} = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({error: 'Valid name is required'});
      }

      const [updated] = await Thread.update(
        {name},
        {where: {id: threadId, subscriberId: req.user!.id}}
      );

      if (!updated) {
        return res.status(404).json({error: 'Thread not found or not authorized'});
      }

      const updatedThread = await Thread.findByPk(threadId);
      res.json(updatedThread);
    } catch (error) {
      res.status(500).json({error: 'Failed to update thread name'});
    }
  });

  // Public content routes
  app.get('/api/public-contents', PublicContentView.list);
  app.get('/api/public-contents/search', PublicContentView.search);

  const httpServer = createServer(app);
  return httpServer;
}