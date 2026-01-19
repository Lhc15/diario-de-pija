'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppStore, USERS } from '@/lib/store';
import UserSwitcher from '@/components/UserSwitcher';
import { 
  BookOpen, 
  Dumbbell, 
  Calendar, 
  BarChart3, 
  UtensilsCrossed,
  Settings,
  ArrowLeft
} from 'lucide-react';

const GREETINGS = [
  'Hola cremru',
  'Bondia gorda traicionera',
  'TCA entrando al chat',
  '¿Cómo está mi pija de urba?',
  'Bondia bebukona',
  'Bondia y adiós atracones',
  'I love atracones y Vicki me deja!'
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, currentUser, viewingUser, backToMyApp } = useAppStore();
  
  const [greeting, setGreeting] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('current_user');
      if (!savedUser) {
        router.push('/');
      }
    }
  }, [isAuthenticated, router]);

  // Saludo aleatorio
  useEffect(() => {
    const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setGreeting(randomGreeting);
  }, []);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isReadOnly = viewingUser !== null;
  const activeUser = viewingUser || currentUser;
  const activeUserData = USERS[activeUser];

  const navItems = [
    { href: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menú' },
    { href: '/dashboard/deporte', icon: Dumbbell, label: 'Deporte' },
    { href: '/dashboard/diario', icon: BookOpen, label: 'Diario', center: true },
    { href: '/dashboard/calendario', icon: Calendar, label: 'Calendario' },
    { href: '/dashboard/metricas', icon: BarChart3, label: 'Métricas' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-primary text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isReadOnly && (
              <button 
                onClick={backToMyApp}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg md:text-xl font-bold">
                {isReadOnly ? (
                  <span className="flex items-center gap-2">
                    👁️ App de {activeUserData.displayName}
                  </span>
                ) : (
                  greeting
                )}
              </h1>
              {isReadOnly && (
                <p className="text-xs text-white/80">Solo lectura</p>
              )}
            </div>
          </div>
          
          {!isReadOnly && (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <Settings className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      {/* User Switcher */}
      <UserSwitcher />

      {/* Main Content */}
      <main className="min-h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition ${
                    item.center ? 'transform scale-110' : ''
                  } ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className={`${item.center ? 'w-7 h-7' : 'w-6 h-6'}`} />
                  <span className={`text-xs mt-1 font-medium ${
                    item.center ? 'text-sm' : ''
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && !isReadOnly && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { currentUser, logout } = useAppStore();
  
  if (!currentUser) return null;
  
  const user = USERS[currentUser];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-end z-50 backdrop-blur-sm animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl w-full max-w-2xl mx-auto max-h-[80vh] overflow-y-auto animate-slideUp" 
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold">Ajustes</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">👤 Perfil</h3>
            <p className="text-sm mb-2">{user.displayName} {user.avatar}</p>
            <button 
              onClick={handleLogout}
              className="text-red-600 text-sm font-medium hover:underline"
            >
              Cerrar sesión
            </button>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">🎭 Saludos</h3>
            <div className="bg-gray-50 rounded p-3 text-xs space-y-1 max-h-32 overflow-y-auto">
              {GREETINGS.map((g, i) => <p key={i}>• {g}</p>)}
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">🎨 Color</h3>
            <p className="text-sm text-primary">● #2596be</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">ℹ️ Info</h3>
            <p className="text-xs text-gray-600">Versión 1.0</p>
            <p className="text-xs text-gray-600">Diario de una Pija de Urba</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}