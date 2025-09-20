import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskPriority, TaskStatus } from '@/types';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to a readable string
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(d);
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'High':
      return 'text-danger-600 bg-danger-50 border-danger-200';
    case 'Medium':
      return 'text-warning-600 bg-warning-50 border-warning-200';
    case 'Low':
      return 'text-success-600 bg-success-50 border-success-200';
    default:
      return 'text-secondary-600 bg-secondary-50 border-secondary-200';
  }
}

/**
 * Get status color classes
 */
export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'To Do':
      return 'text-secondary-600 bg-secondary-50 border-secondary-200';
    case 'In Progress':
      return 'text-primary-600 bg-primary-50 border-primary-200';
    case 'Done':
      return 'text-success-600 bg-success-50 border-success-200';
    default:
      return 'text-secondary-600 bg-secondary-50 border-secondary-200';
  }
}

/**
 * Get priority icon
 */
export function getPriorityIcon(priority: TaskPriority): string {
  switch (priority) {
    case 'High':
      return '🔴';
    case 'Medium':
      return '🟡';
    case 'Low':
      return '🟢';
    default:
      return '⚪';
  }
}

/**
 * Get status icon
 */
export function getStatusIcon(status: TaskStatus): string {
  switch (status) {
    case 'To Do':
      return '📋';
    case 'In Progress':
      return '🔄';
    case 'Done':
      return '✅';
    default:
      return '❓';
  }
}

/**
 * Generate a random color for user avatars
 */
export function generateUserColor(username: string): string {
  const colors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-danger-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get user initials
 */
export function getUserInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if a task can be marked as done
 */
export function canMarkTaskAsDone(task: { dependencies: string[] }, allTasks: { id: string; status: TaskStatus }[]): boolean {
  return task.dependencies.every(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask && depTask.status === 'Done';
  });
}

/**
 * Get tasks that depend on a specific task
 */
export function getTasksDependingOn(taskId: string, allTasks: { id: string; dependencies: string[] }[]): string[] {
  return allTasks
    .filter(task => task.dependencies.includes(taskId))
    .map(task => task.id);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Sort tasks by various criteria
 */
export function sortTasks<T extends { [key: string]: any }>(
  tasks: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...tasks].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
