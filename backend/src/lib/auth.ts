import { Request, Response, NextFunction } from 'express';
import * as db from './database';
import { User } from '../types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

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

    const user = db.getUserBySession(sessionId);

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

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    
    if (sessionId) {
      const user = db.getUserBySession(sessionId);
      if (user) {
        req.user = user;
        req.sessionId = sessionId;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
