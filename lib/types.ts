// Tipos de Usuario
export type UserId = 'miguel' | 'lorena';

export interface User {
  id: UserId;
  username: string;
  password: string;
  displayName: string;
  avatar: string;
}

// Tipos de Comidas
export interface Meal {
  id: string;
  dayNumber: number; // 1-7 del PDF
  time: string; // "08:00"
  type: 'Desayuno' | 'Media mañana' | 'Almuerzo' | 'Merienda' | 'Cena';
  name: string;
  emoji: string;
  ingredients: string;
  recipe: string;
  notes?: string;
  completed: boolean;
}

// Tipos de Deportes
export interface Exercise {
  id: string;
  name: string;
  series: ExerciseSeries[];
}

export interface ExerciseSeries {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface GymSession {
  id: string;
  workoutId: string;
  date: string; // YYYY-MM-DD
  muscleGroup: string;
  exercises: Exercise[];
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  emoji: string;
  type: 'gym' | 'other';
  muscleGroup?: string;
  lastSession?: string;
  exercises?: Exercise[];  // ← DEBE ESTAR ESTA LÍNEA
}

export interface OtherSportRecord {
  id: string;
  workoutId: string;
  date: string;
  goals: string;
  achievements: string;
  notes: string;
}

// Tipos de Métricas
export interface WeightRecord {
  date: string;
  value: number;
  notes?: string;
}

export interface MeasurementRecord {
  date: string;
  waist?: number;
  hips?: number;
  arms?: number;
  legs?: number;
  chest?: number;
}

export interface NutritionistAppointment {
  date: string;
  weight: number;
  feedback: string;
}

export interface Nutritionist {
  nextAppointment: string;
  appointments: NutritionistAppointment[];
}

// Resumen diario
export interface DailySummary {
  date: string;
  completed: boolean;
  color: 'green' | 'red' | 'white';
}

// Estadísticas
export interface Stats {
  totalCompletedDays: number;
  currentStreak: number;
  bestStreak: number;
}

// Plan de dieta completo
export interface DietPlan {
  id: string;
  userId: UserId;
  startDate: string; // YYYY-MM-DD - Día que empieza el plan
  pdfUrl?: string;
  meals: Record<number, Meal[]>; // dayNumber -> meals
  createdAt: string;
}

// Datos completos del usuario
export interface UserData {
  userId: UserId;
  dietPlan: DietPlan | null;
  meals: Record<string, Meal[]>; // dateKey -> meals
  workouts: Workout[];
  gymSessions: GymSession[]; // ← ARRAY, no objeto
  otherSports: OtherSportRecord[]; // ← Cambiado de otherSportRecords
  scheduledWorkouts: Record<string, ScheduledWorkout[]>; // dateKey -> scheduled workouts
  weight: WeightRecord[];
  measurements: MeasurementRecord[];
  nutritionist: Nutritionist;
  dailySummary: Record<string, DailySummary>;
  stats: Stats;
}
export interface ScheduledWorkout {
  workoutId: string;
  time: string; // HH:mm
}
// Estado de la app
export interface AppState {
  currentUser: UserId | null;
  viewingUser: UserId | null; // Para modo solo lectura
  isAuthenticated: boolean;
  userData: UserData | null;
  
  // Acciones
  login: (userId: UserId) => void;
  logout: () => void;
  viewOtherUser: (userId: UserId) => void;
  backToMyApp: () => void;
  updateUserData: (data: Partial<UserData>) => void;
  loadUserData: (userId: UserId) => void;
  saveUserData: () => void;
}