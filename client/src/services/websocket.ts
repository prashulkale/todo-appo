import { io, Socket } from 'socket.io-client';
import { WebSocketEvents, Task, User } from '@/types';

/**
 * WebSocket Service
 * Handles real-time communication with the backend
 */
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  private connect(): void {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    
    this.socket = io(wsUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      
      // Join user session if available
      const sessionId = this.getSessionId();
      if (sessionId) {
        this.joinUserSession(sessionId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
      this.handleReconnect();
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect in ${delay}ms...`);
      
      setTimeout(() => {
        this.socket?.connect();
      }, delay);
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
   * Join user session
   */
  public joinUserSession(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('user_join', { sessionId });
    }
  }

  /**
   * Leave user session
   */
  public leaveUserSession(): void {
    if (this.socket?.connected) {
      this.socket.emit('user_leave');
    }
  }

  /**
   * Listen for task events
   */
  public onTaskCreated(callback: (data: { task: Task }) => void): void {
    this.socket?.on(WebSocketEvents.TASK_CREATED, callback);
  }

  public onTaskUpdated(callback: (data: { task: Task }) => void): void {
    this.socket?.on(WebSocketEvents.TASK_UPDATED, callback);
  }

  public onTaskDeleted(callback: (data: { taskId: string }) => void): void {
    this.socket?.on(WebSocketEvents.TASK_DELETED, callback);
  }

  /**
   * Listen for user events
   */
  public onUserJoined(callback: (data: { user: User }) => void): void {
    this.socket?.on(WebSocketEvents.USER_JOINED, callback);
  }

  public onUserLeft(callback: (data: { user: User }) => void): void {
    this.socket?.on(WebSocketEvents.USER_LEFT, callback);
  }

  /**
   * Remove event listeners
   */
  public offTaskCreated(callback?: (data: { task: Task }) => void): void {
    this.socket?.off(WebSocketEvents.TASK_CREATED, callback);
  }

  public offTaskUpdated(callback?: (data: { task: Task }) => void): void {
    this.socket?.off(WebSocketEvents.TASK_UPDATED, callback);
  }

  public offTaskDeleted(callback?: (data: { taskId: string }) => void): void {
    this.socket?.off(WebSocketEvents.TASK_DELETED, callback);
  }

  public offUserJoined(callback?: (data: { user: User }) => void): void {
    this.socket?.off(WebSocketEvents.USER_JOINED, callback);
  }

  public offUserLeft(callback?: (data: { user: User }) => void): void {
    this.socket?.off(WebSocketEvents.USER_LEFT, callback);
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (!this.socket) return 'disconnected';
    
    if (this.socket.connected) return 'connected';
    // if (this.socket.connecting) return 'connecting';
    return 'error';
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Reconnect to WebSocket server
   */
  public reconnect(): void {
    this.disconnect();
    this.connect();
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
export default wsService;
