
import { v4 as uuidv4 } from 'uuid';
import { User, Task, CreateUser, CreateTask, UpdateTask } from '../types';

// Internal state
const users: Map<string, User> = new Map();
const tasks: Map<string, Task> = new Map();
const userSessions: Map<string, string> = new Map();

// User operations
export function createUser(userData: CreateUser): User {
  const user: User = {
    id: uuidv4(),
    username: userData.username,
    email: userData.email,
    createdAt: new Date(),
  };
  users.set(user.id, user);
  return user;
}

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

export function getUserByUsername(username: string): User | undefined {
  return Array.from(users.values()).find(user => user.username === username);
}

export function getAllUsers(): User[] {
  return Array.from(users.values());
}

export function createUserSession(userId: string): string {
  const sessionId = uuidv4();
  userSessions.set(sessionId, userId);
  return sessionId;
}

export function getUserBySession(sessionId: string): User | undefined {
  const userId = userSessions.get(sessionId);
  return userId ? getUserById(userId) : undefined;
}

export function removeUserSession(sessionId: string): void {
  userSessions.delete(sessionId);
}

// Task operations
export function createTask(taskData: CreateTask): Task {
  const task: Task = {
    id: uuidv4(),
    title: taskData.title,
    description: taskData.description,
    priority: taskData.priority,
    status: taskData.status,
    assignedUserId: taskData.assignedUserId,
    dependencies: taskData.dependencies || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  tasks.set(task.id, task);
  return task;
}

export function getTaskById(id: string): Task | undefined {
  return tasks.get(id);
}

export function getAllTasks(): Task[] {
  return Array.from(tasks.values());
}

export function getTasksByUserId(userId: string): Task[] {
  return Array.from(tasks.values()).filter(task => task.assignedUserId === userId);
}

export function getBlockedTasks(): Task[] {
  return Array.from(tasks.values()).filter((task: Task) => {
    if (task.status === 'Done') return false;
    return task.dependencies.some((depId: string) => {
      const depTask = tasks.get(depId);
      return !depTask || depTask.status !== 'Done';
    });
  });
}

export function updateTask(id: string, updates: UpdateTask): Task | undefined {
  const existingTask = tasks.get(id);
  if (!existingTask) return undefined;

  const updatedTask: any = {
    ...existingTask,
    ...updates,
    id,
    updatedAt: new Date(),
  };

  tasks.set(id, updatedTask);
  return updatedTask;
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id);
}

export function canMarkTaskAsDone(taskId: string): boolean {
  const task = tasks.get(taskId);
  if (!task) return false;

  return task.dependencies.every((depId: string) => {
    const depTask = tasks.get(depId);
    return depTask && depTask.status === 'Done';
  });
}

export function getTaskDependencies(taskId: string): Task[] {
  const task = tasks.get(taskId);
  if (!task) return [];

  return task.dependencies
    .map((depId: string) => tasks.get(depId))
    .filter((task: Task | undefined): task is Task => task !== undefined);
}

export function getTasksDependingOn(taskId: string): Task[] {
  return Array.from(tasks.values()).filter(task => 
    task.dependencies.includes(taskId)
  );
}

// Utility functions
export function clearAll(): void {
  users.clear();
  tasks.clear();
  userSessions.clear();
}

export function getStats() {
  return {
    totalUsers: users.size,
    totalTasks: tasks.size,
    activeSessions: userSessions.size,
    tasksByStatus: {
      'To Do': Array.from(tasks.values()).filter(t => t.status === 'To Do').length,
      'In Progress': Array.from(tasks.values()).filter(t => t.status === 'In Progress').length,
      'Done': Array.from(tasks.values()).filter(t => t.status === 'Done').length,
    },
  };
}
