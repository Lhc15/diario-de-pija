import { UserData, DailySummary } from './types';

// Formatear fecha como "Lunes 16 Enero"
export const formatDate = (date: Date | string): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
};

// Obtener clave de fecha en formato YYYY-MM-DD
export const getDateKey = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Obtener fecha de hoy
export const getTodayKey = (): string => {
  return getDateKey(new Date());
};

// Calcular días entre dos fechas
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diff = d2.getTime() - d1.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Obtener el número de día de la dieta basado en la fecha de inicio
export const getDietDayNumber = (startDate: string, currentDate: string): number => {
  const days = daysBetween(startDate, currentDate);
  // Ciclo de 7 días
  return ((days % 7) + 7) % 7 || 7; // 1-7
};

// Evaluar si un día está completo
export const evaluateDayCompletion = (
  userData: UserData,
  dateKey: string
): { completed: boolean; color: 'green' | 'red' | 'white' } => {
  const meals = userData.meals[dateKey] || [];
  const scheduledWorkoutIds = userData.scheduledWorkouts[dateKey] || [];
  
  // Obtener sesiones completadas de ese día
  const completedGymSessions = userData.gymSessions.filter(
    s => s.date === dateKey && s.completed
  );
  const completedOtherSports = userData.otherSports.filter(
    s => s.date === dateKey
  );

  // Si no hay nada programado ese día
  if (meals.length === 0 && scheduledWorkoutIds.length === 0) {
    return { completed: false, color: 'white' };
  }

  // Verificar comidas
  const allMealsCompleted = meals.length > 0 && meals.every(m => m.completed);

  // Verificar entrenamientos
  const totalScheduledWorkouts = scheduledWorkoutIds.length;
  const totalCompletedWorkouts = completedGymSessions.length + completedOtherSports.length;
  
  const allWorkoutsCompleted = totalScheduledWorkouts === 0 || 
                                totalScheduledWorkouts === totalCompletedWorkouts;

  const isFullyCompleted = allMealsCompleted && allWorkoutsCompleted;

  return {
    completed: isFullyCompleted,
    color: isFullyCompleted ? 'green' : 'red'
  };
};

// Actualizar resumen diario y estadísticas
export const updateDailySummaryAndStats = (
  userData: UserData,
  dateKey: string
): UserData => {
  const evaluation = evaluateDayCompletion(userData, dateKey);
  
  const newSummary: DailySummary = {
    date: dateKey,
    completed: evaluation.completed,
    color: evaluation.color
  };

  const updatedDailySummary = {
    ...userData.dailySummary,
    [dateKey]: newSummary
  };

  // Actualizar estadísticas
  const wasCompleted = userData.dailySummary[dateKey]?.completed || false;
  let newStats = { ...userData.stats };

  if (evaluation.completed && !wasCompleted) {
    // Se completó un día que antes no estaba
    newStats.totalCompletedDays += 1;
    newStats.currentStreak += 1;
    if (newStats.currentStreak > newStats.bestStreak) {
      newStats.bestStreak = newStats.currentStreak;
    }
  } else if (!evaluation.completed && wasCompleted) {
    // Se descompletó un día
    newStats.totalCompletedDays = Math.max(0, newStats.totalCompletedDays - 1);
    newStats.currentStreak = 0;
  }

  return {
    ...userData,
    dailySummary: updatedDailySummary,
    stats: newStats
  };
};

// Generar ID único
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validar formato de fecha YYYY-MM-DD
export const isValidDateKey = (dateKey: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateKey)) return false;
  
  const date = new Date(dateKey);
  return date instanceof Date && !isNaN(date.getTime());
};