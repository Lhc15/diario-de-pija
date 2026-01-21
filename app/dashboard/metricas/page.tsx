'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore, useIsReadOnly } from '@/lib/store';
import { Scale, Ruler, Plus, TrendingDown, TrendingUp, Minus, Calendar, Award, AlertCircle, PartyPopper } from 'lucide-react';
import { WeightRecord, MeasurementRecord } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import WeightModal from '@/components/WeightModal';
import MeasurementsModal from '@/components/MeasurementsModal';
import NutritionistModal from '@/components/NutritionistModal';

export default function MetricasPage() {
  const { userData, updateUserData } = useAppStore();
  const isReadOnly = useIsReadOnly();

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const [showNutritionistModal, setShowNutritionistModal] = useState(false);

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const weightRecords = userData.weight || [];
  const measurementRecords = userData.measurements || [];

  // Ordenar por fecha descendente
  const sortedWeights = [...weightRecords].sort((a, b) => b.date.localeCompare(a.date));
  const sortedMeasurements = [...measurementRecords].sort((a, b) => b.date.localeCompare(a.date));

  // Última medición
  const latestWeight = sortedWeights[0];
  const latestMeasurement = sortedMeasurements[0];

  // Calcular tendencia de peso
  const weightTrend = sortedWeights.length >= 2 
    ? sortedWeights[0].weight - sortedWeights[1].weight 
    : 0;

  // Próxima cita con nutricionista
  const nextAppointment = userData.nutritionist?.nextAppointment;
  const daysUntilAppointment = nextAppointment 
    ? Math.ceil((new Date(nextAppointment).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Días completados
  const totalCompletedDays = userData.stats?.totalCompletedDays || 0;

  const handleSaveWeight = (record: WeightRecord) => {
    const updatedWeights = [...weightRecords, record];
    updateUserData({
      ...userData,
      weight: updatedWeights,
    });
  };

  const handleSaveMeasurement = (record: MeasurementRecord) => {
    const updatedMeasurements = [...measurementRecords, record];
    updateUserData({
      ...userData,
      measurements: updatedMeasurements,
    });
  };

  const handleSaveNutritionistDate = (date: string) => {
    updateUserData({
      ...userData,
      nutritionist: {
        ...userData.nutritionist,
        nextAppointment: date,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Métricas</h1>
          <p className="text-gray-600">Tu evolución física</p>
        </div>
        <Link
          href="/dashboard/la-trampa"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 shadow-lg"
        >
          <PartyPopper className="w-5 h-5" />
          La Trampa
        </Link>
      </div>

      {/* Cards destacadas: Nutricionista y Días Logrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card de Próxima Cita - DESTACADA */}
        <button
          onClick={() => !isReadOnly && setShowNutritionistModal(true)}
          disabled={isReadOnly}
          className={`rounded-2xl p-6 shadow-lg text-left w-full transition ${
            daysUntilAppointment !== null && daysUntilAppointment <= 7
              ? 'bg-gradient-to-br from-primary to-primary-dark text-white'
              : 'bg-white'
          } ${!isReadOnly ? 'hover:scale-105 cursor-pointer' : ''}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className={`w-6 h-6 ${
              daysUntilAppointment !== null && daysUntilAppointment <= 7
                ? 'text-white'
                : 'text-primary'
            }`} />
            <h3 className={`font-bold text-lg ${
              daysUntilAppointment !== null && daysUntilAppointment <= 7
                ? 'text-white'
                : 'text-gray-900'
            }`}>
              Próxima cita nutricionista
            </h3>
          </div>

          {nextAppointment ? (
            <div>
              {daysUntilAppointment !== null && (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-5xl font-bold ${
                      daysUntilAppointment <= 7 ? 'text-white' : 'text-primary'
                    }`}>
                      {daysUntilAppointment}
                    </span>
                    <span className={daysUntilAppointment <= 7 ? 'text-white/90' : 'text-gray-500'}>
                      {daysUntilAppointment === 1 ? 'día' : 'días'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    daysUntilAppointment <= 7 ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {new Date(nextAppointment).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  {daysUntilAppointment <= 3 && daysUntilAppointment > 0 && (
                    <div className="mt-3 flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">¡Próximamente!</span>
                    </div>
                  )}
                  {daysUntilAppointment === 0 && (
                    <div className="mt-3 flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">¡Hoy es tu cita!</span>
                    </div>
                  )}
                  {daysUntilAppointment < 0 && (
                    <div className="mt-3 flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Cita pasada</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay cita programada</p>
              {!isReadOnly && (
                <p className="text-primary text-xs mt-2 font-medium">Click para agregar</p>
              )}
            </div>
          )}
        </button>

        {/* Card de Días Logrados */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-white" />
            <h3 className="font-bold text-lg text-white">Días logrados</h3>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-bold text-white">
              {totalCompletedDays}
            </span>
            <span className="text-white/90">
              {totalCompletedDays === 1 ? 'día' : 'días'}
            </span>
          </div>
          
          <p className="text-sm text-white/80 mb-3">
            Has completado tu dieta y entrenamiento
          </p>

          {totalCompletedDays > 0 && (
            <div className="bg-white/20 px-3 py-2 rounded-lg">
              <p className="text-sm font-medium">
                {totalCompletedDays >= 30 
                  ? '🎉 ¡Increíble constancia!' 
                  : totalCompletedDays >= 14
                  ? '🔥 ¡Vas muy bien!'
                  : totalCompletedDays >= 7
                  ? '💪 ¡Sigue así!'
                  : '✨ ¡Buen comienzo!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card de Peso */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Peso</h3>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowWeightModal(true)}
                className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {latestWeight ? (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-primary">
                  {latestWeight.weight}
                </span>
                <span className="text-gray-500">kg</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {formatDate(latestWeight.date)}
              </p>
              {weightTrend !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  weightTrend > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {weightTrend > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {Math.abs(weightTrend).toFixed(1)} kg {weightTrend > 0 ? 'más' : 'menos'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Scale className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay registros de peso</p>
            </div>
          )}
        </div>

        {/* Card de Medidas */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Medidas</h3>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowMeasurementsModal(true)}
                className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {latestMeasurement ? (
            <div className="space-y-2">
              {latestMeasurement.chest && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">💪 Pecho:</span>
                  <span className="font-semibold">{latestMeasurement.chest} cm</span>
                </div>
              )}
              {latestMeasurement.waist && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">📏 Cintura:</span>
                  <span className="font-semibold">{latestMeasurement.waist} cm</span>
                </div>
              )}
              {latestMeasurement.hips && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">🍑 Cadera:</span>
                  <span className="font-semibold">{latestMeasurement.hips} cm</span>
                </div>
              )}
              {latestMeasurement.arms && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">💪 Brazos:</span>
                  <span className="font-semibold">{latestMeasurement.arms} cm</span>
                </div>
              )}
              {latestMeasurement.legs && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">🦵 Piernas:</span>
                  <span className="font-semibold">{latestMeasurement.legs} cm</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-4">
                {formatDate(latestMeasurement.date)}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay medidas registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Peso */}
      {sortedWeights.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Historial de peso
          </h3>
          <div className="space-y-3">
            {sortedWeights.map((record, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-primary">{record.weight} kg</p>
                  <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                  {record.notes && (
                    <p className="text-xs text-gray-400 mt-1">{record.notes}</p>
                  )}
                </div>
                {idx < sortedWeights.length - 1 && (
                  <div className={`text-sm ${
                    record.weight < sortedWeights[idx + 1].weight
                      ? 'text-green-600'
                      : record.weight > sortedWeights[idx + 1].weight
                      ? 'text-red-600'
                      : 'text-gray-400'
                  }`}>
                    {record.weight < sortedWeights[idx + 1].weight ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : record.weight > sortedWeights[idx + 1].weight ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de Medidas */}
      {sortedMeasurements.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            Historial de medidas
          </h3>
          <div className="space-y-3">
            {sortedMeasurements.map((record, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <p className="text-sm text-gray-500 mb-2">{formatDate(record.date)}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {record.chest && (
                    <div>
                      <span className="text-gray-600">💪 Pecho: </span>
                      <span className="font-semibold">{record.chest} cm</span>
                    </div>
                  )}
                  {record.waist && (
                    <div>
                      <span className="text-gray-600">📏 Cintura: </span>
                      <span className="font-semibold">{record.waist} cm</span>
                    </div>
                  )}
                  {record.hips && (
                    <div>
                      <span className="text-gray-600">🍑 Cadera: </span>
                      <span className="font-semibold">{record.hips} cm</span>
                    </div>
                  )}
                  {record.arms && (
                    <div>
                      <span className="text-gray-600">💪 Brazos: </span>
                      <span className="font-semibold">{record.arms} cm</span>
                    </div>
                  )}
                  {record.legs && (
                    <div>
                      <span className="text-gray-600">🦵 Piernas: </span>
                      <span className="font-semibold">{record.legs} cm</span>
                    </div>
                  )}
                </div>
                {record.notes && (
                  <p className="text-xs text-gray-400 mt-2">{record.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {sortedWeights.length === 0 && sortedMeasurements.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">No hay métricas registradas</h3>
          <p className="text-gray-600 mb-6">
            Empieza a registrar tu peso y medidas para ver tu evolución
          </p>
          {!isReadOnly && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowWeightModal(true)}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
              >
                <Scale className="w-5 h-5" />
                Registrar peso
              </button>
              <button
                onClick={() => setShowMeasurementsModal(true)}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
              >
                <Ruler className="w-5 h-5" />
                Registrar medidas
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {showWeightModal && (
        <WeightModal
          onSave={handleSaveWeight}
          onClose={() => setShowWeightModal(false)}
        />
      )}

      {showMeasurementsModal && (
        <MeasurementsModal
          onSave={handleSaveMeasurement}
          onClose={() => setShowMeasurementsModal(false)}
        />
      )}

      {showNutritionistModal && (
        <NutritionistModal
          currentDate={nextAppointment}
          onSave={handleSaveNutritionistDate}
          onClose={() => setShowNutritionistModal(false)}
        />
      )}
    </div>
  );
}