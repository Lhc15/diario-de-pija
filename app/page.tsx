'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, USERS } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAppStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Verificar si ya hay sesión
  useEffect(() => {
    const checkSession = async () => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('current_user');
        if (savedUser && (savedUser === 'miguel' || savedUser === 'lorena')) {
          setIsLoggingIn(true);
          await login(savedUser);
          router.push('/dashboard/diario');
          return;
        }
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, [login, router]);

  // Redirect si está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoggingIn) {
      router.push('/dashboard/diario');
    }
  }, [isAuthenticated, router, isLoggingIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = Object.values(USERS).find(
      u => u.username === username && u.password === password
    );

    if (user) {
      setIsLoggingIn(true);
      try {
        await login(user.id);
        router.push('/dashboard/diario');
      } catch (err) {
        console.error('Error en login:', err);
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
        setIsLoggingIn(false);
      }
    } else {
      setError('Eso no es, prueba otra vez 😜');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (isLoading || isLoggingIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Cargando tu diario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex flex-col items-center justify-center text-white p-4">
      <div className="text-7xl mb-4 animate-bounce">🥗</div>
      <h1 className="text-3xl font-bold text-center mb-2">Diario de una</h1>
      <h1 className="text-3xl font-bold text-center mb-4">Pija de Urba</h1>
      <p className="text-xl mb-8">¿Quién anda por aquí?</p>
      
      <form 
        onSubmit={handleSubmit} 
        className={`bg-white rounded-2xl p-6 w-full max-w-md transition-transform ${
          shake ? 'animate-shake' : ''
        }`}
      >
        <div className="mb-4">
          <label className="block font-semibold mb-2" style={{ color: '#000000' }}>Usuario</label>
          <select
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ color: '#000000' }}
            required
          >
            <option value="">Selecciona</option>
            <option value="Miguel">😈 Miguel</option>
            <option value="Lorena">💋 Lorena</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block font-semibold mb-2" style={{ color: '#000000' }}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ color: '#000000' }}
            placeholder="Tu contraseña"
            required
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm" style={{ color: '#b91c1c' }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold transition-colors"
        >
          Entrar 🚀
        </button>
        
        <p className="text-center text-xs mt-4" style={{ color: '#6b7280' }}>
          ¿Olvidaste tu contraseña?<br/>
          ¡Pídesela a tu compañero de dieta! 🤷
        </p>
      </form>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}