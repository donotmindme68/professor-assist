import {Model} from "sequelize";

export interface User {
  email: string;
  role: 'content-creator' | 'subscriber';
  name?: string;
  token: string
}

export interface Content {
  id: number;
  name: string;
  creatorId: number;
  modelInfo: object;
  isPublic: boolean;
  sharingId: string;
  ready: boolean;
  createdAt: string;
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

export interface Thread {
  id: number;
  name: string;
  subscriberId: number;
  contentId: number;
  messages: object;
  metaInfo: object;
}
// Response types for API calls
export interface AuthResponse {
  token: string;
}

export interface ErrorResponse {
  error: string;
}
