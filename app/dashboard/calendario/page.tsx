'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getDateKey } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DayDetailsModal from '@/components/DayDetailsModal';

export default function CalendarioPage() {
  const { userData } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let startDay = firstDay.getDay() - 1;
  if (startDay === -1) startDay = 6;

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getDayColor = (day: number) => {
    const dateKey = getDateKey(new Date(year, month, day));
    const today = getDateKey(new Date());

    if (dateKey === today) return 'today';
    if (dateKey > today) return 'future';

    const summary = userData.dailySummary[dateKey];
    if (!summary) return 'white';

    return summary.completed ? 'green' : 'red';
  };

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const color = getDayColor(day);
    const dateKey = getDateKey(new Date(year, month, day));
    
    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(dateKey)}
        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition hover:scale-110 ${
          color === 'today'
            ? 'bg-primary text-white ring-2 ring-primary/30'
            : color === 'green'
            ? 'bg-green-500 text-white hover:bg-green-600'
            : color === 'red'
            ? 'bg-red-500 text-white hover:bg-red-600'
            : color === 'future'
            ? 'text-gray-400 hover:bg-gray-50'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">
            {months[month]} {year}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <div key={d} className="text-center font-semibold text-gray-500 text-sm">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">{days}</div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Cumplido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Incumplido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Hoy</span>
          </div>
        </div>
      </div>

      {/* Modal de detalles del día */}
      {selectedDate && (
        <DayDetailsModal
          date={selectedDate}
          userData={userData}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}