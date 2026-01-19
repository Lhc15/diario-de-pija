'use client';

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { getDateKey } from '@/lib/utils';

interface NutritionistModalProps {
  currentDate?: string;
  onSave: (date: string) => void;
  onClose: () => void;
}

export default function NutritionistModal({ currentDate, onSave, onClose }: NutritionistModalProps) {
  const [date, setDate] = useState(currentDate || '');

  const handleSave = () => {
    if (!date) {
      alert('Por favor, selecciona una fecha');
      return;
    }

    onSave(date);
    onClose();
  };

  const handleClear = () => {
    onSave('');
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
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Próxima cita</h2>
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
          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Fecha de la cita con nutricionista
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <div className="flex gap-3">
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
                Guardar
              </button>
            </div>
            
            {currentDate && (
              <button
                onClick={handleClear}
                className="w-full text-red-600 text-sm font-medium hover:underline"
              >
                Eliminar cita
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}