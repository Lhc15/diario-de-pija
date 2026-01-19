'use client';

import { useState } from 'react';
import { useAppStore, useIsReadOnly } from '@/lib/store';
import { getTodayKey, formatDate, updateDailySummaryAndStats } from '@/lib/utils';
import { Eye, X, Plus, Edit2, Check } from 'lucide-react';
import { Meal, Workout, GymSession, ScheduledWorkout } from '@/lib/types';
import ScheduleWorkoutModal from '@/components/ScheduleWorkoutModal';
import GymSessionModal from '@/components/GymSessionModal';

type Activity = {
  id: string;
  type: 'meal' | 'workout';
  time: string;
  data: Meal | Workout;
  scheduledTime?: string; // Solo para workouts
};

export default function DiarioPage() {
  const { userData, updateUserData } = useAppStore();
  const isReadOnly = useIsReadOnly();
  const todayKey = getTodayKey();

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionWorkout, setSessionWorkout] = useState<Workout | undefined>();
  const [editingTime, setEditingTime] = useState<string | null>(null);
  const [newTime, setNewTime] = useState('');

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const todayMeals = userData.meals[todayKey] || [];
  const scheduledWorkouts = userData.scheduledWorkouts[todayKey] || [];
  
  // Crear actividades mezcladas
  const allActivities: Activity[] = [
    ...todayMeals.map(m => ({
      id: `meal-${m.id}`,
      type: 'meal' as const,
      data: m,
      time: m.time
    })),
    ...scheduledWorkouts
      .map(sw => {
        const workout = userData.workouts.find(w => w.id === sw.workoutId);
        if (!workout) return null;
        return {
          id: `workout-${sw.workoutId}`,
          type: 'workout' as const,
          data: workout,
          time: sw.time,
          scheduledTime: sw.time
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)
  ].sort((a, b) => a.time.localeCompare(b.time));

  // Calcular progreso
  const totalActivities = todayMeals.length + scheduledWorkouts.length;
  const completedMeals = todayMeals.filter(m => m.completed).length;
  const completedWorkoutsToday = userData.gymSessions.filter(
    s => s.date === todayKey && scheduledWorkouts.some(sw => sw.workoutId === s.workoutId)
  ).length;
  const totalCompleted = completedMeals + completedWorkoutsToday;
  const progressPercent = totalActivities > 0 ? (totalCompleted / totalActivities) * 100 : 0;

  const toggleMealComplete = (mealId: string) => {
    if (isReadOnly) return;

    const updatedMeals = { ...userData.meals };
    updatedMeals[todayKey] = updatedMeals[todayKey].map(m =>
      m.id === mealId ? { ...m, completed: !m.completed } : m
    );

    const newUserData = { ...userData, meals: updatedMeals };
    const updatedWithStats = updateDailySummaryAndStats(newUserData, todayKey);
    
    updateUserData(updatedWithStats);
  };

  const handleScheduleWorkout = (workoutId: string, date: string, time: string) => {
    const updatedScheduled = { ...userData.scheduledWorkouts };
    
    if (!updatedScheduled[date]) {
      updatedScheduled[date] = [];
    }
    
    // Evitar duplicados
    if (!updatedScheduled[date].some(sw => sw.workoutId === workoutId)) {
      updatedScheduled[date] = [...updatedScheduled[date], { workoutId, time }];
    }

    updateUserData({
      ...userData,
      scheduledWorkouts: updatedScheduled,
    });
  };

  const handleStartWorkout = (workout: Workout) => {
    if (isReadOnly) return;
    setSessionWorkout(workout);
  };

  const handleSaveSession = (session: GymSession) => {
    const updatedSessions = [...userData.gymSessions, session];
    
    const updatedWorkouts = userData.workouts.map(w =>
      w.id === session.workoutId ? { ...w, lastSession: session.date } : w
    );

    const newUserData = {
      ...userData,
      workouts: updatedWorkouts,
      gymSessions: updatedSessions,
    };

    const updatedWithStats = updateDailySummaryAndStats(newUserData, todayKey);
    
    updateUserData(updatedWithStats);
    setSessionWorkout(undefined);
  };

  const handleRemoveScheduledWorkout = (workoutId: string) => {
    if (isReadOnly) return;
    
    const updatedScheduled = { ...userData.scheduledWorkouts };
    updatedScheduled[todayKey] = updatedScheduled[todayKey].filter(sw => sw.workoutId !== workoutId);
    
    updateUserData({
      ...userData,
      scheduledWorkouts: updatedScheduled,
    });
  };

  const handleEditTime = (activityId: string, currentTime: string) => {
    setEditingTime(activityId);
    setNewTime(currentTime);
  };

  const handleSaveTime = (activityId: string, activityType: 'meal' | 'workout') => {
    if (activityType === 'meal') {
      const mealId = activityId.replace('meal-', '');
      const updatedMeals = { ...userData.meals };
      updatedMeals[todayKey] = updatedMeals[todayKey].map(m =>
        m.id === mealId ? { ...m, time: newTime } : m
      );
      updateUserData({ ...userData, meals: updatedMeals });
    } else {
      const workoutId = activityId.replace('workout-', '');
      const updatedScheduled = { ...userData.scheduledWorkouts };
      updatedScheduled[todayKey] = updatedScheduled[todayKey].map(sw =>
        sw.workoutId === workoutId ? { ...sw, time: newTime } : sw
      );
      updateUserData({ ...userData, scheduledWorkouts: updatedScheduled });
    }
    setEditingTime(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header con fecha */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow">
        <h2 className="text-lg font-bold text-center">
          {formatDate(new Date())}
        </h2>
        <p className="text-sm text-center text-gray-600 mt-2">
          Tu diario de hoy
        </p>
      </div>

      {/* Barra de progreso */}
      {totalActivities > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">
              PROGRESO DEL DÍA
            </span>
            <span className="text-sm font-bold text-primary">
              {totalCompleted}/{totalActivities} completadas
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Botón programar entrenamiento */}
      {!isReadOnly && (
        <button
          onClick={() => setShowScheduleModal(true)}
          className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 mb-4 shadow"
        >
          <Plus className="w-5 h-5" />
          Programar entrenamiento
        </button>
      )}

      {/* Lista de actividades */}
      {allActivities.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold mb-2">No hay actividades hoy</h3>
          <p className="text-gray-600 mb-4">
            Sube tu dieta o programa entrenamientos para empezar
          </p>
          {!isReadOnly && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Programar entrenamiento
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {allActivities.map((activity) => {
            if (activity.type === 'meal') {
              const meal = activity.data as Meal;
              return (
                <MealCard
                  key={activity.id}
                  meal={meal}
                  onToggle={() => toggleMealComplete(meal.id)}
                  onView={() => setSelectedMeal(meal)}
                  onEditTime={() => handleEditTime(activity.id, meal.time)}
                  isEditingTime={editingTime === activity.id}
                  newTime={newTime}
                  setNewTime={setNewTime}
                  onSaveTime={() => handleSaveTime(activity.id, 'meal')}
                  onCancelEdit={() => setEditingTime(null)}
                  isReadOnly={isReadOnly}
                />
              );
            } else {
              const workout = activity.data as Workout;
              const isCompleted = userData.gymSessions.some(
                s => s.date === todayKey && s.workoutId === workout.id
              );
              return (
                <WorkoutCard
                  key={activity.id}
                  workout={workout}
                  scheduledTime={activity.scheduledTime || '00:00'}
                  isCompleted={isCompleted}
                  onStart={() => handleStartWorkout(workout)}
                  onRemove={() => handleRemoveScheduledWorkout(workout.id)}
                  onEditTime={() => handleEditTime(activity.id, activity.scheduledTime || '00:00')}
                  isEditingTime={editingTime === activity.id}
                  newTime={newTime}
                  setNewTime={setNewTime}
                  onSaveTime={() => handleSaveTime(activity.id, 'workout')}
                  onCancelEdit={() => setEditingTime(null)}
                  isReadOnly={isReadOnly}
                />
              );
            }
          })}
        </div>
      )}

      {/* Modales */}
      {selectedMeal && (
        <RecipeModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}

      {showScheduleModal && (
        <ScheduleWorkoutModal
          workouts={userData.workouts}
          initialDate={todayKey}
          onSave={handleScheduleWorkout}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      {sessionWorkout && (
        <GymSessionModal
          workout={sessionWorkout}
          onSave={handleSaveSession}
          onClose={() => setSessionWorkout(undefined)}
        />
      )}
    </div>
  );
}

function MealCard({
  meal,
  onToggle,
  onView,
  onEditTime,
  isEditingTime,
  newTime,
  setNewTime,
  onSaveTime,
  onCancelEdit,
  isReadOnly,
}: {
  meal: Meal;
  onToggle: () => void;
  onView: () => void;
  onEditTime: () => void;
  isEditingTime: boolean;
  newTime: string;
  setNewTime: (time: string) => void;
  onSaveTime: () => void;
  onCancelEdit: () => void;
  isReadOnly: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow flex items-center gap-4 transition ${
        meal.completed ? 'bg-green-50 border-l-4 border-green-500' : ''
      }`}
    >
      <div className="text-3xl">{meal.emoji}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {isEditingTime ? (
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="px-2 py-1 border border-primary rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={onSaveTime} className="text-green-600 hover:text-green-700">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={onCancelEdit} className="text-red-600 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-xs text-gray-500">{meal.time}</span>
              {!isReadOnly && (
                <button onClick={onEditTime} className="text-gray-400 hover:text-primary">
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </>
          )}
          <span className="font-semibold text-sm">{meal.type}</span>
          {meal.completed && <span className="text-green-600">✓</span>}
        </div>
        <p className="text-xs text-gray-600">{meal.name}</p>
      </div>
      <button
        onClick={onView}
        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
      >
        <Eye className="w-3 h-3" />
        Ver
      </button>
      {!isReadOnly && (
        <input
          type="checkbox"
          checked={meal.completed}
          onChange={onToggle}
          className="w-5 h-5 rounded cursor-pointer accent-primary"
        />
      )}
    </div>
  );
}

function WorkoutCard({
  workout,
  scheduledTime,
  isCompleted,
  onStart,
  onRemove,
  onEditTime,
  isEditingTime,
  newTime,
  setNewTime,
  onSaveTime,
  onCancelEdit,
  isReadOnly,
}: {
  workout: Workout;
  scheduledTime: string;
  isCompleted: boolean;
  onStart: () => void;
  onRemove: () => void;
  onEditTime: () => void;
  isEditingTime: boolean;
  newTime: string;
  setNewTime: (time: string) => void;
  onSaveTime: () => void;
  onCancelEdit: () => void;
  isReadOnly: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow flex items-center gap-4 transition ${
        isCompleted ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="text-3xl">{workout.emoji}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {isEditingTime ? (
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="px-2 py-1 border border-primary rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button onClick={onSaveTime} className="text-green-600 hover:text-green-700">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={onCancelEdit} className="text-red-600 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-xs text-gray-500">{scheduledTime}</span>
              {!isReadOnly && !isCompleted && (
                <button onClick={onEditTime} className="text-gray-400 hover:text-primary">
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </>
          )}
          <span className="font-semibold text-sm">{workout.name}</span>
          {isCompleted && <span className="text-blue-600">✓</span>}
        </div>
        <p className="text-xs text-gray-600">{workout.muscleGroup}</p>
      </div>
      {!isReadOnly && !isCompleted && (
        <>
          <button
            onClick={onStart}
            className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Iniciar
          </button>
          <button
            onClick={onRemove}
            className="text-xs text-red-500 font-medium hover:underline"
          >
            Quitar
          </button>
        </>
      )}
      {isCompleted && (
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          Completado
        </span>
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
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
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
            <h3 className="font-bold mb-2 flex items-center gap-2">🥘 Ingredientes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{meal.ingredients}</p>
          </div>
          <div>
            <h3 className="font-bold mb-2 flex items-center gap-2">👨‍🍳 Elaboración</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">{meal.recipe}</p>
          </div>
          {meal.notes && (
            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">📝 Notas</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{meal.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}