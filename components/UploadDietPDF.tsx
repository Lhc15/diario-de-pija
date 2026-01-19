'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { processDietPDF } from '@/lib/pdfParser';
import { useAppStore } from '@/lib/store';
import { generateId, getDateKey, getDietDayNumber } from '@/lib/utils';
import { DietPlan, Meal } from '@/lib/types';

interface UploadDietPDFProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function UploadDietPDF({ onSuccess, onClose }: UploadDietPDFProps) {
  const { userData, updateUserData } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [startDate, setStartDate] = useState(getDateKey(new Date()));
  const [parsedDays, setParsedDays] = useState<any[] | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // Procesar PDF
      const days = await processDietPDF(file);
      setParsedDays(days);
      
      console.log('PDF procesado:', days);
      
    } catch (err: any) {
      console.error('Error processing PDF:', err);
      setError(err.message || 'Error al procesar el PDF');
      setParsedDays(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleSaveDiet = () => {
    if (!parsedDays || !userData) return;

    try {
      // Crear plan de dieta
      const dietPlan: DietPlan = {
        id: generateId(),
        userId: userData.userId,
        startDate,
        meals: {},
        createdAt: new Date().toISOString(),
      };

      // Organizar comidas por número de día
      const mealsByDay: Record<number, Meal[]> = {};
      parsedDays.forEach(day => {
        mealsByDay[day.dayNumber] = day.meals;
      });
      dietPlan.meals = mealsByDay;

      // Mapear comidas a fechas reales
      const mealsByDate: Record<string, Meal[]> = {};
      const startDateObj = new Date(startDate);

      // Ciclo de 7 días que se repite
      for (let i = 0; i < 60; i++) { // Mapear próximos 60 días (2 meses)
        const currentDate = new Date(startDateObj);
        currentDate.setDate(currentDate.getDate() + i);
        const dateKey = getDateKey(currentDate);
        
        // Calcular qué día del ciclo es (1-7)
        const dayNumber = (i % 7) + 1;
        const mealsForDay = mealsByDay[dayNumber] || [];
        
        // Clonar comidas con nuevos IDs para cada día
        mealsByDate[dateKey] = mealsForDay.map(meal => ({
          ...meal,
          id: generateId(),
          completed: false,
        }));
      }

      // Actualizar datos del usuario
      updateUserData({
        ...userData,
        dietPlan,
        meals: mealsByDate,
      });

      setSuccess(true);
      
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving diet:', err);
      setError('Error al guardar la dieta');
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-gray-600">Procesando PDF...</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-green-600 font-semibold">¡Dieta guardada con éxito!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-gray-600 font-medium mb-1">
                {isDragActive
                  ? 'Suelta el PDF aquí'
                  : 'Arrastra tu PDF de dieta aquí'}
              </p>
              <p className="text-sm text-gray-500">o haz click para seleccionar</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Preview de días parseados */}
      {parsedDays && !success && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 font-medium mb-2">
                  PDF procesado correctamente
                </p>
                <p className="text-green-700 text-sm mb-3">
                  Se encontraron <strong>{parsedDays.length} días</strong> con un total de{' '}
                  <strong>
                    {parsedDays.reduce((acc, day) => acc + day.meals.length, 0)} comidas
                  </strong>
                </p>

                {/* Selector de fecha de inicio */}
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    ¿Qué día empiezas la dieta?
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    El Día 1 de tu dieta comenzará en esta fecha
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview de días */}
          <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <h4 className="font-semibold mb-3">Vista previa:</h4>
            <div className="space-y-2">
              {parsedDays.map((day) => (
                <div key={day.dayNumber} className="bg-white rounded-lg p-3 text-sm">
                  <p className="font-semibold text-primary mb-1">
                    Día {day.dayNumber}
                  </p>
                  <p className="text-gray-600">
                    {day.meals.map((m: Meal) => m.type).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveDiet}
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition"
            >
              Guardar dieta
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}