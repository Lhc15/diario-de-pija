import { create } from 'zustand';
import { AppState, UserData, UserId } from './types';

// Constantes
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

// Inicializar datos vacíos para un usuario
const initEmptyUserData = (userId: UserId): UserData => ({
  userId,
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

// Helper para localStorage
const getStorageKey = (userId: UserId) => `diario_${userId}_data`;

const loadFromStorage = (userId: UserId): UserData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(getStorageKey(userId));
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (userId: UserId, data: UserData) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Store
export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  viewingUser: null,
  isAuthenticated: false,
  userData: null,

  login: (userId: UserId) => {
    const data = loadFromStorage(userId) || initEmptyUserData(userId);
    
    set({
      currentUser: userId,
      isAuthenticated: true,
      userData: data,
      viewingUser: null
    });

    // Guardar sesión
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user', userId);
    }
  },

  logout: () => {
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

  viewOtherUser: (userId: UserId) => {
    const data = loadFromStorage(userId) || initEmptyUserData(userId);
    
    set({
      viewingUser: userId,
      userData: data
    });
  },

  backToMyApp: () => {
    const { currentUser } = get();
    if (!currentUser) return;

    const data = loadFromStorage(currentUser) || initEmptyUserData(currentUser);
    
    set({
      viewingUser: null,
      userData: data
    });
  },

  updateUserData: (newData: Partial<UserData>) => {
    const { userData, currentUser, viewingUser } = get();
    
    // No actualizar si estamos viendo otro usuario
    if (viewingUser) return;
    if (!userData || !currentUser) return;

    const updated = { ...userData, ...newData };
    
    set({ userData: updated });
    saveToStorage(currentUser, updated);
  },

  loadUserData: (userId: UserId) => {
    const data = loadFromStorage(userId) || initEmptyUserData(userId);
    set({ userData: data });
  },

  saveUserData: () => {
    const { currentUser, userData, viewingUser } = get();
    
    if (viewingUser || !currentUser || !userData) return;
    
    saveToStorage(currentUser, userData);
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