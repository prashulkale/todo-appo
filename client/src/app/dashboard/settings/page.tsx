'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Loader2, User, Mail, Calendar, LogOut, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-500">Your account details and information</p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-2xl font-medium text-white">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Username</p>
                  <p className="text-sm text-gray-500">{user.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Member since</p>
                  <p className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Actions</h2>
            <p className="text-sm text-gray-500">Manage your account settings</p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sign out</p>
                  <p className="text-sm text-gray-500">Sign out of your account</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn btn-secondary btn-sm"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  'Sign out'
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-900">Delete account</p>
                  <p className="text-sm text-red-500">Permanently delete your account and all data</p>
                </div>
              </div>
              <button
                disabled
                className="btn btn-danger btn-sm opacity-50 cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Application Information</h2>
            <p className="text-sm text-gray-500">About this application</p>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Build</span>
              <span className="text-sm font-medium text-gray-900">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Environment</span>
              <span className="text-sm font-medium text-gray-900">Demo</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
