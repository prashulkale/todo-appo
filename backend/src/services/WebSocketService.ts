import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { WebSocketEvents, Task, User } from '../types';
import InMemoryStore from './InMemoryStore';

/**
 * WebSocket Service
 * Handles real-time communication using Socket.IO
 */
export class WebSocketService {
  private io: SocketIOServer;
  private store: InMemoryStore;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    
    this.store = InMemoryStore.getInstance();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user joining
      socket.on('user_join', (data: { sessionId: string }) => {
        const user = this.store.getUserBySession(data.sessionId);
        if (user) {
          socket.data.user = user;
          socket.join(`user_${user.id}`);
          socket.emit(WebSocketEvents.USER_JOINED, { user });
          console.log(`User ${user.username} joined`);
        }
      });

      // Handle user leaving
      socket.on('disconnect', () => {
        if (socket.data.user) {
          console.log(`User ${socket.data.user.username} disconnected`);
          socket.emit(WebSocketEvents.USER_LEFT, { user: socket.data.user });
        }
      });

      // Handle task updates
      socket.on('task_update_request', (data: { taskId: string; updates: Partial<Task> }) => {
        // This could be used for collaborative editing in the future
        console.log(`Task update request for task ${data.taskId}`);
      });
    });
  }

  /**
   * Broadcast task creation to all connected clients
   */
  public broadcastTaskCreated(task: Task): void {
    this.io.emit(WebSocketEvents.TASK_CREATED, { task });
    console.log(`Broadcasted task_created: ${task.title}`);
  }

  /**
   * Broadcast task update to all connected clients
   */
  public broadcastTaskUpdated(task: Task): void {
    this.io.emit(WebSocketEvents.TASK_UPDATED, { task });
    console.log(`Broadcasted task_updated: ${task.title}`);
  }

  /**
   * Broadcast task deletion to all connected clients
   */
  public broadcastTaskDeleted(taskId: string): void {
    this.io.emit(WebSocketEvents.TASK_DELETED, { taskId });
    console.log(`Broadcasted task_deleted: ${taskId}`);
  }

  /**
   * Send notification to specific user
   */
  public notifyUser(userId: string, event: string, data: any): void {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.io.sockets.sockets.size;
  }

  /**
   * Get all connected users
   */
  public getConnectedUsers(): User[] {
    const users: User[] = [];
    this.io.sockets.sockets.forEach((socket) => {
      if (socket.data.user) {
        users.push(socket.data.user);
      }
    });
    return users;
  }
}

export default WebSocketService;
