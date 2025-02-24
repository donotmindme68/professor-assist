import {NextFunction, Request, Response} from "express";
import {db} from "@db";
import {contentCreators, subscribers} from "@db/schema";
import {eq} from "drizzle-orm";
import jwt from "jsonwebtoken";
import {JWT_SECRET} from "./constants.ts";

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as { id: number, role: string };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeContentCreator = async (req: Request, res: Response, next: NextFunction) => {
  const contentCreator = await db.query.contentCreators.findFirst({
    where: eq(contentCreators.id, req.user!.id),
  });

  if (!contentCreator) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  next();
};

export const authorizeSubscriber = async (req: Request, res: Response, next: NextFunction) => {
  const subscriber = await db.query.subscribers.findFirst({
    where: eq(subscribers.id, req.user!.id),
  });

  if (!subscriber) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  next();
}; // Generate a JWT token
export const generateToken = (userId: number): string => {
  return jwt.sign(
    {userId}, // Payload (data to include in the token)
    JWT_SECRET, // Secret key
    // { expiresIn: TOKEN_EXPIRATION } // Token expiration
  );
};