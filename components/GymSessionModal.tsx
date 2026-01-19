'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Workout, GymSession, Exercise } from '@/lib/types';
import { generateId, getDateKey } from '@/lib/utils';

interface GymSessionModalProps {
  workout: Workout;
  onSave: (session: GymSession) => void;
  onClose: () => void;
}

export default function GymSessionModal({ workout, onSave, onClose }: GymSessionModalProps) {
  const [date, setDate] = useState(getDateKey(new Date()));
  const [exercises, setExercises] = useState<Exercise[]>(
    (workout.exercises || []).map(ex => ({
      ...ex,
      id: generateId(),
      series: ex.series.map(s => ({ ...s, completed: false }))
    }))
  );

  const handleToggleSeries = (exerciseId: string, seriesIndex: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          series: ex.series.map((s, idx) =>
            idx === seriesIndex ? { ...s, completed: !s.completed } : s
          )
        };
      }
      return ex;
    }));
  };

  const handleUpdateSeriesWeight = (exerciseId: string, seriesIndex: number, weight: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          series: ex.series.map((s, idx) =>
            idx === seriesIndex ? { ...s, weight } : s
          )
        };
      }
      return ex;
    }));
  };

  const handleUpdateSeriesReps = (exerciseId: string, seriesIndex: number, reps: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          series: ex.series.map((s, idx) =>
            idx === seriesIndex ? { ...s, reps } : s
          )
        };
      }
      return ex;
    }));
  };

  const getTotalCompleted = () => {
    const total = exercises.reduce((acc, ex) => acc + ex.series.length, 0);
    const completed = exercises.reduce(
      (acc, ex) => acc + ex.series.filter(s => s.completed).length,
      0
    );
    return { total, completed };
  };

  const handleSave = () => {
    const { total, completed } = getTotalCompleted();
    const isFullyCompleted = total === completed;

    const session: GymSession = {
      id: generateId(),
      workoutId: workout.id,
      date,
      muscleGroup: workout.muscleGroup || '',
      exercises,
      completed: isFullyCompleted,
    };

    onSave(session);
  };

  const { total, completed } = getTotalCompleted();
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {workout.emoji} {workout.name}
              </h2>
              <p className="text-sm text-gray-500">{workout.muscleGroup}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progreso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">
                PROGRESO DE LA SESIÓN
              </span>
              <span className="text-xs font-bold text-primary">
                {completed}/{total} series
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold mb-2">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Ejercicios */}
          <div className="space-y-4">
            {exercises.map((exercise, exerciseIdx) => (
              <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-gray-400">#{exerciseIdx + 1}</span>
                  {exercise.name}
                </h3>

                <div className="space-y-2">
                  {exercise.series.map((series, seriesIdx) => (
                    <div
                      key={seriesIdx}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
                        series.completed
                          ? 'bg-green-50 border-green-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleSeries(exercise.id, seriesIdx)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                          series.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        {series.completed && <Check className="w-4 h-4 text-white" />}
                      </button>

                      <span className="text-sm text-gray-600 w-16">
                        Serie {seriesIdx + 1}
                      </span>

                      <input
                        type="number"
                        value={series.reps}
                        onChange={e =>
                          handleUpdateSeriesReps(exercise.id, seriesIdx, parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        min="0"
                      />
                      <span className="text-xs text-gray-500">reps</span>

                      <input
                        type="number"
                        value={series.weight}
                        onChange={e =>
                          handleUpdateSeriesWeight(exercise.id, seriesIdx, parseFloat(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        min="0"
                        step="0.5"
                      />
                      <span className="text-xs text-gray-500">kg</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg font-medium transition"
            >
              Guardar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}