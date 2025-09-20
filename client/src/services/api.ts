import { ApiResponse, User, Task, CreateUser, LoginUser, CreateTask, UpdateTask, UserSession } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * API Service
 * Handles all HTTP requests to the backend
 */
class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
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

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Get session ID from localStorage
   */
  private getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('sessionId');
  }

  /**
   * Set session ID in localStorage
   */
  private setSessionId(sessionId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sessionId', sessionId);
  }

  /**
   * Clear session ID from localStorage
   */
  private clearSessionId(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('sessionId');
  }

  // User endpoints
  async createUser(userData: CreateUser): Promise<ApiResponse<{ user: User; sessionId: string }>> {
    const response = await this.request<{ user: User; sessionId: string }>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.sessionId) {
      this.setSessionId(response.data.sessionId);
    }

    return response;
  }

  async loginUser(loginData: LoginUser): Promise<ApiResponse<{ user: User; sessionId: string }>> {
    const response = await this.request<{ user: User; sessionId: string }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    if (response.success && response.data?.sessionId) {
      this.setSessionId(response.data.sessionId);
    }

    return response;
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/api/users');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/users/me');
  }

  async logoutUser(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/api/users/logout', {
      method: 'POST',
    });

    if (response.success) {
      this.clearSessionId();
    }

    return response;
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/users/stats');
  }

  // Task endpoints
  async createTask(taskData: CreateTask): Promise<ApiResponse<Task>> {
    return this.request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getAllTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>('/api/tasks');
  }

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/api/tasks/${id}`);
  }

  async updateTask(id: string, updates: UpdateTask): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>('/api/tasks/my-tasks');
  }

  async getBlockedTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>('/api/tasks/blocked');
  }

  async markTaskAsComplete(id: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/api/tasks/${id}/complete`, {
      method: 'PATCH',
    });
  }

  async getTaskDependencies(id: string): Promise<ApiResponse<{ dependencies: Task[]; dependentTasks: Task[] }>> {
    return this.request<{ dependencies: Task[]; dependentTasks: Task[] }>(`/api/tasks/${id}/dependencies`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return this.request<{ message: string; timestamp: string }>('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL);
export default apiService;
