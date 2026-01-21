'use client';

import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface UploadPhotoModalProps {
  eventTitle: string;
  onSave: (file: File, caption?: string) => Promise<void>;
  onClose: () => void;
}

export default function UploadPhotoModal({ eventTitle, onSave, onClose }: UploadPhotoModalProps) {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('La imagen es demasiado grande (máx 10MB)');
        return;
      }
      setSelectedFile(file);
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      alert('Selecciona una imagen');
      return;
    }

    setIsUploading(true);
    try {
      await onSave(selectedFile, caption.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold">Subir foto</h2>
              <p className="text-xs text-gray-500">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Upload area */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!preview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary hover:bg-gray-50 transition text-center"
                disabled={isUploading}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  Click para seleccionar imagen
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG o GIF (máx 10MB)
                </p>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full rounded-lg object-cover max-h-64"
                />
                <button
                  onClick={() => {
                    setPreview(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Caption */}
          {selectedFile && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Añade un comentario..."
                rows={2}
                disabled={isUploading}
              />
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedFile || isUploading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Subiendo...' : 'Subir foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}