import { Request, Response } from 'express';
import { CreateUserSchema, LoginUserSchema } from '../types';
import * as database from '../lib/database';
import { asyncHandler } from '../lib/validation';

/**
 * User handlers with function-based approach
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const userData = req.body;
  
  const existingUser = database.getUserByUsername(userData.username);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'User already exists',
      message: 'A user with this username already exists',
    });
  }

  const user = database.createUser(userData);
  const sessionId = database.createUserSession(user.id);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      sessionId,
    },
    message: 'User created successfully',
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.body;
  
  const user = database.getUserByUsername(username);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      message: 'No user found with this username',
    });
  }

  const sessionId = database.createUserSession(user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      sessionId,
    },
    message: 'Login successful',
  });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = database.getAllUsers();
  
  res.json({
    success: true,
    data: users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    })),
    message: 'Users retrieved successfully',
  });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  
  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
    message: 'User profile retrieved successfully',
  });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.sessionId!;
  
  database.removeUserSession(sessionId);

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const userTasks = database.getTasksByUserId(user.id);
  const stats = database.getStats();

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      taskStats: {
        total: userTasks.length,
        byStatus: {
          'To Do': userTasks.filter(t => t.status === 'To Do').length,
          'In Progress': userTasks.filter(t => t.status === 'In Progress').length,
          'Done': userTasks.filter(t => t.status === 'Done').length,
        },
      },
      globalStats: stats,
    },
    message: 'User statistics retrieved successfully',
  });
});
