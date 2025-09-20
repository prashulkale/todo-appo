'use client';

import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, Clock, Users, AlertTriangle } from 'lucide-react';

export default function TaskStats() {
  const { tasks, users } = useTasks();
  const { user } = useAuth();

  const myTasks = tasks.filter(task => task.assignedUserId === user?.id);
  const blockedTasks = tasks.filter(task => {
    if (task.status === 'Done') return false;
    return task.dependencies.some(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return !depTask || depTask.status !== 'Done';
    });
  });

  const stats = [
    {
      name: 'Total Tasks',
      value: tasks.length,
      icon: CheckSquare,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      name: 'My Tasks',
      value: myTasks.length,
      icon: Users,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      name: 'In Progress',
      value: tasks.filter(t => t.status === 'In Progress').length,
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      name: 'Blocked',
      value: blockedTasks.length,
      icon: AlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
