'use client';

import { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskStatus, TaskPriority } from '@/types';
import { Filter, X, Search } from 'lucide-react';

interface TaskFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  sortOptions: any;
  setSortOptions: (options: any) => void;
  users: any[];
}

export default function TaskFilters({ filters, setFilters, sortOptions, setSortOptions, users }: TaskFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleStatusChange = (status: TaskStatus, checked: boolean) => {
    const currentStatuses = filters.status || [];
    if (checked) {
      setFilters({ ...filters, status: [...currentStatuses, status] });
    } else {
      setFilters({ ...filters, status: currentStatuses.filter(s => s !== status) });
    }
  };

  const handlePriorityChange = (priority: TaskPriority, checked: boolean) => {
    const currentPriorities = filters.priority || [];
    if (checked) {
      setFilters({ ...filters, priority: [...currentPriorities, priority] });
    } else {
      setFilters({ ...filters, priority: currentPriorities.filter(p => p !== priority) });
    }
  };

  const handleUserChange = (userId: string) => {
    setFilters({ ...filters, assignedUserId: userId || undefined });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof typeof filters];
    return Array.isArray(value) ? value.length > 0 : !!value;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filters & Sort</h3>
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showFilters ? 'Hide' : 'Show'} filters
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input w-full pl-10"
                placeholder="Search tasks by title or description..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {(['To Do', 'In Progress', 'Done'] as TaskStatus[]).map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => handleStatusChange(status, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="space-y-2">
                {(['Low', 'Medium', 'High'] as TaskPriority[]).map((priority) => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priority?.includes(priority) || false}
                      onChange={(e) => handlePriorityChange(priority, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{priority}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned User
              </label>
              <select
                value={filters.assignedUserId || ''}
                onChange={(e) => handleUserChange(e.target.value)}
                className="input w-full"
              >
                <option value="">All users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex space-x-4">
              <select
                value={sortOptions.field}
                onChange={(e) => setSortOptions({ ...sortOptions, field: e.target.value as any })}
                className="input flex-1"
              >
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
              </select>
              <select
                value={sortOptions.direction}
                onChange={(e) => setSortOptions({ ...sortOptions, direction: e.target.value as 'asc' | 'desc' })}
                className="input flex-1"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
