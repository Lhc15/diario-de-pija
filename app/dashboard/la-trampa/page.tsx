'use client';

import { useState } from 'react';
import { useAppStore, useIsReadOnly, USERS } from '@/lib/store';
import { Plus, Camera, Calendar } from 'lucide-react';
import { generatePastelColor, generateId } from '@/lib/tramp-utils';
import { TrampEvent, TrampPhoto } from '@/lib/types';
import CreateEventModal from '@/components/CreateEventModal';
import UploadPhotoModal from '@/components/UploadPhotoModal';
import { supabase } from '@/lib/supabase';

export default function LaTrampPage() {
  const { userData, updateUserData, currentUser } = useAppStore();
  const isReadOnly = useIsReadOnly();
  
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [uploadingToEvent, setUploadingToEvent] = useState<string | null>(null);

  if (!userData || !currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const events = userData.trampEvents || [];

  const handleCreateEvent = (title: string, description: string, startDate: string) => {
    const newEvent: TrampEvent = {
      id: generateId(),
      title,
      description: description || undefined,
      startDate,
      color: generatePastelColor(title + startDate),
      photos: [],
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    };

    updateUserData({
      ...userData,
      trampEvents: [...events, newEvent],
    });
  };

  const handleUploadPhoto = async (eventId: string, file: File, caption?: string) => {
    try {
      // Subir imagen a Supabase Storage
      const fileName = `${eventId}/${generateId()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('tramp-photos')
        .upload(fileName, file);

      if (error) throw error;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('tramp-photos')
        .getPublicUrl(fileName);

      // Crear registro de foto
      const newPhoto: TrampPhoto = {
        id: generateId(),
        eventId,
        imageUrl: publicUrl,
        uploadedBy: currentUser,
        uploadedAt: new Date().toISOString(),
        caption,
      };

      // Actualizar evento
      const updatedEvents = events.map(event =>
        event.id === eventId
          ? { ...event, photos: [...event.photos, newPhoto] }
          : event
      );

      updateUserData({
        ...userData,
        trampEvents: updatedEvents,
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">🎉 La Trampa</h1>
          <p className="text-gray-600">Momentos especiales compartidos</p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setShowCreateEvent(true)}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo evento
          </button>
        )}
      </div>

      {/* Eventos */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-lg font-bold mb-2">No hay eventos todavía</h3>
          <p className="text-gray-600 mb-6">
            Crea tu primer evento y empieza a guardar recuerdos
          </p>
          {!isReadOnly && (
            <button
              onClick={() => setShowCreateEvent(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Crear primer evento
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {events
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((event) => (
              <div
                key={event.id}
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: event.color }}
              >
                {/* Event Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-1">{event.title}</h2>
                    {event.description && (
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Desde {new Date(event.startDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => setUploadingToEvent(event.id)}
                      className="bg-white/80 hover:bg-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow"
                    >
                      <Camera className="w-4 h-4" />
                      Subir foto
                    </button>
                  )}
                </div>

                {/* Photos */}
                {event.photos.length === 0 ? (
                  <div className="bg-white/60 rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Aún no hay fotos en este evento
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {event.photos
                      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                      .map((photo) => {
                        const user = USERS[photo.uploadedBy];
                        const date = new Date(photo.uploadedAt);
                        
                        return (
                          <div key={photo.id} className="bg-white/80 rounded-lg p-4">
                            {/* Photo metadata */}
                            <div className="mb-2">
                              <p className="font-semibold text-sm">
                                {user.displayName} {user.avatar}
                              </p>
                              <p className="text-xs text-gray-600">
                                {date.toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            
                            {/* Photo */}
                            <img
                              src={photo.imageUrl}
                              alt={photo.caption || 'Foto del evento'}
                              className="w-full rounded-lg object-cover"
                              loading="lazy"
                            />
                            
                            {/* Caption */}
                            {photo.caption && (
                              <p className="text-sm text-gray-700 mt-2">{photo.caption}</p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Modals */}
      {showCreateEvent && (
        <CreateEventModal
          onSave={handleCreateEvent}
          onClose={() => setShowCreateEvent(false)}
        />
      )}

      {uploadingToEvent && (
        <UploadPhotoModal
          eventTitle={events.find(e => e.id === uploadingToEvent)?.title || ''}
          onSave={(file, caption) => handleUploadPhoto(uploadingToEvent, file, caption)}
          onClose={() => setUploadingToEvent(null)}
        />
      )}
    </div>
  );
}