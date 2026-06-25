import React, { useState } from 'react';
import { X, Trash2, Check, CheckCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import {
  useNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} from '../../queries/notification.queries';
import { formatDistanceToNow } from 'date-fns';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  loan?: {
    loanNumber: string;
    creditor?: {
      firstName: string;
      lastName: string;
    };
  };
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { data: notifications = [] } = useNotificationsQuery();
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const unreadCount = notifications.filter((n: NotificationItem) => !n.isRead).length;

  return (
    <Modal
      isOpen={isOpen}
      title="Notifications"
      onClose={onClose}
      size="lg"
      closeOnBackdropClick={true}
    >
      <div className="max-h-96 overflow-y-auto">
        {/* Header with Mark All as Read */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {notifications.map((notification: NotificationItem) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-slate-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Notification Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        notification.type === 'release_date'
                          ? 'bg-green-500'
                          : notification.type === 'due_1week'
                            ? 'bg-yellow-500'
                            : notification.type === 'due_1day'
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Mark as read"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
