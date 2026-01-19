'use client';

import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Workout } from '@/lib/types';
import { getDateKey } from '@/lib/utils';

interface ScheduleWorkoutModalProps {
  workouts: Workout[];
  initialDate?: string;
  onSave: (workoutId: string, date: string, time: string) => void;
  onClose: () => void;
}

export default function ScheduleWorkoutModal({
  workouts,
  initialDate,
  onSave,
  onClose,
}: ScheduleWorkoutModalProps) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [date, setDate] = useState(initialDate || getDateKey(new Date()));
  const [time, setTime] = useState('09:00');

  const handleSave = () => {
    if (!selectedWorkoutId) {
      alert('Por favor, selecciona un entrenamiento');
      return;
    }

    onSave(selectedWorkoutId, date, time);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Programar entrenamiento</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Seleccionar entrenamiento */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Entrenamiento
            </label>
            {workouts.length === 0 ? (
              <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                No tienes entrenamientos creados. <br />
                Ve a la pestaña Deporte para crear uno.
              </p>
            ) : (
              <select
                value={selectedWorkoutId}
                onChange={(e) => setSelectedWorkoutId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona un entrenamiento</option>
                {workouts.map((workout) => (
                  <option key={workout.id} value={workout.id}>
                    {workout.emoji} {workout.name} - {workout.muscleGroup}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Seleccionar fecha */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Seleccionar hora */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Hora
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={workouts.length === 0}
              className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Programar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}