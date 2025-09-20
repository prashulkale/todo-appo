
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
// If using TypeScript, ensure @types/node and @types/socket.io are installed for type support
import { WebSocketEvents, Task, User } from '../types';
import * as db from './database';

let io: SocketIOServer | null = null;
const connectedUsers: Map<string, string> = new Map(); // socketId -> userId

 export function initWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });
  setupEventHandlers();
}

function setupEventHandlers() {
  if (!io) return;
  io.on('connection', (socket: any) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle user joining
  socket.on('user_join', (data: { sessionId: string }) => {
      const user = db.getUserBySession(data.sessionId);
      if (user) {
        connectedUsers.set(socket.id, user.id);
        socket.data.user = user;
        socket.join(`user_${user.id}`);
        socket.emit(WebSocketEvents.USER_JOINED, { user });
        console.log(`User ${user.username} joined`);
      } else {
        socket.emit('error', { message: 'Invalid session' });
      }
    });

    // Handle user leaving
  socket.on('disconnect', () => {
      const userId = connectedUsers.get(socket.id);
      if (userId) {
        const user = db.getUserById(userId);
        if (user) {
          console.log(`User ${user.username} disconnected`);
          socket.emit(WebSocketEvents.USER_LEFT, { user });
        }
        connectedUsers.delete(socket.id);
      }
    });

    // Handle task updates
  socket.on('task_update_request', (data: { taskId: string; updates: Partial<Task> }) => {
      console.log(`Task update request for task ${data.taskId}`);
    });
  });
}

export function broadcastTaskCreated(task: Task): void {
  if (io) {
    io.emit(WebSocketEvents.TASK_CREATED, { task });
    console.log(`Broadcasted task_created: ${task.title}`);
  }
}

export function broadcastTaskUpdated(task: Task): void {
  if (io) {
    io.emit(WebSocketEvents.TASK_UPDATED, { task });
    console.log(`Broadcasted task_updated: ${task.title}`);
  }
}

export function broadcastTaskDeleted(taskId: string): void {
  if (io) {
    io.emit(WebSocketEvents.TASK_DELETED, { taskId });
    console.log(`Broadcasted task_deleted: ${taskId}`);
  }
}

export function notifyUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
}

export function getConnectedUsersCount(): number {
  return io ? io.sockets.sockets.size : 0;
}

export function getConnectedUsers(): User[] {
  const users: User[] = [];
  if (io) {
    io.sockets.sockets.forEach((socket: any) => {
      if (socket.data.user) {
        users.push(socket.data.user);
      }
    });
  }
  return users;
}

export function getIO(): SocketIOServer | null {
  return io;
}
