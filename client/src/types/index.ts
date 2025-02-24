// Base User type (common properties for ContentCreator and Subscriber)
export interface User {
  id: number;
  email: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ContentCreator type
export interface ContentCreator extends User {
  passwordHash: string; // Only used server-side, not exposed to the client
}

// Subscriber type
export interface Subscriber extends User {
  passwordHash: string; // Only used server-side, not exposed to the client
}

// Content type
export interface Content {
  id: number;
  creatorId: number;
  isPublic: boolean;
  sharingId: string | null;
  ready: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ContentRegistration type (relationship between Subscriber and Content)
export interface ContentRegistration {
  id: number;
  subscriberId: number;
  contentId: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Thread type
export interface Thread {
  id: number;
  subscriberId: number;
  contentId: number;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  metaInfo: Record<string, any>; // Flexible metadata
  completion?: string; // Optional completion message from OpenAI
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Response types for API calls
export interface AuthResponse {
  token: string;
}

export interface ErrorResponse {
  error: string;
}