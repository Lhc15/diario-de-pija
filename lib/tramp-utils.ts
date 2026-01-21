// Generar colores pastel aleatorios pero consistentes
export function generatePastelColor(seed: string): string {
  // Usar el seed para generar un color consistente
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generar HSL pastel (alta luminosidad, baja saturación)
  const hue = Math.abs(hash % 360);
  const saturation = 40 + (Math.abs(hash % 20)); // 40-60%
  const lightness = 85 + (Math.abs(hash % 10)); // 85-95%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}