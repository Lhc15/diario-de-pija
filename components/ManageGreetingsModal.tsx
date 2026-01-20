'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';

interface ManageGreetingsModalProps {
  currentGreetings: string[];
  onSave: (greetings: string[]) => void;
  onClose: () => void;
}

export default function ManageGreetingsModal({
  currentGreetings,
  onSave,
  onClose,
}: ManageGreetingsModalProps) {
  const [greetings, setGreetings] = useState<string[]>([...currentGreetings]);
  const [newGreeting, setNewGreeting] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAdd = () => {
    if (!newGreeting.trim()) {
      alert('El saludo no puede estar vacío');
      return;
    }
    setGreetings([...greetings, newGreeting.trim()]);
    setNewGreeting('');
  };

  const handleDelete = (index: number) => {
    setGreetings(greetings.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(greetings[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    if (!editingText.trim()) {
      alert('El saludo no puede estar vacío');
      return;
    }
    const updated = [...greetings];
    updated[editingIndex] = editingText.trim();
    setGreetings(updated);
    setEditingIndex(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const handleSave = () => {
    if (greetings.length === 0) {
      alert('Debes tener al menos un saludo');
      return;
    }
    onSave(greetings);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold">Gestionar saludos</h2>
            <p className="text-sm text-gray-500">
              Personaliza los saludos que aparecen al entrar
            </p>
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
          {/* Añadir nuevo saludo */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Añadir nuevo saludo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGreeting}
                onChange={(e) => setNewGreeting(e.target.value)}
                placeholder="Ej: ¡Buenos días campeón!"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
              />
              <button
                onClick={handleAdd}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Añadir
              </button>
            </div>
          </div>

          {/* Lista de saludos */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Saludos actuales ({greetings.length})
            </h3>
            {greetings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay saludos. ¡Añade tu primer saludo!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {greetings.map((greeting, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
                  >
                    {editingIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700 p-2"
                          title="Guardar"
                        >
                          <Plus className="w-5 h-5 rotate-45" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Cancelar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{greeting}</span>
                        <button
                          onClick={() => handleStartEdit(index)}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-primary p-2 transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 p-2 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nota informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Los saludos se mostrarán aleatoriamente
              cada vez que entres a la app.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
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
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}