'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Task, User, TaskFilters, TaskSortOptions, TaskWithDetails } from '@/types';
import { apiService } from '@/services/api';
import { wsService } from '@/services/websocket';
import { useAuth } from './AuthContext';

interface TaskContextType {
  tasks: Task[];
  users: User[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  sortOptions: TaskSortOptions;
  setFilters: (filters: TaskFilters) => void;
  setSortOptions: (options: TaskSortOptions) => void;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  markTaskAsComplete: (id: string) => Promise<void>;
  getMyTasks: () => Task[];
  getBlockedTasks: () => Task[];
  getFilteredAndSortedTasks: () => Task[];
  refreshTasks: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortOptions, setSortOptions] = useState<TaskSortOptions>({
    field: 'createdAt',
    direction: 'desc',
  });

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  // Setup WebSocket listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleTaskCreated = (data: { task: Task }) => {
      setTasks(prev => [data.task, ...prev]);
    };

    const handleTaskUpdated = (data: { task: Task }) => {
      setTasks(prev => prev.map(task => 
        task.id === data.task.id ? data.task : task
      ));
    };

    const handleTaskDeleted = (data: { taskId: string }) => {
      setTasks(prev => prev.filter(task => task.id !== data.taskId));
    };

    wsService.onTaskCreated(handleTaskCreated);
    wsService.onTaskUpdated(handleTaskUpdated);
    wsService.onTaskDeleted(handleTaskDeleted);

    return () => {
      wsService.offTaskCreated(handleTaskCreated);
      wsService.offTaskUpdated(handleTaskUpdated);
      wsService.offTaskDeleted(handleTaskDeleted);
    };
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [tasksResponse, usersResponse] = await Promise.all([
        apiService.getAllTasks(),
        apiService.getAllUsers(),
      ]);

      if (tasksResponse.success && tasksResponse.data) {
        setTasks(tasksResponse.data);
      }

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTasks = useCallback(async () => {
    try {
      const response = await apiService.getAllTasks();
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh tasks');
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      const response = await apiService.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh users');
    }
  }, []);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createTask(taskData);
      if (response.success && response.data) {
        // Task will be added via WebSocket, but we can add it optimistically
        setTasks(prev => [response.data!, ...prev]);
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await apiService.updateTask(id, updates);
      if (response.success && response.data) {
        // Task will be updated via WebSocket, but we can update it optimistically
        setTasks(prev => prev.map(task => 
          task.id === id ? response.data! : task
        ));
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await apiService.deleteTask(id);
      if (response.success) {
        // Task will be removed via WebSocket, but we can remove it optimistically
        setTasks(prev => prev.filter(task => task.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  const markTaskAsComplete = async (id: string) => {
    try {
      const response = await apiService.markTaskAsComplete(id);
      if (response.success && response.data) {
        // Task will be updated via WebSocket, but we can update it optimistically
        setTasks(prev => prev.map(task => 
          task.id === id ? response.data! : task
        ));
      } else {
        throw new Error(response.message || 'Failed to mark task as complete');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark task as complete');
      throw err;
    }
  };

  const getMyTasks = useCallback((userId?: string) => {
    if (!userId) return [];
    return tasks.filter(task => task.assignedUserId === userId);
  }, [tasks]);

  const getBlockedTasks = useCallback(() => {
    return tasks.filter(task => {
      if (task.status === 'Done') return false;
      
      return task.dependencies.some(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return !depTask || depTask.status !== 'Done';
      });
    });
  }, [tasks]);

  const getFilteredAndSortedTasks = useCallback(() => {
    let filteredTasks = [...tasks];

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.status!.includes(task.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.priority!.includes(task.priority));
    }

    if (filters.assignedUserId) {
      filteredTasks = filteredTasks.filter(task => task.assignedUserId === filters.assignedUserId);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    filteredTasks.sort((a, b) => {
      const aVal = a[sortOptions.field];
      const bVal = b[sortOptions.field];
      
      if (aVal < bVal) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredTasks;
  }, [tasks, filters, sortOptions]);

  const value: TaskContextType = {
    tasks,
    users,
    isLoading,
    error,
    filters,
    sortOptions,
    setFilters,
    setSortOptions,
    createTask,
    updateTask,
    deleteTask,
    markTaskAsComplete,
    getMyTasks,
    getBlockedTasks,
    getFilteredAndSortedTasks,
    refreshTasks,
    refreshUsers,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
