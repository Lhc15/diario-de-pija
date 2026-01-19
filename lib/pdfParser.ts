import * as pdfjsLib from 'pdfjs-dist';
import { Meal } from './types';
import { generateId } from './utils';

// Configurar worker de PDF.js (LOCAL)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

// Emojis por tipo de comida
const MEAL_EMOJIS: Record<string, string> = {
  'Desayuno': '🌅',
  'Media mañana': '🍎',
  'Comida': '🍲',
  'Merienda': '🧃',
  'Cena': '🌙',
};

interface ParsedDay {
  dayNumber: number;
  meals: Meal[];
}

/**
 * Extrae texto completo del PDF manteniendo estructura
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    const header = new Uint8Array(arrayBuffer.slice(0, 4));
    const headerStr = String.fromCharCode(...header);
    if (headerStr !== '%PDF') {
      throw new Error('El archivo no es un PDF válido');
    }
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log('📄 PDF cargado, páginas:', pdf.numPages);
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extraer y mantener formato
      let pageText = '';
      for (const item of textContent.items) {
        const textItem = item as any;
        pageText += textItem.str + ' ';
      }
      
      fullText += pageText + '\n\n';
    }
    
    console.log('📝 Texto extraído:', fullText.length, 'caracteres');
    console.log('Primeros 1000 caracteres:\n', fullText.substring(0, 1000));
    
    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No se pudo extraer texto del PDF.');
    }
    
    return fullText;
  } catch (error: any) {
    console.error('❌ Error extrayendo texto:', error);
    throw new Error(error.message || 'No se pudo leer el PDF');
  }
}

/**
 * Parser específico para el formato de Lorena
 */
export function parseDietText(text: string): ParsedDay[] {
  const days: ParsedDay[] = [];
  
  console.log('🔍 Iniciando parseo...');
  
  // Buscar "Día 1", "Día 2", etc
  const dayPattern = /Día\s+(\d+)/gi;
  const dayMatches = [...text.matchAll(dayPattern)];
  
  console.log(`📅 Días encontrados: ${dayMatches.length}`);
  
  if (dayMatches.length === 0) {
    throw new Error('No se encontraron días en el PDF');
  }
  
  for (let i = 0; i < dayMatches.length; i++) {
    const match = dayMatches[i];
    const dayNumber = parseInt(match[1]);
    
    // Limitar a los primeros 7 días (semana completa)
    if (dayNumber > 7) break;
    
    const startIdx = match.index!;
    const endIdx = i < dayMatches.length - 1 ? dayMatches[i + 1].index! : text.length;
    
    const dayText = text.substring(startIdx, endIdx);
    
    console.log(`\n📋 Procesando Día ${dayNumber}...`);
    
    const meals = extractMealsFromDay(dayText, dayNumber);
    
    if (meals.length > 0) {
      days.push({ dayNumber, meals });
      console.log(`✅ Día ${dayNumber}: ${meals.length} comidas`);
    }
  }
  
  if (days.length === 0) {
    throw new Error('No se pudieron extraer comidas del PDF');
  }
  
  return days;
}

/**
 * Extrae las comidas de un día
 */
function extractMealsFromDay(dayText: string, dayNumber: number): Meal[] {
  const meals: Meal[] = [];
  const mealTypes = ['Desayuno', 'Media mañana', 'Comida', 'Merienda', 'Cena'];
  
  for (const mealType of mealTypes) {
    // Buscar el tipo de comida
    const mealRegex = new RegExp(`${mealType}\\s+(.+?)(?=Media mañana|Comida|Merienda|Cena|Día \\d+|$)`, 'is');
    const mealMatch = dayText.match(mealRegex);
    
    if (mealMatch && mealMatch[1]) {
      const mealContent = mealMatch[1].trim();
      
      // Extraer el nombre (primera línea no vacía)
      const lines = mealContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const name = lines[0] || mealType;
      
      // Para este formato, guardamos todo el contenido como "recipe"
      const recipe = mealContent.replace(name, '').trim() || 'Ver detalles en el PDF original';
      
      meals.push({
        id: generateId(),
        dayNumber,
        time: getDefaultTime(mealType),
        type: mealType as any,
        name,
        emoji: MEAL_EMOJIS[mealType] || '🍽️',
        ingredients: 'Ver receta completa',
        recipe,
        completed: false,
      });
      
      console.log(`  ✓ ${mealType}: ${name}`);
    }
  }
  
  return meals;
}

function getDefaultTime(mealType: string): string {
  const times: Record<string, string> = {
    'Desayuno': '08:00',
    'Media mañana': '11:00',
    'Comida': '14:00',
    'Merienda': '17:00',
    'Cena': '21:00',
  };
  return times[mealType] || '12:00';
}

export async function processDietPDF(file: File): Promise<ParsedDay[]> {
  console.log('🚀 Procesando PDF:', file.name);
  
  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('El archivo debe ser un PDF');
  }
  
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('El PDF es demasiado grande (máximo 10MB)');
  }
  
  const text = await extractTextFromPDF(file);
  const days = parseDietText(text);
  
  console.log('✅ Completado:', days.length, 'días con', days.reduce((acc, d) => acc + d.meals.length, 0), 'comidas');
  
  return days;
}