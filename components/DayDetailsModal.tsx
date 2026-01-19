'use client';

import { X, Check, Circle } from 'lucide-react';
import { UserData, Meal, Workout } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface DayDetailsModalProps {
  date: string; // YYYY-MM-DD
  userData: UserData;
  onClose: () => void;
}

export default function DayDetailsModal({ date, userData, onClose }: DayDetailsModalProps) {
  const meals = userData.meals[date] || [];
  const scheduledWorkoutsList = userData.scheduledWorkouts[date] || [];
  const gymSessions = userData.gymSessions.filter(s => s.date === date);
  const otherSports = userData.otherSports.filter(s => s.date === date);

  // Obtener workouts programados
  const scheduledWorkouts = scheduledWorkoutsList
    .map(sw => {
      const workout = userData.workouts.find(w => w.id === sw.workoutId);
      return workout ? { ...workout, scheduledTime: sw.time } : null;
    })
    .filter((w): w is Workout & { scheduledTime: string } => w !== null);

  const totalActivities = meals.length + scheduledWorkouts.length;
  const completedMeals = meals.filter(m => m.completed).length;
  const completedWorkouts = gymSessions.filter(s => 
    scheduledWorkoutsList.some(sw => sw.workoutId === s.workoutId)
  ).length;
  const totalCompleted = completedMeals + completedWorkouts;
  const isFullyCompleted = totalActivities > 0 && totalCompleted === totalActivities;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold">{formatDate(date)}</h2>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progreso del día */}
          {totalActivities > 0 && (
            <div className={`p-4 rounded-xl ${
              isFullyCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Progreso del día</span>
                <span className={`text-sm font-bold ${
                  isFullyCompleted ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {totalCompleted}/{totalActivities}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isFullyCompleted ? 'bg-green-500' : 'bg-primary'
                  }`}
                  style={{ width: `${(totalCompleted / totalActivities) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Comidas */}
          {meals.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                🍽️ Comidas ({completedMeals}/{meals.length})
              </h3>
              <div className="space-y-2">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className={`p-3 rounded-lg border ${
                      meal.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{meal.emoji}</span>
                          <span className="text-xs text-gray-500">{meal.time}</span>
                          <span className="text-sm font-semibold">{meal.type}</span>
                        </div>
                        <p className="text-sm text-gray-700">{meal.name}</p>
                      </div>
                      {meal.completed ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entrenamientos programados */}
          {scheduledWorkouts.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                💪 Entrenamientos ({completedWorkouts}/{scheduledWorkouts.length})
              </h3>
              <div className="space-y-2">
                {scheduledWorkouts.map((workout) => {
                  const isCompleted = gymSessions.some(s => s.workoutId === workout.id);
                  const session = gymSessions.find(s => s.workoutId === workout.id);
                  
                  return (
                    <div
                      key={workout.id}
                      className={`p-3 rounded-lg border ${
                        isCompleted
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{workout.emoji}</span>
                            <span className="text-xs text-gray-500">{workout.scheduledTime}</span>
                            <span className="text-sm font-semibold">{workout.name}</span>
                          </div>
                          <p className="text-xs text-gray-600">{workout.muscleGroup}</p>
                          {isCompleted && session && (
                            <div className="mt-2 text-xs text-blue-600">
                              ✓ Completado: {session.exercises.reduce((acc, ex) => 
                                acc + ex.series.filter(s => s.completed).length, 0
                              )} series realizadas
                            </div>
                          )}
                        </div>
                        {isCompleted ? (
                          <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Otros deportes */}
          {otherSports.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                🏃 Otros deportes
              </h3>
              <div className="space-y-2">
                {otherSports.map((sport) => {
                  const workout = userData.workouts.find(w => w.id === sport.workoutId);
                  return (
                    <div
                      key={sport.id}
                      className="p-3 rounded-lg bg-purple-50 border border-purple-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {workout?.name || 'Deporte'}
                          </p>
                          {sport.achievements && (
                            <p className="text-xs text-gray-600 mt-1">
                              ✓ {sport.achievements}
                            </p>
                          )}
                          {sport.notes && (
                            <p className="text-xs text-gray-500 mt-1">{sport.notes}</p>
                          )}
                        </div>
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {totalActivities === 0 && otherSports.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-bold mb-2">No hay actividades</h3>
              <p className="text-gray-600 text-sm">
                Este día no tiene comidas ni entrenamientos programados
              </p>
            </div>
          )}

          {/* Resumen final */}
          {isFullyCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-bold text-green-700">¡Día completado!</p>
              <p className="text-sm text-green-600">
                Has cumplido con todas tus actividades
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}