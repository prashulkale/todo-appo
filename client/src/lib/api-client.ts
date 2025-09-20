import { ApiResponse, User, Task, CreateUser, LoginUser, CreateTask, UpdateTask } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Enhanced API client with caching and error handling
 */
class ApiClient {
  private baseURL: string;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getCacheKey = (endpoint: string, params?: any): string => {
    return `${endpoint}${params ? `_${JSON.stringify(params)}` : ''}`;
  };

  private getFromCache = (key: string): any | null => {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  };

  private setCache = (key: string, data: any, ttl: number = this.defaultTTL): void => {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  };

  private invalidateCache = (pattern: string): void => {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  };

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false,
    cacheTTL?: number
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint, options.body);
    
    // Check cache for GET requests
    if (useCache && options.method === 'GET' || !options.method) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if session exists
    const sessionId = this.getSessionId();
    if (sessionId) {
      defaultHeaders.Authorization = `Bearer ${sessionId}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Cache successful GET requests
      if (useCache && (options.method === 'GET' || !options.method)) {
        this.setCache(cacheKey, data, cacheTTL);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sessionId');
  }

  private setSessionId(sessionId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sessionId', sessionId);
  }

  private clearSessionId(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('sessionId');
  }

  // User endpoints
  createUser = async (userData: CreateUser): Promise<ApiResponse<{ user: User; sessionId: string }>> => {
    const response = await this.request<{ user: User; sessionId: string }>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.sessionId) {
      this.setSessionId(response.data.sessionId);
      this.invalidateCache('/api/users');
    }

    return response;
  };

  loginUser = async (loginData: LoginUser): Promise<ApiResponse<{ user: User; sessionId: string }>> => {
    const response = await this.request<{ user: User; sessionId: string }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    if (response.success && response.data?.sessionId) {
      this.setSessionId(response.data.sessionId);
      this.invalidateCache('/api/users');
    }

    return response;
  };

  getAllUsers = async (): Promise<ApiResponse<User[]>> => {
    return this.request<User[]>('/api/users', {}, true);
  };

  getCurrentUser = async (): Promise<ApiResponse<User>> => {
    return this.request<User>('/api/users/me', {}, true);
  };

  logoutUser = async (): Promise<ApiResponse<void>> => {
    const response = await this.request<void>('/api/users/logout', {
      method: 'POST',
    });

    if (response.success) {
      this.clearSessionId();
      this.cache.clear(); // Clear all cache on logout
    }

    return response;
  };

  getUserStats = async (): Promise<ApiResponse<any>> => {
    return this.request<any>('/api/users/stats', {}, true);
  };

  // Task endpoints
  createTask = async (taskData: CreateTask): Promise<ApiResponse<Task>> => {
    const response = await this.request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });

    if (response.success) {
      this.invalidateCache('/api/tasks');
    }

    return response;
  };

  getAllTasks = async (): Promise<ApiResponse<Task[]>> => {
    return this.request<Task[]>('/api/tasks', {}, true);
  };

  getTaskById = async (id: string): Promise<ApiResponse<Task>> => {
    return this.request<Task>(`/api/tasks/${id}`, {}, true);
  };

  updateTask = async (id: string, updates: UpdateTask): Promise<ApiResponse<Task>> => {
    const response = await this.request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (response.success) {
      this.invalidateCache('/api/tasks');
    }

    return response;
  };

  deleteTask = async (id: string): Promise<ApiResponse<void>> => {
    const response = await this.request<void>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });

    if (response.success) {
      this.invalidateCache('/api/tasks');
    }

    return response;
  };

  getMyTasks = async (): Promise<ApiResponse<Task[]>> => {
    return this.request<Task[]>('/api/tasks/my-tasks', {}, true);
  };

  getBlockedTasks = async (): Promise<ApiResponse<Task[]>> => {
    return this.request<Task[]>('/api/tasks/blocked', {}, true);
  };

  markTaskAsComplete = async (id: string): Promise<ApiResponse<Task>> => {
    const response = await this.request<Task>(`/api/tasks/${id}/complete`, {
      method: 'PATCH',
    });

    if (response.success) {
      this.invalidateCache('/api/tasks');
    }

    return response;
  };

  getTaskDependencies = async (id: string): Promise<ApiResponse<{ dependencies: Task[]; dependentTasks: Task[] }>> => {
    return this.request<{ dependencies: Task[]; dependentTasks: Task[] }>(`/api/tasks/${id}/dependencies`, {}, true);
  };

  // Health check
  healthCheck = async (): Promise<ApiResponse<{ message: string; timestamp: string }>> => {
    return this.request<{ message: string; timestamp: string }>('/health', {}, true, 30000); // 30 second cache
  };

  // Cache management
  clearCache = (): void => {
    this.cache.clear();
  };

  invalidatePattern = (pattern: string): void => {
    this.invalidateCache(pattern);
  };
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
