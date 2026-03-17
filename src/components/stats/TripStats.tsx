import { MapPin, Globe, Route, Wallet, Calendar } from 'lucide-react';
import { useTripStats } from '../../hooks/useTripStats';
import { formatDistance } from '../../utils/distance';

export function TripStatsBar() {
  const stats = useTripStats();

  if (stats.destinationCount === 0) return null;

  const items = [
    {
      icon: MapPin,
      value: stats.destinationCount,
      label: `destination${stats.destinationCount > 1 ? 's' : ''}`,
    },
    ...(stats.countryCount > 0
      ? [{ icon: Globe, value: stats.countryCount, label: `pay${stats.countryCount > 1 ? 's' : ''}` }]
      : []),
    ...(stats.totalDistanceKm > 0
      ? [{ icon: Route, value: formatDistance(stats.totalDistanceKm), label: '' }]
      : []),
    ...(stats.totalBudget > 0
      ? [{ icon: Wallet, value: `${stats.totalBudget.toLocaleString('fr-FR')} ${stats.currencySymbol}`, label: '' }]
      : []),
    ...(stats.tripDays
      ? [{ icon: Calendar, value: stats.tripDays, label: `jour${stats.tripDays > 1 ? 's' : ''}` }]
      : []),
  ];

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
      <div className="glass rounded-2xl px-5 py-2.5 shadow-lg flex items-center gap-5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <item.icon size={13} className="text-accent shrink-0" />
            <span className="text-[12px] font-semibold text-default tabular-nums">
              {item.value}
            </span>
            {item.label && (
              <span className="text-[11px] text-subtle">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
