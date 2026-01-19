'use client';

import { useAppStore } from '@/lib/store';
import { getTodayKey, formatDate } from '@/lib/utils';

export default function DiarioPage() {
  const { userData } = useAppStore();
  const todayKey = getTodayKey();

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const todayMeals = userData.meals[todayKey] || [];
  const scheduledWorkouts = userData.scheduledWorkouts[todayKey] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-4 mb-4 shadow">
        <h2 className="text-lg font-bold text-center">
          {formatDate(new Date())}
        </h2>
        <p className="text-sm text-center text-gray-600 mt-2">
          Tu diario de hoy
        </p>
      </div>

      {todayMeals.length === 0 && scheduledWorkouts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow">
          <p className="text-gray-500 mb-4">
            No hay actividades programadas para hoy
          </p>
          <p className="text-sm text-gray-400">
            Sube tu plan de dieta y crea tus rutinas de entrenamiento
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {todayMeals.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow">
              <h3 className="font-bold mb-3">🍽️ Comidas del día</h3>
              <p className="text-sm text-gray-600">
                {todayMeals.length} comidas programadas
              </p>
            </div>
          )}
          
          {scheduledWorkouts.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow">
              <h3 className="font-bold mb-3">💪 Entrenamientos</h3>
              <p className="text-sm text-gray-600">
                {scheduledWorkouts.length} entrenamientos programados
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}