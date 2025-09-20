import { Router } from 'express';
import { CreateTaskSchema, UpdateTaskSchema } from '../types';
import { validateRequest } from '../lib/validation';
import { authenticateUser } from '../lib/auth';
import * as taskHandlers from '../handlers/taskHandlers';

const router = Router();

// All task routes require authentication
router.use(authenticateUser);

// Task CRUD operations
router.post(
  '/',
  validateRequest({ body: CreateTaskSchema }),
  taskHandlers.createTask
);

router.get(
  '/',
  taskHandlers.getAllTasks
);

router.get(
  '/my-tasks',
  taskHandlers.getMyTasks
);

router.get(
  '/blocked',
  taskHandlers.getBlockedTasks
);

router.get(
  '/:id',
  validateRequest({ params: { id: { type: 'string' } } }),
  taskHandlers.getTaskById
);

router.put(
  '/:id',
  validateRequest({ 
    params: { id: { type: 'string' } },
    body: UpdateTaskSchema 
  }),
  taskHandlers.updateTask
);

router.delete(
  '/:id',
  validateRequest({ params: { id: { type: 'string' } } }),
  taskHandlers.deleteTask
);

router.patch(
  '/:id/complete',
  validateRequest({ params: { id: { type: 'string' } } }),
  taskHandlers.markTaskAsComplete
);

router.get(
  '/:id/dependencies',
  validateRequest({ params: { id: { type: 'string' } } }),
  taskHandlers.getTaskDependencies
);

export default router;
