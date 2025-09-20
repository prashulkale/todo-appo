import { z } from 'zod';

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  createdAt: z.date(),
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
  createdAt: z.date(),
  updatedAt: z.date(),
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

// WebSocket event schemas
export const WebSocketEvents = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
} as const;

export type WebSocketEvent = typeof WebSocketEvents[keyof typeof WebSocketEvents];

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
