import { supabase } from './supabase';
import { TrampEvent, TrampPhoto } from './types';

// Cargar todos los eventos
export async function loadTrampEvents(): Promise<TrampEvent[]> {
  try {
    const { data: events, error: eventsError } = await supabase
      .from('tramp_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error loading events:', eventsError);
      return [];
    }

    if (!events) return [];

    // Cargar fotos para cada evento
    const eventsWithPhotos = await Promise.all(
      events.map(async (event: {
        id: string;
        title: string;
        description: string | null;
        start_date: string;
        color: string;
        created_by: string;
        created_at: string;
      }) => {
        const { data: photos, error: photosError } = await supabase
          .from('tramp_photos')
          .select('*')
          .eq('event_id', event.id)
          .order('uploaded_at', { ascending: false });

        if (photosError) {
          console.error('Error loading photos for event:', event.id, photosError);
        }

        return {
          id: event.id,
          title: event.title,
          description: event.description || undefined,
          startDate: event.start_date,
          color: event.color,
          photos: photos || [],
          createdBy: event.created_by,
          createdAt: event.created_at,
        } as TrampEvent;
      })
    );

    return eventsWithPhotos;
  } catch (error) {
    console.error('Error in loadTrampEvents:', error);
    return [];
  }
}

// Crear nuevo evento
export async function createTrampEvent(
  event: Omit<TrampEvent, 'photos'>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tramp_events')
      .insert({
        id: event.id,
        title: event.title,
        description: event.description,
        start_date: event.startDate,
        color: event.color,
        created_by: event.createdBy,
        created_at: event.createdAt,
      });

    if (error) {
      console.error('Error creating event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createTrampEvent:', error);
    return false;
  }
}

// Subir foto a un evento
export async function uploadTrampPhoto(
  photo: TrampPhoto
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tramp_photos')
      .insert({
        id: photo.id,
        event_id: photo.eventId,
        image_url: photo.imageUrl,
        uploaded_by: photo.uploadedBy,
        uploaded_at: photo.uploadedAt,
        caption: photo.caption,
      });

    if (error) {
      console.error('Error uploading photo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in uploadTrampPhoto:', error);
    return false;
  }
}

// Subir imagen a Supabase Storage
export async function uploadTrampImage(
  eventId: string,
  file: File,
  photoId: string
): Promise<string | null> {
  try {
    const fileName = `${eventId}/${photoId}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('tramp-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // Obtener URL pública
    const { data } = supabase.storage
      .from('tramp-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadTrampImage:', error);
    return null;
  }
}

// Eliminar evento (opcional)
export async function deleteTrampEvent(eventId: string): Promise<boolean> {
  try {
    // Las fotos se eliminan automáticamente por CASCADE
    const { error } = await supabase
      .from('tramp_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTrampEvent:', error);
    return false;
  }
}