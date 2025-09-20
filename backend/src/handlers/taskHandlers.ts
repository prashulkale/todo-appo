import { Request, Response } from 'express';
import { CreateTaskSchema, UpdateTaskSchema } from '../types';
import * as database from '../lib/database';
import { asyncHandler } from '../lib/validation';
import * as websocket from '../lib/websocket';

/**
 * Task handlers with function-based approach
 */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const taskData = req.body;

  // Validate dependencies exist
  if (taskData.dependencies && taskData.dependencies.length > 0) {
    for (const depId of taskData.dependencies) {
  const depTask = database.getTaskById(depId);
      if (!depTask) {
        return res.status(400).json({
          success: false,
          error: 'Invalid dependency',
          message: `Dependency task with ID ${depId} does not exist`,
        });
      }
    }
  }

  // Validate assigned user exists
  if (taskData.assignedUserId) {
  const assignedUser = database.getUserById(taskData.assignedUserId);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assigned user',
        message: 'Assigned user does not exist',
      });
    }
  }

  const task = database.createTask(taskData);

  // Broadcast task creation via WebSocket
  // Broadcast task creation via WebSocket
  websocket.broadcastTaskCreated(task);

  res.status(201).json({
    success: true,
    data: task,
    message: 'Task created successfully',
  });
});

export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = database.getAllTasks();
  
  res.json({
    success: true,
    data: tasks,
    message: 'Tasks retrieved successfully',
  });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  
  const task = database.getTaskById(id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
      message: 'No task found with this ID',
    });
  }

  const dependencies = database.getTaskDependencies(id);
  const dependentTasks = database.getTasksDependingOn(id);

  res.json({
    success: true,
    data: {
      ...task,
      dependencies,
      dependentTasks,
    },
    message: 'Task retrieved successfully',
  });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const updates = req.body;

  const existingTask = database.getTaskById(id) 
  if (!existingTask) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
      message: 'No task found with this ID',
    });
  }

  // Validate dependencies exist
  if (updates.dependencies && updates.dependencies.length > 0) {
    for (const depId of updates.dependencies) {
  const depTask = database.getTaskById(depId);
      if (!depTask) {
        return res.status(400).json({
          success: false,
          error: 'Invalid dependency',
          message: `Dependency task with ID ${depId} does not exist`,
        });
      }
    }
  }

  // Validate assigned user exists
  if (updates.assignedUserId) {
  const assignedUser = database.getUserById(updates.assignedUserId);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assigned user',
        message: 'Assigned user does not exist',
      });
    }
  }

  // Check if trying to mark as done with incomplete dependencies
  if (updates.status === 'Done') {
  const canMarkAsDone = database.canMarkTaskAsDone(id);
    if (!canMarkAsDone) {
      return res.status(400).json({
        success: false,
        error: 'Cannot mark as done',
        message: 'Task cannot be marked as done because dependencies are not complete',
      });
    }
  }

  const updatedTask = database.updateTask(id, updates);
  if (!updatedTask) {
    return res.status(500).json({
      success: false,
      error: 'Update failed',
      message: 'Failed to update task',
    });
  }

  // Broadcast task update via WebSocket
  websocket.broadcastTaskUpdated(updatedTask);

  res.json({
    success: true,
    data: updatedTask,
    message: 'Task updated successfully',
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const task = database.getTaskById(id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
      message: 'No task found with this ID',
    });
  }

  // Check if other tasks depend on this task
  const dependentTasks = database.getTasksDependingOn(id);
  if (dependentTasks.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete task',
      message: 'Cannot delete task because other tasks depend on it',
    });
  }

  const deleted = database.deleteTask(id);
  if (!deleted) {
    return res.status(500).json({
      success: false,
      error: 'Delete failed',
      message: 'Failed to delete task',
    });
  }

  // Broadcast task deletion via WebSocket
  websocket.broadcastTaskDeleted(id as string);

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
});

export const getMyTasks = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = req.user!;
  const tasks = database.getTasksByUserId(currentUser.id);

  res.json({
    success: true,
    data: tasks,
    message: 'User tasks retrieved successfully',
  });
});

export const getBlockedTasks = asyncHandler(async (req: Request, res: Response) => {
  const blockedTasks = database.getBlockedTasks();

  res.json({
    success: true,
    data: blockedTasks,
    message: 'Blocked tasks retrieved successfully',
  });
});

export const markTaskAsComplete = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const task = database.getTaskById(id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
      message: 'No task found with this ID',
    });
  }

  const canMarkAsDone = database.canMarkTaskAsDone(id);
  if (!canMarkAsDone) {
    return res.status(400).json({
      success: false,
      error: 'Cannot mark as done',
      message: 'Task cannot be marked as done because dependencies are not complete',
    });
  }

  const updatedTask = database.updateTask(id, { status: 'Done' });
  if (!updatedTask) {
    return res.status(500).json({
      success: false,
      error: 'Update failed',
      message: 'Failed to mark task as complete',
    });
  }

  // Broadcast task update via WebSocket
  websocket.broadcastTaskUpdated(updatedTask);

  res.json({
    success: true,
    data: updatedTask,
    message: 'Task marked as complete successfully',
  });
});

export const getTaskDependencies = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const task = database.getTaskById(id);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
      message: 'No task found with this ID',
    });
  }

  const dependencies = database.getTaskDependencies(id);
  const dependentTasks = database.getTasksDependingOn(id);

  res.json({
    success: true,
    data: {
      dependencies,
      dependentTasks,
    },
    message: 'Task dependencies retrieved successfully',
  });
});
