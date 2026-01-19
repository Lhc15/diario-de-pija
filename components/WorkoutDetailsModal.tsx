'use client';

import { X, TrendingUp, Calendar } from 'lucide-react';
import { Workout, GymSession } from '@/lib/types';

interface WorkoutDetailsModalProps {
  workout: Workout;
  sessions: GymSession[];
  onClose: () => void;
  onEdit: () => void;
}

export default function WorkoutDetailsModal({
  workout,
  sessions,
  onClose,
  onEdit,
}: WorkoutDetailsModalProps) {
  // Calcular peso máximo por ejercicio
  const getMaxWeightPerExercise = () => {
    const maxWeights: Record<string, number> = {};

    sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        const maxInSession = Math.max(...exercise.series.map(s => s.weight));
        if (!maxWeights[exercise.name] || maxInSession > maxWeights[exercise.name]) {
          maxWeights[exercise.name] = maxInSession;
        }
      });
    });

    return maxWeights;
  };

  const maxWeights = getMaxWeightPerExercise();
  const totalSessions = sessions.length;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {workout.emoji} {workout.name}
              </h2>
              <p className="text-sm text-gray-500">{workout.muscleGroup}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="px-4 py-2 text-primary font-medium hover:bg-primary/10 rounded-lg transition"
              >
                Editar
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-gray-600">TOTAL SESIONES</span>
              </div>
              <p className="text-2xl font-bold text-primary">{totalSessions}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-gray-600">EJERCICIOS</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {workout.exercises?.length || 0}
              </p>
            </div>
          </div>

          {/* Ejercicios con peso máximo */}
          <div>
            <h3 className="font-bold mb-3">Ejercicios y peso máximo</h3>
            {workout.exercises && workout.exercises.length > 0 ? (
              <div className="space-y-2">
                {workout.exercises.map((exercise, idx) => (
                  <div
                    key={exercise.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <span className="text-gray-400">#{idx + 1}</span>
                          {exercise.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {exercise.series.length} series × {exercise.series[0]?.reps || 0} reps
                        </p>
                      </div>
                      {maxWeights[exercise.name] && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Peso máximo</p>
                          <p className="text-lg font-bold text-primary">
                            {maxWeights[exercise.name]} kg
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay ejercicios configurados</p>
            )}
          </div>

          {/* Historial de sesiones */}
          <div>
            <h3 className="font-bold mb-3">Historial de sesiones</h3>
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map(session => {
                    const totalSeries = session.exercises.reduce(
                      (acc, ex) => acc + ex.series.length,
                      0
                    );
                    const completedSeries = session.exercises.reduce(
                      (acc, ex) => acc + ex.series.filter(s => s.completed).length,
                      0
                    );
                    const progressPercent =
                      totalSeries > 0 ? (completedSeries / totalSeries) * 100 : 0;

                    return (
                      <div
                        key={session.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold">
                              {new Date(session.date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-primary">
                            {completedSeries}/{totalSeries} series
                          </span>
                        </div>

                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Ejercicios de la sesión */}
                        <div className="mt-3 space-y-1">
                          {session.exercises.map(ex => {
                            const maxWeight = Math.max(...ex.series.map(s => s.weight));
                            return (
                              <div key={ex.id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">{ex.name}</span>
                                <span className="text-gray-400">Max: {maxWeight}kg</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No hay sesiones registradas aún</p>
                <p className="text-sm text-gray-400 mt-1">
                  Haz click en "+ Sesión" para empezar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}