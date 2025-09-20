'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserSession } from '@/types';
import { apiService } from '@/services/api';
import { wsService } from '@/services/websocket';

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string) => Promise<void>;
  register: (username: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!sessionId;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSessionId = localStorage.getItem('sessionId');
        if (storedSessionId) {
          setSessionId(storedSessionId);
          
          // Verify session with backend
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            wsService.joinUserSession(storedSessionId);
          } else {
            // Invalid session, clear it
            localStorage.removeItem('sessionId');
            setSessionId(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('sessionId');
        setSessionId(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.loginUser({ username });
      
      if (response.success && response.data) {
        const { user: userData, sessionId: newSessionId } = response.data;
        setUser(userData);
        setSessionId(newSessionId);
        wsService.joinUserSession(newSessionId);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.createUser({ username, email });
      
      if (response.success && response.data) {
        const { user: userData, sessionId: newSessionId } = response.data;
        setUser(userData);
        setSessionId(newSessionId);
        wsService.joinUserSession(newSessionId);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (sessionId) {
        await apiService.logoutUser();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSessionId(null);
      localStorage.removeItem('sessionId');
      wsService.leaveUserSession();
    }
  };

  const refreshUser = async () => {
    try {
      if (sessionId) {
        const response = await apiService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    sessionId,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
