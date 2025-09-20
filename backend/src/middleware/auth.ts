import { Request, Response, NextFunction } from 'express';
import InMemoryStore from '../services/InMemoryStore';
import { User } from '../types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

/**
 * Authentication middleware
 * Validates user session and attaches user to request
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No session token provided',
      });
    }

    const store = InMemoryStore.getInstance();
    const user = store.getUserBySession(sessionId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired session',
      });
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'An error occurred during authentication',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if session exists, but doesn't require it
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    
    if (sessionId) {
      const store = InMemoryStore.getInstance();
      const user = store.getUserBySession(sessionId);
      
      if (user) {
        req.user = user;
        req.sessionId = sessionId;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if there's an error
    next();
  }
};
