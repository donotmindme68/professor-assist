import axios from 'axios';
import { SubscriberContent, ContentPreview, ContentRegistration, Thread, Message } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const AuthAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    const { token } = response.data;
    localStorage.setItem('authToken', token);
    return response.data;
  },

  register: async (email: string, password: string, role: 'content-creator' | 'subscriber', name?: string) => {
    const response = await api.post('/register', { email, password, role, name });
    const { token } = response.data;
    localStorage.setItem('authToken', token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

// Content Creator API
export const ContentCreatorAPI = {
  listContents: async () => {
    const response = await api.get('/content-creators/contents');
    return response.data;
  },

  listSubscribers: async (contentId: number) => {
    const response = await api.get(`/content-creators/contents/${contentId}/subscribers`);
    return response.data;
  },

  removeSubscriber: async (contentId: number, subscriberId: number) => {
    const response = await api.delete(`/content-creators/contents/${contentId}/subscribers/${subscriberId}/remove`);
    return response.data;
  }
};

// Subscriber API
export const SubscriberAPI = {
  listSubscriptions: async () => {
    const response = await api.get('/subscribers/subscriptions');
    return response.data as ContentRegistration[];
  },

  getSubscribedContents: async () => {
    // This is a helper method that combines listSubscriptions with content details
    // Note: This requires a new API endpoint on the server (suggested below)
    const response = await api.get('/subscribers/contents');
    return response.data as SubscriberContent[];
  }
};

// Content API
export const ContentAPI = {
  create: async (data: { isPublic: boolean, files?: File[] }) => {
    const formData = new FormData();
    formData.append('isPublic', String(data.isPublic));
    
    if (data.files) {
      data.files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    const response = await api.post('/contents/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (contentId: number, data: { isPublic?: boolean, sharingId?: string, ready?: boolean }) => {
    const response = await api.put(`/contents/${contentId}`, data);
    return response.data;
  },

  register: async (contentId: number) => {
    const response = await api.post(`/contents/${contentId}/register`);
    return response.data;
  },

  unregister: async (contentId: number) => {
    const response = await api.delete(`/contents/${contentId}/unregister`);
    return response.data;
  },

  getPublicContents: async () => {
    const response = await api.get('/public-contents');
    return response.data as SubscriberContent[];
  },

  getContentByInviteLink: async (inviteLink: string) => {
    // This is a suggested new API endpoint
    const response = await api.get(`/contents/by-invite?link=${encodeURIComponent(inviteLink)}`);
    return response.data as ContentPreview;
  }
};

// Thread API
export const ThreadAPI = {
  create: async (data: { 
    contentId: number, 
    name: string,
    messages?: Message[], 
    metaInfo?: any, 
    generateCompletion?: boolean 
  }) => {
    const response = await api.post('/threads/create', data);
    return response.data;
  },

  update: async (threadId: number, data: { 
    messages?: Message[], 
    metaInfo?: any, 
    generateCompletion?: boolean,
    append?: boolean 
  }) => {
    const response = await api.put(`/threads/${threadId}/update`, data);
    return response.data;
  },

  get: async (threadId: number, generateCompletion?: boolean) => {
    const response = await api.get(`/threads/${threadId}`, {
      data: { generateCompletion }
    });
    return response.data as Thread;
  },

  delete: async (threadId: number) => {
    const response = await api.delete(`/threads/${threadId}/delete`);
    return response.data;
  },

  listByContent: async (contentId: number) => {
    // This is a suggested new API endpoint
    const response = await api.get(`/threads/by-content/${contentId}`);
    return response.data as Thread[];
  }
};

export default {
  auth: AuthAPI,
  contentCreator: ContentCreatorAPI,
  subscriber: SubscriberAPI,
  content: ContentAPI,
  thread: ThreadAPI
};