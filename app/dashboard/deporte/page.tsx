'use client';

import { useState } from 'react';
import { useAppStore, useIsReadOnly } from '@/lib/store';
import { Plus, Calendar } from 'lucide-react';
import GymWorkoutModal from '@/components/GymWorkoutModal';
import GymSessionModal from '@/components/GymSessionModal';
import WorkoutDetailsModal from '@/components/WorkoutDetailsModal';
import { Workout, GymSession } from '@/lib/types';

export default function DeportePage() {
  const { userData, updateUserData } = useAppStore();
  const isReadOnly = useIsReadOnly();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | undefined>();
  const [sessionWorkout, setSessionWorkout] = useState<Workout | undefined>();
  const [detailsWorkout, setDetailsWorkout] = useState<Workout | undefined>();

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const workouts = userData.workouts || [];
  const gymSessions = userData.gymSessions || [];

  const handleSaveWorkout = (workout: Workout) => {
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    
    let updatedWorkouts;
    if (existingIndex >= 0) {
      updatedWorkouts = workouts.map(w => w.id === workout.id ? workout : w);
    } else {
      updatedWorkouts = [...workouts, workout];
    }

    updateUserData({
      ...userData,
      workouts: updatedWorkouts,
    });

    setShowCreateModal(false);
    setEditingWorkout(undefined);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (confirm('¿Seguro que quieres eliminar esta rutina?')) {
      const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
      const updatedSessions = gymSessions.filter(s => s.workoutId !== workoutId);
      
      updateUserData({
        ...userData,
        workouts: updatedWorkouts,
        gymSessions: updatedSessions,
      });
    }
  };

  const handleSaveSession = (session: GymSession) => {
    const updatedSessions = [...gymSessions, session];
    
    // Actualizar última sesión del workout
    const updatedWorkouts = workouts.map(w =>
      w.id === session.workoutId ? { ...w, lastSession: session.date } : w
    );

    updateUserData({
      ...userData,
      workouts: updatedWorkouts,
      gymSessions: updatedSessions,
    });

    setSessionWorkout(undefined);
  };

  const getSessionsForWorkout = (workoutId: string) => {
    return (gymSessions || []).filter(s => s.workoutId === workoutId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Actividades deportivas</h2>
        {!isReadOnly && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-dark text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {workouts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow">
          <div className="text-6xl mb-4">💪</div>
          <h3 className="text-xl font-bold mb-2">No hay actividades</h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera rutina de entrenamiento
          </p>
          {!isReadOnly && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Añadir actividad
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              sessionsCount={getSessionsForWorkout(workout.id).length}
              onClick={() => setDetailsWorkout(workout)}
              onEdit={() => setEditingWorkout(workout)}
              onDelete={() => handleDeleteWorkout(workout.id)}
              onNewSession={() => setSessionWorkout(workout)}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      )}

      {/* Modal de creación/edición de rutina */}
      {(showCreateModal || editingWorkout) && !isReadOnly && (
        <GymWorkoutModal
          workout={editingWorkout}
          onSave={handleSaveWorkout}
          onClose={() => {
            setShowCreateModal(false);
            setEditingWorkout(undefined);
          }}
        />
      )}

      {/* Modal de nueva sesión */}
      {sessionWorkout && !isReadOnly && (
        <GymSessionModal
          workout={sessionWorkout}
          onSave={handleSaveSession}
          onClose={() => setSessionWorkout(undefined)}
        />
      )}

      {/* Modal de detalles */}
      {detailsWorkout && (
        <WorkoutDetailsModal
          workout={detailsWorkout}
          sessions={getSessionsForWorkout(detailsWorkout.id)}
          onClose={() => setDetailsWorkout(undefined)}
          onEdit={() => {
            setEditingWorkout(detailsWorkout);
            setDetailsWorkout(undefined);
          }}
        />
      )}
    </div>
  );
}

function WorkoutCard({
  workout,
  sessionsCount,
  onClick,
  onEdit,
  onDelete,
  onNewSession,
  isReadOnly,
}: {
  workout: Workout;
  sessionsCount: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNewSession: () => void;
  isReadOnly: boolean;
}) {
  return (
    <div 
      className="bg-white rounded-xl p-4 shadow hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="text-3xl">{workout.emoji}</div>
        <div className="flex-1">
          <h3 className="font-semibold">{workout.name}</h3>
          {workout.muscleGroup && (
            <p className="text-xs text-gray-500">
              {workout.muscleGroup}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1">
            {workout.lastSession && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {workout.lastSession}
              </p>
            )}
            <p className="text-xs text-gray-400">
              {sessionsCount} sesiones registradas
            </p>
          </div>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {!isReadOnly && (
            <>
              <button
                onClick={onEdit}
                className="text-sm text-primary font-medium hover:underline"
              >
                Editar
              </button>
              <button
                onClick={onDelete}
                className="text-sm text-red-500 font-medium hover:underline"
              >
                Eliminar
              </button>
            </>
          )}
          {!isReadOnly && (
            <button 
              onClick={onNewSession}
              className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-lg text-sm font-medium transition"
            >
              + Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}