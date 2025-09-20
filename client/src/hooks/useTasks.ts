'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from './useWebSocket';
import { apiClient } from '@/lib/api-client';
import { Task, User, TaskFilters, TaskSortOptions, CreateTask, UpdateTask } from '@/types';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

// SWR fetchers
const fetchers = {
  users: () => apiClient.getAllUsers().then(res => res.data || []),
  tasks: () => apiClient.getAllTasks().then(res => res.data || []),
  myTasks: () => apiClient.getMyTasks().then(res => res.data || []),
  blockedTasks: () => apiClient.getBlockedTasks().then(res => res.data || []),
  currentUser: () => apiClient.getCurrentUser().then(res => res.data),
  userStats: () => apiClient.getUserStats().then(res => res.data),
};

// SWR mutators
const mutators = {
  createTask: async (url: string, { arg }: { arg: CreateTask }) => {
    const response = await apiClient.createTask(arg);
    if (!response.success) throw new Error(response.message || 'Failed to create task');
    return response.data;
  },
  updateTask: async (url: string, { arg }: { arg: { id: string; updates: UpdateTask } }) => {
    const response = await apiClient.updateTask(arg.id, arg.updates);
    if (!response.success) throw new Error(response.message || 'Failed to update task');
    return response.data;
  },
  deleteTask: async (url: string, { arg }: { arg: string }) => {
    const response = await apiClient.deleteTask(arg);
    if (!response.success) throw new Error(response.message || 'Failed to delete task');
    return response.data;
  },
  markTaskAsComplete: async (url: string, { arg }: { arg: string }) => {
    const response = await apiClient.markTaskAsComplete(arg);
    if (!response.success) throw new Error(response.message || 'Failed to mark task as complete');
    return response.data;
  },
};

export const useTasks = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected, on, off } = useWebSocket();

  // Data fetching with SWR
  const { data: users = [], error: usersError, mutate: mutateUsers } = useSWR(
    isAuthenticated ? 'users' : null,
    fetchers.users,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const { data: tasks = [], error: tasksError, mutate: mutateTasks } = useSWR(
    isAuthenticated ? 'tasks' : null,
    fetchers.tasks,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const { data: myTasks = [], error: myTasksError, mutate: mutateMyTasks } = useSWR(
    isAuthenticated && user ? 'myTasks' : null,
    fetchers.myTasks,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const { data: blockedTasks = [], error: blockedTasksError, mutate: mutateBlockedTasks } = useSWR(
    isAuthenticated ? 'blockedTasks' : null,
    fetchers.blockedTasks,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Mutations
  const { trigger: createTask, isMutating: isCreatingTask } = useSWRMutation(
    'tasks',
    mutators.createTask,
    {
      onSuccess: () => {
        mutateTasks();
        mutateMyTasks();
        mutateBlockedTasks();
        toast.success('Task created successfully');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  const { trigger: updateTask, isMutating: isUpdatingTask } = useSWRMutation(
    'tasks',
    mutators.updateTask,
    {
      onSuccess: () => {
        mutateTasks();
        mutateMyTasks();
        mutateBlockedTasks();
        toast.success('Task updated successfully');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  const { trigger: deleteTask, isMutating: isDeletingTask } = useSWRMutation(
    'tasks',
    mutators.deleteTask,
    {
      onSuccess: () => {
        mutateTasks();
        mutateMyTasks();
        mutateBlockedTasks();
        toast.success('Task deleted successfully');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  const { trigger: markTaskAsComplete, isMutating: isCompletingTask } = useSWRMutation(
    'tasks',
    mutators.markTaskAsComplete,
    {
      onSuccess: () => {
        mutateTasks();
        mutateMyTasks();
        mutateBlockedTasks();
        toast.success('Task marked as complete');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  // WebSocket event handlers
  const handleTaskCreated = useCallback((data: { task: Task }) => {
    mutateTasks();
    mutateMyTasks();
    mutateBlockedTasks();
    toast.success(`New task: ${data.task.title}`);
  }, [mutateTasks, mutateMyTasks, mutateBlockedTasks]);

  const handleTaskUpdated = useCallback((data: { task: Task }) => {
    mutateTasks();
    mutateMyTasks();
    mutateBlockedTasks();
  }, [mutateTasks, mutateMyTasks, mutateBlockedTasks]);

  const handleTaskDeleted = useCallback((data: { taskId: string }) => {
    mutateTasks();
    mutateMyTasks();
    mutateBlockedTasks();
  }, [mutateTasks, mutateMyTasks, mutateBlockedTasks]);

  // Set up WebSocket listeners
  useCallback(() => {
    if (!socket || !isConnected) return;

    on(WebSocketEvents.TASK_CREATED, handleTaskCreated);
    on(WebSocketEvents.TASK_UPDATED, handleTaskUpdated);
    on(WebSocketEvents.TASK_DELETED, handleTaskDeleted);

    return () => {
      off(WebSocketEvents.TASK_CREATED, handleTaskCreated);
      off(WebSocketEvents.TASK_UPDATED, handleTaskUpdated);
      off(WebSocketEvents.TASK_DELETED, handleTaskDeleted);
    };
  }, [socket, isConnected, on, off, handleTaskCreated, handleTaskUpdated, handleTaskDeleted]);

  // Filter and sort functions
  const getFilteredAndSortedTasks = useCallback((
    filters: TaskFilters = {},
    sortOptions: TaskSortOptions = { field: 'createdAt', direction: 'desc' }
  ) => {
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
  }, [tasks]);

  // Utility functions
  const canMarkTaskAsDone = useCallback((task: Task): boolean => {
    return task.dependencies.every(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status === 'Done';
    });
  }, [tasks]);

  const getTaskDependencies = useCallback((taskId: string): Task[] => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return [];

    return task.dependencies
      .map(depId => tasks.find(t => t.id === depId))
      .filter((task): task is Task => task !== undefined);
  }, [tasks]);

  const getTasksDependingOn = useCallback((taskId: string): Task[] => {
    return tasks.filter(task => task.dependencies.includes(taskId));
  }, [tasks]);

  // Loading states
  const isLoading = !tasks && !tasksError;
  const isMutating = isCreatingTask || isUpdatingTask || isDeletingTask || isCompletingTask;

  return {
    // Data
    tasks,
    users,
    myTasks,
    blockedTasks,
    
    // Loading states
    isLoading,
    isMutating,
    isConnected,
    
    // Errors
    tasksError,
    usersError,
    myTasksError,
    blockedTasksError,
    
    // Mutations
    createTask,
    updateTask,
    deleteTask,
    markTaskAsComplete,
    
    // Utility functions
    getFilteredAndSortedTasks,
    canMarkTaskAsDone,
    getTaskDependencies,
    getTasksDependingOn,
    
    // Cache management
    mutateTasks,
    mutateUsers,
    mutateMyTasks,
    mutateBlockedTasks,
  };
};
