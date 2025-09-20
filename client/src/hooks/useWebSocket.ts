'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WebSocketEvents, Task, User } from '@/types';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000,
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const eventListenersRef = useRef<Map<string, (data: any) => void>>(new Map());

  const connect = useCallback(() => {
    if (socket?.connected) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    
    const newSocket = io(wsUrl, {
      autoConnect: false,
      reconnection: false, // We'll handle reconnection manually
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
      
      // Join user session if available
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        newSocket.emit('user_join', { sessionId });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Attempt to reconnect if not manually disconnected
      if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < reconnectAttempts) {
        handleReconnect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
      handleReconnect();
    });

    // Re-attach event listeners
    eventListenersRef.current.forEach((callback, event) => {
      newSocket.on(event, callback);
    });

    newSocket.connect();
    setSocket(newSocket);
    setConnectionStatus('connecting');
  }, [socket, reconnectAttempts, reconnectDelay]);

  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      setConnectionStatus('error');
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms... (attempt ${reconnectAttemptsRef.current}/${reconnectAttempts})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, reconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  }, [socket]);

  const emit = useCallback((event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }, [socket]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    eventListenersRef.current.set(event, callback);
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (callback) {
      eventListenersRef.current.delete(event);
    }
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};
