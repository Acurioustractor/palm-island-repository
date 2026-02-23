'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, ArrowLeft, FileText, AlertCircle, Info, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
  recipient_type?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const filterParam = filter === 'unread' ? '?filter=unread' : '';
      const res = await fetch(`/api/notifications${filterParam}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'story':
      case 'capture':
        return <FileText className="h-5 w-5 text-picc-ochre-600" />;
      case 'grant':
        return <FileText className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'info': return 'bg-blue-50';
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-orange-50';
      case 'story':
      case 'capture': return 'bg-amber-50';
      case 'grant': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchNotifications}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 p-2 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'unread' ? "You're all caught up!" : 'New notifications will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border transition-all ${
                  notification.read
                    ? 'border-gray-200 bg-white'
                    : 'border-blue-200 shadow-sm'
                } ${getNotificationBg(notification.type, notification.read)}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                        )}
                      </div>

                      <p className={`text-sm mb-2 ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.created_at)}
                        </span>

                        <div className="flex items-center gap-2">
                          {notification.action_url && (
                            <Link
                              href={notification.action_url}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View &rarr;
                            </Link>
                          )}

                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-gray-500 hover:text-blue-600 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
