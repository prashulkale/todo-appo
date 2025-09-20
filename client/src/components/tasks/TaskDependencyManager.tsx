'use client';

import { useState, useEffect } from 'react';
import { Task, User } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, X, AlertTriangle, Link, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TaskDependencyManagerProps {
  task: Task;
  onClose: () => void;
  onUpdate: (dependencies: string[]) => void;
}

export default function TaskDependencyManager({ task, onClose, onUpdate }: TaskDependencyManagerProps) {
  const { tasks, users, getTaskDependencies, getTasksDependingOn } = useTasks();
  const { user: currentUser } = useAuth();
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(task.dependencies || []);
  const [searchTerm, setSearchTerm] = useState('');

  // Get available tasks (excluding current task and already selected dependencies)
  const availableTasks = tasks.filter(t => 
    t.id !== task.id && 
    !selectedDependencies.includes(t.id) &&
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current dependencies with full task data
  const currentDependencies = getTaskDependencies(task.id);
  const dependentTasks = getTasksDependingOn(task.id);

  const handleToggleDependency = (taskId: string) => {
    setSelectedDependencies(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSave = () => {
    onUpdate(selectedDependencies);
    onClose();
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'In Progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'To Do':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Manage Dependencies for "{task.title}"
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Dependencies */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Current Dependencies ({currentDependencies.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {currentDependencies.length > 0 ? (
                    currentDependencies.map((depTask) => (
                      <div
                        key={depTask.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{depTask.title}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(depTask.status)}`}>
                              {depTask.status}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskPriorityColor(depTask.priority)}`}>
                              {depTask.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Created {formatDate(depTask.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleDependency(depTask.id)}
                          className="ml-2 p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No dependencies selected
                    </p>
                  )}
                </div>
              </div>

              {/* Available Tasks */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Available Tasks ({availableTasks.length})
                </h4>
                
                {/* Search */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableTasks.length > 0 ? (
                    availableTasks.map((availableTask) => (
                      <div
                        key={availableTask.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleToggleDependency(availableTask.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{availableTask.title}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(availableTask.status)}`}>
                              {availableTask.status}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTaskPriorityColor(availableTask.priority)}`}>
                              {availableTask.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Created {formatDate(availableTask.createdAt)}
                          </p>
                        </div>
                        <button className="ml-2 p-1 text-blue-600 hover:text-blue-800">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {searchTerm ? 'No tasks found matching search' : 'No available tasks'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dependent Tasks Warning */}
            {dependentTasks.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <h5 className="text-sm font-medium text-yellow-800">
                      Warning: Other tasks depend on this task
                    </h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      {dependentTasks.length} task(s) depend on this task. Changing dependencies may affect their completion status.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={onClose}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary btn-sm"
              >
                Save Dependencies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
