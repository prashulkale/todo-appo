'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TaskContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Loader2, Users, Mail, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function TeamPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { users, tasks } = useTasks();
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
          <p className="text-gray-600">Loading team...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter(task => task.assignedUserId === userId);
    return {
      total: userTasks.length,
      todo: userTasks.filter(t => t.status === 'To Do').length,
      inProgress: userTasks.filter(t => t.status === 'In Progress').length,
      done: userTasks.filter(t => t.status === 'Done').length,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Team Members
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your team and view member statistics
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total members</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const stats = getUserStats(user.id);
            return (
              <div key={user.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {formatDate(user.createdAt)}
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Task Statistics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To Do:</span>
                        <span className="font-medium text-gray-500">{stats.todo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">In Progress:</span>
                        <span className="font-medium text-blue-600">{stats.inProgress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Done:</span>
                        <span className="font-medium text-green-600">{stats.done}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500">Team members will appear here once they register.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
