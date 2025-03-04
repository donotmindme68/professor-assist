import axios, {AxiosError, AxiosResponse} from 'axios';
import {ContentCreatorContent, ContentRegistration, Subscriber, Thread} from "types";
import {API_BASE_URL} from "@/constants.ts";
import {getUser} from "@/utils";


// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

apiClient.interceptors.request.use((config) => {
  const token = getUser()?.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor (Optional: Handle Expired Token)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired, logging out...");
      AuthAPI.logout()
    }
    return Promise.reject(error);
  }
);

// Helper function to handle errors
const handleError = (error: AxiosError) => {
  if (error.response) {
    // Server responded with a status code outside 2xx
    throw new Error((error.response?.data as { error: string })?.error || (error.response?.data as {
      message: string
    })?.message || 'Something went wrong');
  } else if (error.request) {
    // Request was made but no response was received
    throw new Error('No response received from the server');
  } else {
    // Something happened in setting up the request
    throw new Error('Error setting up the request');
  }
};

// AuthPage API
export const AuthAPI = {
  login: async (email: string, password: string): Promise<{ token: string }> => {
    try {
      const response: AxiosResponse<{ token: string, role: string, email: string }> = await apiClient.post('/login', {
        email,
        password,
      });

      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));


      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error; // Re-throw the error after handling
    }
  },
  logout: () => {
    localStorage.removeItem("user"); // Clear user
    window.location.href = "/auth"; // Redirect to login page
  }
};

export const ContentCreatorAPI = {
  create: async (email: string, password: string): Promise<void> => {
    try {
      const response: AxiosResponse<void> = await apiClient.post('/register', {
        email,
        password,
        role: 'content-creator',
      });
    } catch (error) {
      error instanceof AxiosError && handleError(error);
      throw error;
    }
  },

  listContents: async (): Promise<ContentCreatorContent[]> => {
    try {
      const response: AxiosResponse<ContentCreatorContent[]> = await apiClient.get('/content-creators/contents');
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  listSubscribers: async (contentId: number): Promise<Subscriber[]> => {
    try {
      const response: AxiosResponse<Subscriber[]> = await apiClient.get(`/content-creators/contents/${contentId}/subscribers`);
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  removeSubscriber: async (contentId: number, subscriberId: number): Promise<{ message: string }> => {
    try {
      const response: AxiosResponse<{ message: string }> = await apiClient.delete(
        `/content-creators/contents/${contentId}/subscribers/${subscriberId}/remove`
      );
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },
};

// Subscriber API
export const SubscriberAPI = {
  create: async (email: string, password: string): Promise<void> => {
    try {
      const response: AxiosResponse<Subscriber> = await apiClient.post('/register', {
        email,
        password,
        role: 'subscriber'
      });
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  listSubscriptions: async (): Promise<ContentRegistration[]> => {
    try {
      const response: AxiosResponse<ContentRegistration[]> = await apiClient.get('/subscribers/subscriptions');
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },
};

// Content API
export const ContentAPI = {
  create: async (isPublic: boolean, files: File[]): Promise<ContentCreatorContent> => {
    try {
      const formData = new FormData();
      formData.append('isPublic', JSON.stringify(isPublic));
      files.forEach((file) => formData.append('files', file));

      const response: AxiosResponse<ContentCreatorContent> = await apiClient.post('/contents/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  update: async (contentId: number, isPublic: boolean, sharingId: string | null, ready: boolean): Promise<ContentCreatorContent> => {
    try {
      const response: AxiosResponse<ContentCreatorContent> = await apiClient.put(`/contents/${contentId}`, {
        isPublic,
        sharingId,
        ready,
      });
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  register: async (contentId: number): Promise<ContentRegistration> => {
    try {
      const response: AxiosResponse<ContentRegistration> = await apiClient.post(`/contents/${contentId}/register`);
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  unregister: async (contentId: number): Promise<{ message: string }> => {
    try {
      const response: AxiosResponse<{ message: string }> = await apiClient.delete(`/contents/${contentId}/unregister`);
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },
};

// Thread API
export const ThreadAPI = {
  create: async (
    contentId: number,
    messages: Array<{ role: string; content: string }>,
    metaInfo: Record<string, any>,
    generateCompletion: boolean
  ): Promise<Thread & { assistantResponse?: string }> => {
    try {
      const response: AxiosResponse<Thread & { assistantResponse?: string }> = await apiClient.post('/threads/create', {
        contentId,
        messages,
        metaInfo,
        generateCompletion,
      });
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  update: async (
    threadId: number,
    messages: Array<{ role: string; content: string }>,
    metaInfo: Record<string, any>,
    generateCompletion: boolean,
    append: boolean = false // Default to false if not provided
  ): Promise<Thread & { assistantResponse?: string }> => {
    try {
      const response: AxiosResponse<Thread & { assistantResponse?: string }> = await apiClient.put(`/threads/${threadId}`, {
        messages,
        metaInfo,
        generateCompletion,
        append,
      });
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  get: async (threadId: number, generateCompletion: boolean): Promise<Thread> => {
    try {
      const response: AxiosResponse<Thread> = await apiClient.get(`/threads/${threadId}`, {
        params: {generateCompletion},
      });
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },

  delete: async (threadId: number): Promise<{ message: string }> => {
    try {
      const response: AxiosResponse<{ message: string }> = await apiClient.delete(`/threads/${threadId}`);
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },
};

// Public Content API
export const PublicContentAPI = {
  list: async (): Promise<ContentCreatorContent[]> => {
    try {
      const response: AxiosResponse<ContentCreatorContent[]> = await apiClient.get('/public-contents');
      return response.data;
    } catch (error) {
      handleError(error as AxiosError);
      throw error;
    }
  },
};