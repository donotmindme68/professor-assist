import {NextFunction, Request, Response} from "express";
import {User, ContentCreator, Subscriber} from "@db/schema";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "./constants";
import bcrypt from "bcrypt";

// Extend the Request type to include the user property
declare module 'express' {
  interface Request {
    user?: {
      id: number;
      role: string;
    };
  }
}

export const createUser = async (req: Request, res: Response) => {
  const {email, password, role} = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({error: 'Email, password, and role are required'});
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({where: {email}});
    if (existingUser) {
      return res.status(409).json({error: 'Email already in use'});
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the user
    let user;

    if (role === 'content-creator') {
      user = (await User.create({email, passwordHash})).dataValues;
      await ContentCreator.create({userId: user.id});
    } else if (role === 'subscriber') {
      user = (await User.create({email, passwordHash})).dataValues;
      await Subscriber.create({userId: user.id});
    } else res.status(400).json({error: 'Invalid role'});

    res.status(201).json({message: 'User created'});
  } catch (error) {
    res.status(500).json({error: 'Failed to create user'});
  }
};

// Unified login view for both content creators and subscribers
export const loginUser = async (req: Request, res: Response) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({message: 'Email and password are required'});
  }

  try {
    const user = (await User.findOne({where: {email}}))?.dataValues;  //TODO: fix
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Verify the password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({message: 'Invalid password'});
    }

    // Determine the role
    const contentCreator = await ContentCreator.findOne({where: {userId: user.id}});
    const subscriber = await Subscriber.findOne({where: {userId: user.id}});
    const role = contentCreator ? 'content-creator' : 'subscriber'

    // Generate a token with the user's ID and role
    const token = generateToken(contentCreator ? contentCreator.id : subscriber!.id, role);
    res.json({token, role, email: user.email, name: user?.name});
  } catch (error) {
    res.status(500).json({message: 'Failed to login'});
  }
};

// Middleware to authenticate users
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({message: 'Authentication required'});
  }

  try {
    // TODO: better auth that handles deleted users
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string };
    req.user = {id: decoded.id, role: decoded.role};
    next();
  } catch (error) {
    res.status(401).json({message: 'Invalid token'});
  }
};

// Middleware to authorize content creators
export const authorizeContentCreator = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'content-creator') {
    return res.status(403).json({message: 'Unauthorized: Content creator access required'});
  }
  next();
};

// Middleware to authorize subscribers
export const authorizeSubscriber = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'subscriber') {
    return res.status(403).json({message: 'Unauthorized: Subscriber access required'});
  }
  next();
};

// Generate a JWT token
export const generateToken = (userId: number, role: string): string => {
  return jwt.sign(
    {id: userId, role}, // Payload (data to include in the token)
    JWT_SECRET, // Secret key
  );
};
