'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Workout, GymSession, Exercise, ExerciseSeries } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface GymWorkoutModalProps {
  workout?: Workout;
  onSave: (workout: Workout) => void;
  onClose: () => void;
}

const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Hombros',
  'Brazos',
  'Abdomen',
  'Glúteos',
  'Cardio',
];

const EMOJIS_BY_MUSCLE = {
  'Pecho': '💪',
  'Espalda': '🔙',
  'Piernas': '🦵',
  'Hombros': '🤷',
  'Brazos': '💪',
  'Abdomen': '🧘',
  'Glúteos': '🍑',
  'Cardio': '🏃',
};

export default function GymWorkoutModal({ workout, onSave, onClose }: GymWorkoutModalProps) {
  const [name, setName] = useState(workout?.name || '');
  const [muscleGroup, setMuscleGroup] = useState(workout?.muscleGroup || '');
  const [exercises, setExercises] = useState<Exercise[]>(workout?.exercises || []);

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: generateId(),
      name: '',
      series: [{ reps: 10, weight: 0, completed: false }],
    };
    setExercises([...exercises, newExercise]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter(e => e.id !== exerciseId));
  };

  const handleUpdateExerciseName = (exerciseId: string, newName: string) => {
    setExercises(exercises.map(e => 
      e.id === exerciseId ? { ...e, name: newName } : e
    ));
  };

  const handleAddSeries = (exerciseId: string) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        const lastSeries = e.series[e.series.length - 1];
        return {
          ...e,
          series: [
            ...e.series,
            { 
              reps: lastSeries?.reps || 10, 
              weight: lastSeries?.weight || 0, 
              completed: false 
            }
          ]
        };
      }
      return e;
    }));
  };

  const handleRemoveSeries = (exerciseId: string, seriesIndex: number) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        return {
          ...e,
          series: e.series.filter((_, idx) => idx !== seriesIndex)
        };
      }
      return e;
    }));
  };

  const handleUpdateSeries = (
    exerciseId: string, 
    seriesIndex: number, 
    field: 'reps' | 'weight',
    value: number
  ) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        return {
          ...e,
          series: e.series.map((s, idx) => 
            idx === seriesIndex ? { ...s, [field]: value } : s
          )
        };
      }
      return e;
    }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor, introduce un nombre para la rutina');
      return;
    }
    if (!muscleGroup) {
      alert('Por favor, selecciona un grupo muscular');
      return;
    }
    if (exercises.length === 0) {
      alert('Por favor, añade al menos un ejercicio');
      return;
    }

    // Validar que todos los ejercicios tengan nombre
    const hasEmptyNames = exercises.some(e => !e.name.trim());
    if (hasEmptyNames) {
      alert('Por favor, completa el nombre de todos los ejercicios');
      return;
    }

    const newWorkout: Workout = {
      id: workout?.id || generateId(),
      name,
      emoji: EMOJIS_BY_MUSCLE[muscleGroup as keyof typeof EMOJIS_BY_MUSCLE] || '💪',
      type: 'gym',
      muscleGroup,
      lastSession: new Date().toISOString().split('T')[0],
      exercises, // ← GUARDAR LOS EJERCICIOS
    };

    onSave(newWorkout);
  };

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
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-bold">
            {workout ? 'Editar Rutina' : 'Nueva Rutina de Gym'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Nombre de la rutina
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Día de piernas, Rutina espalda..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Grupo muscular */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Grupo muscular
            </label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona grupo muscular</option>
              {MUSCLE_GROUPS.map(group => (
                <option key={group} value={group}>
                  {EMOJIS_BY_MUSCLE[group as keyof typeof EMOJIS_BY_MUSCLE]} {group}
                </option>
              ))}
            </select>
          </div>

          {/* Ejercicios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold">Ejercicios</label>
              <button
                onClick={handleAddExercise}
                className="text-primary hover:text-primary-dark flex items-center gap-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Añadir ejercicio
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-3">No hay ejercicios añadidos</p>
                <button
                  onClick={handleAddExercise}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Añadir primer ejercicio
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.map((exercise, exerciseIdx) => (
                  <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {/* Nombre del ejercicio */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-semibold text-gray-600 text-sm">
                        #{exerciseIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => handleUpdateExerciseName(exercise.id, e.target.value)}
                        placeholder="Nombre del ejercicio (ej: Sentadillas)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Series */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">SERIES</span>
                        <button
                          onClick={() => handleAddSeries(exercise.id)}
                          className="text-primary hover:text-primary-dark text-xs font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Añadir serie
                        </button>
                      </div>

                      {exercise.series.map((series, seriesIdx) => (
                        <div key={seriesIdx} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                          <span className="text-xs text-gray-500 w-16">
                            Serie {seriesIdx + 1}
                          </span>
                          <input
                            type="number"
                            value={series.reps}
                            onChange={(e) => handleUpdateSeries(exercise.id, seriesIdx, 'reps', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">reps</span>
                          <input
                            type="number"
                            value={series.weight}
                            onChange={(e) => handleUpdateSeries(exercise.id, seriesIdx, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            min="0"
                            step="0.5"
                          />
                          <span className="text-xs text-gray-500">kg</span>
                          {exercise.series.length > 1 && (
                            <button
                              onClick={() => handleRemoveSeries(exercise.id, seriesIdx)}
                              className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              Guardar rutina
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}