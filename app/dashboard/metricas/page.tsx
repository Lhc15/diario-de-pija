'use client';

import { useAppStore, USERS } from '@/lib/store';

export default function MetricasPage() {
  const { userData, currentUser, viewOtherUser } = useAppStore();

  if (!userData || !currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  const { weight, measurements, nutritionist, stats } = userData;

  const latestWeight = weight.length > 0 ? weight[weight.length - 1] : null;
  const initialWeight = weight.length > 0 ? weight[0] : null;
  const weightLost = latestWeight && initialWeight
    ? (initialWeight.value - latestWeight.value).toFixed(1)
    : '0';

  const latestMeas = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  const nextAppt = nutritionist.nextAppointment
    ? new Date(nutritionist.nextAppointment)
    : null;
  const today = new Date();
  const daysUntil = nextAppt
    ? Math.ceil((nextAppt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const otherUserId = currentUser === 'miguel' ? 'lorena' : 'miguel';
  const otherUser = USERS[otherUserId];

  const isReadOnly = useAppStore(state => state.viewingUser !== null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Métricas</h2>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          icon="⚖️"
          title="Peso"
          value={latestWeight ? `${latestWeight.value} kg` : 'Sin datos'}
          subtitle={latestWeight ? `-${weightLost}kg desde inicio` : 'Añade tu primer peso'}
        />

        <MetricCard
          icon="📏"
          title="Medidas"
          value={latestMeas ? 'Cintura' : 'Sin datos'}
          subtitle={latestMeas ? `${latestMeas.waist} cm` : 'Añade tus medidas'}
        />

        <MetricCard
          icon="🩺"
          title="Nutricionista"
          value={daysUntil ? `En ${daysUntil} días` : 'Sin cita'}
          subtitle={daysUntil && daysUntil < 7 ? '¡Vas genial! 💪' : 'Programa tu cita'}
          highlight={daysUntil !== null && daysUntil <= 7}
        />

        <MetricCard
          icon="🏆"
          title="Días cumplidos"
          value={`${stats.totalCompletedDays} días`}
          subtitle={`Racha: ${stats.currentStreak}`}
        />

        {!isReadOnly && (
          <div
            onClick={() => viewOtherUser(otherUserId)}
            className="bg-blue-100 rounded-2xl p-4 shadow hover:shadow-md cursor-pointer transition col-span-2"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{otherUser.avatar}</div>
              <h3 className="font-semibold mb-1">Ver app de {otherUser.displayName}</h3>
              <p className="text-sm text-gray-600">👁️ Solo lectura</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  highlight = false,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow hover:shadow-md cursor-pointer transition ${
        highlight ? 'ring-2 ring-orange-400' : ''
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-lg font-bold text-primary">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}