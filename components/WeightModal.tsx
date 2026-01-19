'use client';

import { useState } from 'react';
import { X, Scale } from 'lucide-react';
import { WeightRecord } from '@/lib/types';
import { getDateKey, generateId } from '@/lib/utils';

interface WeightModalProps {
  onSave: (record: WeightRecord) => void;
  onClose: () => void;
  initialDate?: string;
}

export default function WeightModal({ onSave, onClose, initialDate }: WeightModalProps) {
  const [date, setDate] = useState(initialDate || getDateKey(new Date()));
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const weightNum = parseFloat(weight);
    
    if (!weightNum || weightNum <= 0) {
      alert('Por favor, introduce un peso válido');
      return;
    }

    const record: WeightRecord = {
      date,
      weight: weightNum,
      notes: notes.trim() || undefined,
    };

    onSave(record);
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
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Registrar peso</h2>
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
            <label className="block text-sm font-semibold mb-2">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Peso */}
          <div>
            <label className="block text-sm font-semibold mb-2">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="65.5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold mb-2">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: En ayunas, después de entrenar..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
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
              className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg font-medium transition"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}