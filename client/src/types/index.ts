import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });
export const LoginUserSchema = z.object({
  username: z.string().min(1),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;

// Task schemas
export const TaskPrioritySchema = z.enum(['Low', 'Medium', 'High']);
export const TaskStatusSchema = z.enum(['To Do', 'In Progress', 'Done']);

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: TaskPrioritySchema,
  status: TaskStatusSchema,
  assignedUserId: z.string().uuid().optional(),
  dependencies: z.array(z.string().uuid()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateTaskSchema = TaskSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// WebSocket events
export const WebSocketEvents = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
} as const;

export type WebSocketEvent = typeof WebSocketEvents[keyof typeof WebSocketEvents];

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// UI State types
export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedUserId?: string;
  dependencies: string[];
}

export interface UserSession {
  user: User;
  sessionId: string;
}

export interface TaskWithDetails extends Task {
  dependencies?: Task[];
  dependentTasks?: Task[];
  assignedUser?: User;
}

// Filter and sort types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedUserId?: string;
  search?: string;
}

export interface TaskSortOptions {
  field: 'title' | 'priority' | 'status' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// Drag and drop types
export interface DragItem {
  id: string;
  type: 'task';
  index: number;
}

export interface DropResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  reason: 'DROP' | 'CANCEL';
}
