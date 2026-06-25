import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useUnreadCountQuery } from '../../queries/notification.queries';

interface NotificationBellProps {
  onBellClick: () => void;
}

export function NotificationBell({ onBellClick }: NotificationBellProps) {
  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  return (
    <button
      onClick={onBellClick}
      className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
      title="Notifications"
    >
      <Bell
        size={24}
        className={`${isAnimating ? 'animate-bounce' : ''}`}
      />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        </div>
      )}
    </button>
  );
}
