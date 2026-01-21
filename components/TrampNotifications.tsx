'use client';

import { useEffect, useState } from 'react';
import { X, PartyPopper, Camera } from 'lucide-react';
import { useAppStore, USERS } from '@/lib/store';
import { getUnreadNotifications, markNotificationAsRead } from '@/lib/notifications';
import { TrampNotification } from '@/lib/types';
import Link from 'next/link';

export default function TrampNotifications() {
  const { currentUser } = useAppStore();
  const [notifications, setNotifications] = useState<TrampNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const loadNotifications = async () => {
      const unread = await getUnreadNotifications(currentUser);
      setNotifications(unread);
    };

    loadNotifications();
    
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleDismiss = async (notificationId: number) => {
    setDismissedIds([...dismissedIds, notificationId]);
    await markNotificationAsRead(notificationId);
    
    // Remover de la lista después de la animación
    setTimeout(() => {
      setNotifications(notifications.filter(n => n.id !== notificationId));
    }, 300);
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.includes(n.id));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 max-w-md">
      {visibleNotifications.map((notification) => {
        const actor = USERS[notification.actorId];
        const icon = notification.type === 'new_event' ? PartyPopper : Camera;
        const Icon = icon;
        
        return (
          <div
            key={notification.id}
            className={`
              bg-white shadow-lg rounded-lg p-4 border-l-4 border-primary
              animate-slideIn transition-all duration-300
              ${dismissedIds.includes(notification.id) ? 'opacity-0 translate-x-full' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {actor.displayName} {actor.avatar}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                <Link
                  href="/dashboard/la-trampa"
                  className="text-xs text-primary font-medium hover:underline mt-2 inline-block"
                  onClick={() => handleDismiss(notification.id)}
                >
                  Ver en La Trampa →
                </Link>
              </div>
              
              <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}