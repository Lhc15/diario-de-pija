'use client';

import { useState } from 'react';
import { useAppStore, useIsReadOnly } from '@/lib/store';
import { getTodayKey, updateDailySummaryAndStats } from '@/lib/utils';
import { Upload, Eye, X } from 'lucide-react';
import UploadDietPDF from '@/components/UploadDietPDF';
import { Meal } from '@/lib/types';

export default function MenuPage() {
  const { userData, updateUserData } = useAppStore();
  const isReadOnly = useIsReadOnly();
  const todayKey = getTodayKey();

  const [showUpload, setShowUpload] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const todayMeals = userData.meals[todayKey] || [];

  const toggleMealComplete = (mealId: string) => {
    if (isReadOnly) return;

    const updatedMeals = { ...userData.meals };
    updatedMeals[todayKey] = updatedMeals[todayKey].map((m) =>
      m.id === mealId ? { ...m, completed: !m.completed } : m
    );

    const newUserData = { ...userData, meals: updatedMeals };
    const updatedWithStats = updateDailySummaryAndStats(newUserData, todayKey);
    
    updateUserData(updatedWithStats);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Menú del día</h2>
        {!isReadOnly && (
          <button
            onClick={() => setShowUpload(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {userData.dietPlan ? 'Cambiar dieta' : 'Subir dieta'}
          </button>
        )}
      </div>

      {!userData.dietPlan && !showUpload ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold mb-2">No hay plan de dieta</h3>
          <p className="text-gray-600 mb-6">
            Sube el PDF de tu nutricionista para empezar
          </p>
          {!isReadOnly && (
            <button
              onClick={() => setShowUpload(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Subir PDF de dieta
            </button>
          )}
        </div>
      ) : showUpload ? (
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Subir plan de dieta</h3>
            <button
              onClick={() => setShowUpload(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <UploadDietPDF
            onSuccess={handleUploadSuccess}
            onClose={() => setShowUpload(false)}
          />
        </div>
      ) : todayMeals.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow">
          <p className="text-gray-500">No hay comidas programadas para hoy</p>
          <p className="text-sm text-gray-400 mt-2">
            Tu plan de dieta está cargado pero hoy no tiene comidas asignadas
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayMeals.map((meal) => (
            <div
              key={meal.id}
              className={`bg-white rounded-xl p-4 shadow flex items-center gap-4 transition ${
                meal.completed ? 'bg-green-50 border-l-4 border-green-500' : ''
              }`}
            >
              <div className="text-3xl">{meal.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">{meal.time}</span>
                  <span className="font-semibold text-sm">{meal.type}</span>
                  {meal.completed && <span className="text-green-600">✓</span>}
                </div>
                <p className="text-xs text-gray-600">{meal.name}</p>
              </div>
              <button
                onClick={() => setSelectedMeal(meal)}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Ver
              </button>
              {!isReadOnly && (
                <input
                  type="checkbox"
                  checked={meal.completed}
                  onChange={() => toggleMealComplete(meal.id)}
                  className="w-5 h-5 rounded cursor-pointer accent-primary"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Receta */}
      {selectedMeal && (
        <RecipeModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}
    </div>
  );
}

function RecipeModal({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{meal.emoji}</span>
              <span className="text-sm text-gray-500">{meal.time}</span>
            </div>
            <h2 className="text-lg font-bold">{meal.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2">
              🥘 Ingredientes
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {meal.ingredients}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2">
              👨‍🍳 Elaboración
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {meal.recipe}
            </p>
          </div>

          {meal.notes && (
            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                📝 Notas
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {meal.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}