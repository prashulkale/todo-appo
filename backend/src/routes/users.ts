import { Router } from 'express';
import { CreateUserSchema, LoginUserSchema } from '../types';
import { validateRequest } from '../lib/validation';
import { authenticateUser } from '../lib/auth';
import * as userHandlers from '../handlers/userHandlers';

const router = Router();

// Public routes
router.post(
  '/register',
  validateRequest({ body: CreateUserSchema }),
  userHandlers.createUser
);

router.post(
  '/login',
  validateRequest({ body: LoginUserSchema }),
  userHandlers.loginUser
);

router.get(
  '/',
  userHandlers.getAllUsers
);

// Protected routes
router.get(
  '/me',
  authenticateUser,
  userHandlers.getCurrentUser
);

router.post(
  '/logout',
  authenticateUser,
  userHandlers.logoutUser
);

router.get(
  '/stats',
  authenticateUser,
  userHandlers.getUserStats
);

export default router;
