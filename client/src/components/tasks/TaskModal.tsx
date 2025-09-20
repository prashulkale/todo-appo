'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, TaskPriority, TaskStatus, CreateTask, UpdateTask } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  X,
  Save,
  Trash2,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Flag,
  Link,
} from 'lucide-react';
import { formatDate, getUserInitials } from '@/lib/utils';
import TaskDependencyManager from './TaskDependencyManager';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['To Do', 'In Progress', 'Done']),
  assignedUserId: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const { users, updateTask, deleteTask, markTaskAsComplete, canMarkTaskAsDone, getTaskDependencies } = useTasks();
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDependencyManager, setShowDependencyManager] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedUserId: task.assignedUserId || '',
      dependencies: task.dependencies || [],
    },
  });

  const assignedUser = users.find(u => u.id === task.assignedUserId);
  const isAssignedToMe = task.assignedUserId === currentUser?.id;
  const canMarkAsDone = canMarkTaskAsDone(task);
  const dependencies = getTaskDependencies(task.id);

  useEffect(() => {
    if (isOpen) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        assignedUserId: task.assignedUserId || '',
        dependencies: task.dependencies || [],
      });
    }
  }, [task, isOpen, reset]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      await updateTask(task.id, data);
      toast.success('Task updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
        toast.success('Task deleted successfully');
        onClose();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      await markTaskAsComplete(task.id);
      onClose();
    } catch (error) {
      toast.error('Cannot mark task as complete - dependencies not met');
    }
  };

  const handleDependencyUpdate = async (newDependencies: string[]) => {
    try {
      await updateTask(task.id, { dependencies: newDependencies });
      setShowDependencyManager(false);
    } catch (error) {
      toast.error('Failed to update dependencies');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Task' : 'Task Details'}
              </h3>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    {...register('title')}
                    className="input w-full"
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="input w-full"
                    placeholder="Enter task description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select {...register('priority')} className="input w-full">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select {...register('status')} className="input w-full">
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned User
                  </label>
                  <select {...register('assignedUserId')} className="input w-full">
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-sm"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h4>
                  {task.description && (
                    <p className="text-gray-600">{task.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Priority</label>
                    <div className="flex items-center mt-1">
                      <Flag className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{task.priority}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{task.status}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Assigned To</label>
                  <div className="flex items-center mt-1">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    {assignedUser ? (
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center mr-2">
                          <span className="text-xs text-white font-medium">
                            {getUserInitials(assignedUser.username)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{assignedUser.username}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">Dependencies</label>
                  <div className="mt-1">
                    {dependencies.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Link className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {dependencies.length} dependency{dependencies.length !== 1 ? 'ies' : 'y'}
                            </span>
                          </div>
                          <button
                            onClick={() => setShowDependencyManager(true)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Manage
                          </button>
                        </div>
                        <div className="space-y-1">
                          {dependencies.map((dep) => (
                            <div key={dep.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {dep.title} ({dep.status})
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">No dependencies</span>
                        <button
                          onClick={() => setShowDependencyManager(true)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Add Dependencies
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatDate(task.createdAt)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Updated</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{formatDate(task.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    {task.status !== 'Done' && canMarkAsDone && (
                      <button
                        onClick={handleMarkAsComplete}
                        className="btn btn-success btn-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dependency Manager Modal */}
      {showDependencyManager && (
        <TaskDependencyManager
          task={task}
          onClose={() => setShowDependencyManager(false)}
          onUpdate={handleDependencyUpdate}
        />
      )}
    </div>
  );
}
