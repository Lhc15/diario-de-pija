'use client';

import { useState } from 'react';
import { X, Edit } from 'lucide-react';

interface EditMealNameModalProps {
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export default function EditMealNameModal({ currentName, onSave, onClose }: EditMealNameModalProps) {
  const [name, setName] = useState(currentName);

  const handleSave = () => {
    if (!name.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }
    onSave(name.trim());
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
            <Edit className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Editar comida</h2>
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
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold mb-2">Nombre de la comida</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: Pollo con arroz y verduras"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
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