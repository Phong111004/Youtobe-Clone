'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { INotification, getNotifications, markAsRead, markAllAsRead } from '@/api/notification';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notification: INotification) => {
        queryClient.setQueryData(['notifications'], (oldData: INotification[] = []) => {
          return [notification, ...oldData];
        });
      });
    }
    return () => {
      if (socket) {
        socket.off('new_notification');
      }
    };
  }, [socket, queryClient]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn việc trigger link
    e.stopPropagation();
    await markAsRead(id);
    queryClient.setQueryData(['notifications'], (oldData: INotification[] = []) =>
      oldData.map(n => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    queryClient.setQueryData(['notifications'], (oldData: INotification[] = []) =>
      oldData.map(n => ({ ...n, isRead: true }))
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-neutral-800 rounded-full transition-colors relative"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0f0f0f]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#282828] rounded-xl shadow-xl py-2 z-50 border border-neutral-700 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700 sticky top-0 bg-[#282828] z-10">
            <h3 className="text-lg font-semibold">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif._id}
                  href={notif.video ? `/watch/${notif.video._id}` : '#'}
                  className={`flex gap-3 px-4 py-3 hover:bg-neutral-700/50 transition-colors ${
                    !notif.isRead ? 'bg-blue-900/10' : ''
                  }`}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id, {} as any)}
                >
                  <img
                    src={notif.sender?.avatar}
                    alt={notif.sender?.username}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{notif.sender?.username}</span>{' '}
                      <span className="text-neutral-300">{notif.message}</span>
                    </p>
                    {notif.video && (
                      <p className="text-xs text-neutral-400 truncate mt-1">
                        {notif.video.title}
                      </p>
                    )}
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif._id, e)}
                      className="p-1 hover:bg-neutral-600 rounded-full h-fit flex-shrink-0"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="w-4 h-4 text-blue-400" />
                    </button>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
