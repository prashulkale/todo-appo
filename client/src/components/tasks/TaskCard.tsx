'use client';

import { Task } from '@/types';
import { Draggable } from 'react-beautiful-dnd';
import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Flag,
} from 'lucide-react';
import { getPriorityColor, getStatusColor, formatRelativeTime, getUserInitials } from '@/lib/utils';
import TaskModal from './TaskModal';

interface TaskCardProps {
  task: Task;
  index: number;
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const { users, updateTask, deleteTask, markTaskAsComplete, canMarkTaskAsDone } = useTasks();
  const { user: currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const assignedUser = users.find(u => u.id === task.assignedUserId);
  const isAssignedToMe = task.assignedUserId === currentUser?.id;
  const canMarkAsDone = canMarkTaskAsDone(task);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask(task.id, { status: newStatus as any });
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      await markTaskAsComplete(task.id);
      toast.success('Task marked as complete');
    } catch (error) {
      toast.error('Cannot mark task as complete - dependencies not met');
    }
  };

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
            }`}
            onClick={() => setShowModal(true)}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                  {task.title}
                </h4>
                <div className="flex items-center space-x-1 ml-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    <Flag className="w-3 h-3 mr-1" />
                    {task.priority}
                  </span>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowModal(true);
                              setShowMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Task
                          </button>
                          {task.status !== 'Done' && canMarkAsDone && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsComplete();
                                setShowMenu(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Complete
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete();
                              setShowMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Task
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Status */}
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                {task.dependencies.length > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {task.dependencies.length} dependency{task.dependencies.length !== 1 ? 'ies' : 'y'}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  {assignedUser ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center mr-1">
                        <span className="text-xs text-white font-medium">
                          {getUserInitials(assignedUser.username)}
                        </span>
                      </div>
                      <span>{assignedUser.username}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400">
                      <User className="w-3 h-3 mr-1" />
                      Unassigned
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatRelativeTime(task.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={task}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
