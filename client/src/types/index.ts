import {Model} from "sequelize";

export interface User {
  email: string;
  role: 'content-creator' | 'subscriber';
  name?: string;
  token: string
}

export interface ContentCreatorContent {
  id: number;
  name: string;
  description?: string;
  modelInfo: object;
  isPublic: boolean;
  sharingId: string;
  ready: boolean;
  createdAt: string;
}

export interface SubscriberContent {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface ContentPreview {
  id: number;
  name: string;
  creatorId: number;
  description?: string;
}

export interface Subscriber {
  email: string
}

// ContentRegistration type (relationship between Subscriber and Content)
export interface ContentRegistration {
  id: number;
  subscriberId: number;
  contentId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Message {
  role: 'assistant' | 'user';
  content: string;
  error?: string;
  createdAt?: string; // ISO date string
}

export interface Thread {
  id: number;
  name: string;
  subscriberId: number;
  contentId: number;
  messages: Message[];
  metaInfo: object;
  createdAt?: string; // ISO date string
}

// Response types for API calls
export interface AuthResponse {
  token: string;
}

export interface ErrorResponse {
  error: string;
}