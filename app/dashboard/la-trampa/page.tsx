'use client';

import { useState, useEffect } from 'react';
import { useAppStore, useIsReadOnly, USERS } from '@/lib/store';
import { Plus, Camera, Calendar, RefreshCw } from 'lucide-react';
import { generatePastelColor, generateId } from '@/lib/tramp-utils';
import { TrampEvent, TrampPhoto } from '@/lib/types';
import CreateEventModal from '@/components/CreateEventModal';
import UploadPhotoModal from '@/components/UploadPhotoModal';
import { 
  loadTrampEvents, 
  createTrampEvent, 
  uploadTrampPhoto, 
  uploadTrampImage 
} from '@/lib/tramp';

export default function LaTrampPage() {
  const { currentUser } = useAppStore();
  const isReadOnly = useIsReadOnly();
  
  const [events, setEvents] = useState<TrampEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [uploadingToEvent, setUploadingToEvent] = useState<string | null>(null);

  // Cargar eventos al montar
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    const loaded = await loadTrampEvents();
    setEvents(loaded);
    setIsLoading(false);
  };

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const handleCreateEvent = async (title: string, description: string, startDate: string) => {
    const newEvent: Omit<TrampEvent, 'photos'> = {
      id: generateId(),
      title,
      description: description || undefined,
      startDate,
      color: generatePastelColor(title + startDate),
      createdBy: currentUser,
      createdAt: new Date().toISOString(),
    };

    const success = await createTrampEvent(newEvent);
    
    if (success) {
      await loadEvents(); // Recargar eventos
    } else {
      alert('Error al crear el evento');
    }
  };

  const handleUploadPhoto = async (eventId: string, file: File, caption?: string) => {
    try {
      const photoId = generateId();
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        throw new Error('Evento no encontrado');
      }
      
      // Subir imagen a Storage
      const imageUrl = await uploadTrampImage(eventId, file, photoId);
      
      if (!imageUrl) {
        throw new Error('Error al subir la imagen');
      }

      // Crear registro de foto
      const newPhoto: TrampPhoto = {
        id: photoId,
        eventId,
        imageUrl,
        uploadedBy: currentUser,
        uploadedAt: new Date().toISOString(),
        caption,
      };

      const success = await uploadTrampPhoto(newPhoto, event.title);
      
      if (success) {
        await loadEvents(); // Recargar eventos con las nuevas fotos
      } else {
        throw new Error('Error al guardar la foto');
      }
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
        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Recargar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
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
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      ) : events.length === 0 ? (
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
          {events.map((event) => {
            const creator = USERS[event.createdBy];
            
            return (
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
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Desde {new Date(event.startDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span>
                        Creado por {creator?.displayName} {creator?.avatar}
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
                    {event.photos.map((photo) => {
                      const uploader = USERS[photo.uploadedBy];
                      const date = new Date(photo.uploadedAt);
                      
                      return (
                        <div key={photo.id} className="bg-white/80 rounded-lg p-4">
                          {/* Photo metadata */}
                          <div className="mb-2">
                            <p className="font-semibold text-sm">
                              {uploader?.displayName} {uploader?.avatar}
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
            );
          })}
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