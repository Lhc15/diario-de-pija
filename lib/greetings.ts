import { supabase } from './supabase';

// Tipo para la tabla shared_greetings
interface SharedGreeting {
  id: number;
  greeting: string;
  created_by: string;
  created_at: string;
}

// Cargar saludos compartidos
export async function loadSharedGreetings(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('shared_greetings')
      .select('greeting')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading greetings:', error);
      return getDefaultGreetings();
    }

    return data.map((row: { greeting: string }) => row.greeting);
  } catch (error) {
    console.error('Error in loadSharedGreetings:', error);
    return getDefaultGreetings();
  }
}

// Añadir saludo compartido
export async function addSharedGreeting(greeting: string, createdBy: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('shared_greetings')
      .insert({
        greeting,
        created_by: createdBy
      });

    if (error) {
      console.error('Error adding greeting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addSharedGreeting:', error);
    return false;
  }
}

// Eliminar saludo compartido
export async function deleteSharedGreeting(greeting: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('shared_greetings')
      .delete()
      .eq('greeting', greeting);

    if (error) {
      console.error('Error deleting greeting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSharedGreeting:', error);
    return false;
  }
}

// Actualizar saludo compartido
export async function updateSharedGreeting(oldGreeting: string, newGreeting: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('shared_greetings')
      .update({ greeting: newGreeting })
      .eq('greeting', oldGreeting);

    if (error) {
      console.error('Error updating greeting:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSharedGreeting:', error);
    return false;
  }
}

// Saludos por defecto (fallback)
function getDefaultGreetings(): string[] {
  return [
    'Hola cremru',
    'Bondia gorda traicionera',
    'TCA entrando al chat',
    '¿Cómo está mi pija de urba?',
    'Bondia bebukona',
    'Bondia y adiós atracones',
    'I love atracones y Vicki me deja!'
  ];
}