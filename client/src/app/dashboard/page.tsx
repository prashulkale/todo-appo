'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskStats from '@/components/tasks/TaskStats';
import { useTasks } from '@/hooks/useTasks';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { tasks, users, isLoading: tasksLoading } = useTasks();
  const router = useRouter();
  const [filters, setFilters] = useState({});
  const [sortOptions, setSortOptions] = useState({ field: 'createdAt', direction: 'desc' });

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <DashboardLayout>
      <div className="   space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your tasks and collaborate with your team
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <TaskStats />

        {/* Filters */}
        <TaskFilters 
          filters={filters}
          setFilters={setFilters}
          sortOptions={sortOptions}
          setSortOptions={setSortOptions}
          users={users}
        />

        {/* Task Board */}
        <TaskBoard />
      </div>
    </DashboardLayout>
  );
}
