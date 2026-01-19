'use client';

import { useAppStore, USERS, useIsReadOnly, useActiveUserId } from '@/lib/store';
import { Eye, ArrowLeft } from 'lucide-react';

export default function UserSwitcher() {
  const { currentUser, viewingUser, viewOtherUser, backToMyApp } = useAppStore();
  const isReadOnly = useIsReadOnly();
  const activeUserId = useActiveUserId();

  if (!currentUser) return null;

  const currentUserData = USERS[currentUser];
  const otherUserId = currentUser === 'miguel' ? 'lorena' : 'miguel';
  const otherUserData = USERS[otherUserId];
  const activeUserData = activeUserId ? USERS[activeUserId] : null;

  if (isReadOnly) {
    // Estamos viendo la app de otro usuario
    return (
      <div className="bg-yellow-50 border-b border-yellow-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Viendo el diario de {activeUserData?.displayName} {activeUserData?.avatar}
            </span>
            <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-1 rounded-full">
              Solo lectura
            </span>
          </div>
          <button
            onClick={backToMyApp}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mi diario
          </button>
        </div>
      </div>
    );
  }

  // Vista normal - botón para ver otro usuario
  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {currentUserData.displayName} {currentUserData.avatar}
          </span>
        </div>
        <button
          onClick={() => viewOtherUser(otherUserId)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Eye className="w-4 h-4" />
          Ver diario de {otherUserData.displayName}
        </button>
      </div>
    </div>
  );
}