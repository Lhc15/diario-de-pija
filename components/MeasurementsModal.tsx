'use client';

import { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { MeasurementRecord } from '@/lib/types';
import { getDateKey } from '@/lib/utils';

interface MeasurementsModalProps {
  onSave: (record: MeasurementRecord) => void;
  onClose: () => void;
  initialDate?: string;
}

export default function MeasurementsModal({ onSave, onClose, initialDate }: MeasurementsModalProps) {
  const [date, setDate] = useState(initialDate || getDateKey(new Date()));
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [legs, setLegs] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // Al menos una medida debe estar completada
    if (!chest && !waist && !hips && !arms && !legs) {
      alert('Por favor, introduce al menos una medida');
      return;
    }

    const record: MeasurementRecord = {
      date,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      arms: arms ? parseFloat(arms) : undefined,
      legs: legs ? parseFloat(legs) : undefined,
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
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Registrar medidas</h2>
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

          {/* Medidas */}
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Todas las medidas en centímetros (cm)</p>

            {/* Pecho */}
            <div>
              <label className="block text-sm font-semibold mb-2">💪 Pecho</label>
              <input
                type="number"
                step="0.5"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                placeholder="95.5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Cintura */}
            <div>
              <label className="block text-sm font-semibold mb-2">📏 Cintura</label>
              <input
                type="number"
                step="0.5"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="75.0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Cadera */}
            <div>
              <label className="block text-sm font-semibold mb-2">🍑 Cadera</label>
              <input
                type="number"
                step="0.5"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                placeholder="95.0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Brazos */}
            <div>
              <label className="block text-sm font-semibold mb-2">💪 Brazos</label>
              <input
                type="number"
                step="0.5"
                value={arms}
                onChange={(e) => setArms(e.target.value)}
                placeholder="30.0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Piernas */}
            <div>
              <label className="block text-sm font-semibold mb-2">🦵 Piernas</label>
              <input
                type="number"
                step="0.5"
                value={legs}
                onChange={(e) => setLegs(e.target.value)}
                placeholder="55.0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold mb-2">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Medida en la mañana, flexionado..."
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