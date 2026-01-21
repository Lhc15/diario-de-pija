import { supabase } from './supabase';
import { TrampNotification, UserId } from './types';

// Crear notificación
export async function createTrampNotification(
  userId: UserId,
  type: 'new_event' | 'new_photo',
  actorId: UserId,
  eventId: string,
  eventTitle: string
): Promise<boolean> {
  try {
    let message = '';
    
    if (type === 'new_event') {
      message = `ha creado el evento "${eventTitle}"`;
    } else {
      message = `ha subido una foto a "${eventTitle}"`;
    }

    const { error } = await supabase
      .from('tramp_notifications')
      .insert({
        user_id: userId,
        type,
        actor_id: actorId,
        event_id: eventId,
        event_title: eventTitle,
        message,
        read: false,
      });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createTrampNotification:', error);
    return false;
  }
}

// Obtener notificaciones no leídas
export async function getUnreadNotifications(
  userId: UserId
): Promise<TrampNotification[]> {
  try {
    const { data, error } = await supabase
      .from('tramp_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting notifications:', error);
      return [];
    }

    return (data || []).map((notif: {
      id: number;
      user_id: string;
      type: string;
      actor_id: string;
      event_id: string;
      event_title: string;
      message: string;
      read: boolean;
      created_at: string;
    }) => ({
      id: notif.id,
      userId: notif.user_id as UserId,
      type: notif.type as 'new_event' | 'new_photo',
      actorId: notif.actor_id as UserId,
      eventId: notif.event_id,
      eventTitle: notif.event_title,
      message: notif.message,
      read: notif.read,
      createdAt: notif.created_at,
    }));
  } catch (error) {
    console.error('Error in getUnreadNotifications:', error);
    return [];
  }
}

// Marcar notificación como leída
export async function markNotificationAsRead(
  notificationId: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tramp_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
}

// Marcar todas las notificaciones como leídas
export async function markAllNotificationsAsRead(
  userId: UserId
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tramp_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return false;
  }
}

// Contar notificaciones no leídas
export async function countUnreadNotifications(
  userId: UserId
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('tramp_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error counting notifications:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in countUnreadNotifications:', error);
    return 0;
  }
}