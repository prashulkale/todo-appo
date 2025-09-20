'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TaskContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TaskBoard from '@/components/tasks/TaskBoard';
import { Loader2 } from 'lucide-react';

export default function MyTasksPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { getMyTasks } = useTasks();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const myTasks = getMyTasks(user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Tasks
              </h1>
              <p className="text-gray-600 mt-1">
                Tasks assigned to you ({myTasks.length} total)
              </p>
            </div>
          </div>
        </div>

        {/* Task Board */}
        <TaskBoard />
      </div>
    </DashboardLayout>
  );
}
