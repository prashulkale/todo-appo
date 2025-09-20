import { v4 as uuidv4 } from 'uuid';
import { User, Task, CreateUser, CreateTask, UpdateTask } from '../types';

/**
 * In-memory data store for the task manager
 * Implements singleton pattern for global state management
 */
class InMemoryStore {
  private static instance: InMemoryStore;
  private users: Map<string, User> = new Map();
  private tasks: Map<string, Task> = new Map();
  private userSessions: Map<string, string> = new Map(); // sessionId -> userId

  private constructor() {}

  public static getInstance(): InMemoryStore {
    if (!InMemoryStore.instance) {
      InMemoryStore.instance = new InMemoryStore();
    }
    return InMemoryStore.instance;
  }

  // User management
  public createUser(userData: CreateUser): User {
    const user: User = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email,
      createdAt: new Date(),
    };
    
    this.users.set(user.id, user);
    return user;
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public createUserSession(userId: string): string {
    const sessionId = uuidv4();
    this.userSessions.set(sessionId, userId);
    return sessionId;
  }

  public getUserBySession(sessionId: string): User | undefined {
    const userId = this.userSessions.get(sessionId);
    return userId ? this.getUserById(userId) : undefined;
  }

  public removeUserSession(sessionId: string): void {
    this.userSessions.delete(sessionId);
  }

  // Task management
  public createTask(taskData: CreateTask): Task {
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
    
    this.tasks.set(task.id, task);
    return task;
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  public getTasksByUserId(userId: string): Task[] {
    return Array.from(this.tasks.values()).filter(task => task.assignedUserId === userId);
  }

  public getBlockedTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(task => {
      if (task.status === 'Done') return false;
      
      return task.dependencies.some(depId => {
        const depTask = this.tasks.get(depId);
        return !depTask || depTask.status !== 'Done';
      });
    });
  }

  public updateTask(id: string, updates: UpdateTask): Task | undefined {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  public deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  public canMarkTaskAsDone(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId);
      return depTask && depTask.status === 'Done';
    });
  }

  public getTaskDependencies(taskId: string): Task[] {
    const task = this.tasks.get(taskId);
    if (!task) return [];

    return task.dependencies
      .map(depId => this.tasks.get(depId))
      .filter((task): task is Task => task !== undefined);
  }

  public getTasksDependingOn(taskId: string): Task[] {
    return Array.from(this.tasks.values()).filter(task => 
      task.dependencies.includes(taskId)
    );
  }

  // Utility methods
  public clearAll(): void {
    this.users.clear();
    this.tasks.clear();
    this.userSessions.clear();
  }

  public getStats() {
    return {
      totalUsers: this.users.size,
      totalTasks: this.tasks.size,
      activeSessions: this.userSessions.size,
      tasksByStatus: {
        'To Do': Array.from(this.tasks.values()).filter(t => t.status === 'To Do').length,
        'In Progress': Array.from(this.tasks.values()).filter(t => t.status === 'In Progress').length,
        'Done': Array.from(this.tasks.values()).filter(t => t.status === 'Done').length,
      },
    };
  }
}

export default InMemoryStore;
