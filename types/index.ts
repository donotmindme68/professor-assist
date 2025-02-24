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
  isPublic: boolean;
  sharingId: string | null;
  ready: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
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

// Thread type
export interface Thread {
  id: number;
  name: string;
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
