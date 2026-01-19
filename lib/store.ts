import { create } from 'zustand';
import { AppState, UserData, UserId } from './types';
import { supabase } from './supabase';

// Inicializar datos vacíos para un usuario
const initEmptyUserData = (userId: string): Omit<UserData, 'userId'> => ({
  dietPlan: null,
  meals: {},
  workouts: [],
  gymSessions: [],
  otherSports: [],
  scheduledWorkouts: {},
  weight: [],
  measurements: [],
  nutritionist: {
    nextAppointment: '',
    appointments: []
  },
  dailySummary: {},
  stats: {
    totalCompletedDays: 0,
    currentStreak: 0,
    bestStreak: 0
  }
});

// Cargar datos del usuario desde Supabase
const loadFromSupabase = async (userId: string): Promise<UserData | null> => {
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No existe el registro, crearlo
        const emptyData = initEmptyUserData(userId);
        const { data: newData, error: insertError } = await supabase
          .from('user_data')
          .insert({
            user_id: userId,
            ...emptyData
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creando datos:', insertError);
          return null;
        }

        return {
          userId: userId as UserId,
          ...emptyData
        };
      }
      console.error('Error cargando datos:', error);
      return null;
    }

    // Mapear los datos de Supabase a UserData
    return {
      userId: userId as UserId,
      dietPlan: data.diet_plan,
      meals: data.meals || {},
      workouts: data.workouts || [],
      gymSessions: data.gym_sessions || [],
      otherSports: data.other_sports || [],
      scheduledWorkouts: data.scheduled_workouts || {},
      weight: data.weight || [],
      measurements: data.measurements || [],
      nutritionist: data.nutritionist || {
        nextAppointment: '',
        appointments: []
      },
      dailySummary: data.daily_summary || {},
      stats: data.stats || {
        totalCompletedDays: 0,
        currentStreak: 0,
        bestStreak: 0
      }
    };
  } catch (error) {
    console.error('Error en loadFromSupabase:', error);
    return null;
  }
};

// Guardar datos en Supabase
const saveToSupabase = async (userId: string, userData: UserData) => {
  try {
    console.log('💾 Guardando datos en Supabase para:', userId);
    console.log('Datos a guardar:', {
      workouts: userData.workouts,
      meals: Object.keys(userData.meals).length + ' días',
      gymSessions: userData.gymSessions.length
    });

    const { data, error } = await supabase
      .from('user_data')
      .update({
        diet_plan: userData.dietPlan,
        meals: userData.meals,
        workouts: userData.workouts,
        gym_sessions: userData.gymSessions,
        other_sports: userData.otherSports,
        scheduled_workouts: userData.scheduledWorkouts,
        weight: userData.weight,
        measurements: userData.measurements,
        nutritionist: userData.nutritionist,
        daily_summary: userData.dailySummary,
        stats: userData.stats,
      })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('❌ Error guardando datos:', error);
      throw error;
    }

    console.log('✅ Datos guardados correctamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error en saveToSupabase:', error);
    throw error;
  }
};

// Store
export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  viewingUser: null,
  isAuthenticated: false,
  userData: null,

  login: async (userId: UserId) => {
    // Cargar datos de Supabase
    const data = await loadFromSupabase(userId);
    
    if (!data) {
      console.error('No se pudieron cargar los datos del usuario');
      return;
    }

    set({
      currentUser: userId,
      isAuthenticated: true,
      userData: data,
      viewingUser: null
    });

    // Guardar sesión en localStorage solo para recordar login
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user', userId);
    }
  },

  logout: async () => {
    // Cerrar sesión de Supabase
    await supabase.auth.signOut();

    set({
      currentUser: null,
      viewingUser: null,
      isAuthenticated: false,
      userData: null
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_user');
    }
  },

  viewOtherUser: async (userId: UserId) => {
    const data = await loadFromSupabase(userId);
    
    if (!data) {
      console.error('No se pudieron cargar los datos del otro usuario');
      return;
    }

    set({
      viewingUser: userId,
      userData: data
    });
  },

  backToMyApp: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    const data = await loadFromSupabase(currentUser);
    
    if (!data) {
      console.error('No se pudieron cargar tus datos');
      return;
    }

    set({
      viewingUser: null,
      userData: data
    });
  },

  updateUserData: async (newData: Partial<UserData>) => {
    const { userData, currentUser, viewingUser } = get();
    
    // No actualizar si estamos viendo otro usuario
    if (viewingUser) return;
    if (!userData || !currentUser) return;

    const updated = { ...userData, ...newData };
    
    // Actualizar estado local inmediatamente
    set({ userData: updated });
    
    // Guardar en Supabase en background
    await saveToSupabase(currentUser, updated);
  },

  loadUserData: async (userId: UserId) => {
    const data = await loadFromSupabase(userId);
    if (data) {
      set({ userData: data });
    }
  },

  saveUserData: async () => {
    const { currentUser, userData, viewingUser } = get();
    
    if (viewingUser || !currentUser || !userData) return;
    
    await saveToSupabase(currentUser, userData);
  }
}));

// Hook para verificar si estamos en modo solo lectura
export const useIsReadOnly = () => {
  const viewingUser = useAppStore(state => state.viewingUser);
  return viewingUser !== null;
};

// Hook para obtener el userId activo (el que se está viendo)
export const useActiveUserId = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const viewingUser = useAppStore(state => state.viewingUser);
  return viewingUser || currentUser;
};

// Constantes de usuarios (mantener para compatibilidad)
export const USERS = {
  miguel: {
    id: 'miguel' as UserId,
    username: 'Miguel',
    password: 'notengoflotadoresya',
    displayName: 'Miguel',
    avatar: '🏊‍♂️'
  },
  lorena: {
    id: 'lorena' as UserId,
    username: 'Lorena',
    password: 'caderitasdeescandalo',
    displayName: 'Lorena',
    avatar: '💃'
  }
};