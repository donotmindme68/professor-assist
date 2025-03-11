import { NextFunction, Request, Response } from "express";
import { User, ContentCreator, Subscriber } from "@db/schema";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./constants";
import bcrypt from "bcrypt";

export const createUser = async (req: Request, res: Response) => {
  const { email, password, role, name } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = (await User.create({
      email,
      passwordHash,
      name: name || null
    })).dataValues;

    if (role === 'content-creator') {
      const creator = (await ContentCreator.create({ userId: user.id }))?.dataValues;
      const token = generateToken(creator.id, role);
      res.status(201).json({ token, role, email: user.email, name: user.name });
    } else if (role === 'subscriber') {
      const subscriber = (await Subscriber.create({ userId: user.id }))?.dataValues;
      const token = generateToken(subscriber.id, role);
      res.status(201).json({ token, role, email: user.email, name: user.name });
    } else {
      await user.destroy();
      res.status(400).json({ error: 'Invalid role' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = (await User.findOne({ where: { email } }))?.dataValues;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const contentCreator = (await ContentCreator.findOne({ where: { userId: user.id } }))?.dataValues;
    const subscriber = (await Subscriber.findOne({ where: { userId: user.id } }))?.dataValues;

    if (!contentCreator && !subscriber) {
      return res.status(500).json({ error: 'User role not found' });
    }

    const role = contentCreator ? 'content-creator' : 'subscriber';
    const id = contentCreator ? contentCreator.id : subscriber!.id;
    const token = generateToken(id, role);

    res.json({
      token,
      role,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

    if (decoded.role === 'content-creator') {
      const creator = await ContentCreator.findByPk(decoded.id);
      if (!creator) {
        return res.status(401).json({ error: 'Invalid token - Creator not found' });
      }
    } else {
      const subscriber = await Subscriber.findByPk(decoded.id);
      if (!subscriber) {
        return res.status(401).json({ error: 'Invalid token - Subscriber not found' });
      }
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorizeContentCreator = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'content-creator') {
    return res.status(403).json({ error: 'Unauthorized: Content creator access required' });
  }
  next();
};

export const authorizeSubscriber = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'subscriber') {
    return res.status(403).json({ error: 'Unauthorized: Subscriber access required' });
  }
  next();
};

export const generateToken = (userId: number, role: string): string => {
  return jwt.sign(
    { id: userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};