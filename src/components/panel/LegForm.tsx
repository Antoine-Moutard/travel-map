import { useCallback, useMemo } from 'react';
import { ArrowRight, Route } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Badge } from '../ui/Badge';
import { TRANSPORT_MODES, TRANSPORT_COLORS } from '../../constants';
import { haversineDistance, formatDistance } from '../../utils/distance';
import type { Leg } from '../../types';

interface LegFormProps {
  leg: Leg;
}

export function LegForm({ leg }: LegFormProps) {
  const updateLeg = useTripStore((s) => s.updateLeg);
  const destinations = useTripStore((s) => s.trip.destinations);

  const from = destinations.find((d) => d.id === leg.fromId);
  const to = destinations.find((d) => d.id === leg.toId);

  const distance = useMemo(() => {
    if (!from || !to) return null;
    return haversineDistance(from.lat, from.lng, to.lat, to.lng);
  }, [from, to]);

  const update = useCallback(
    (updates: Partial<Leg>) => {
      updateLeg(leg.id, updates);
    },
    [leg.id, updateLeg],
  );

  const color = TRANSPORT_COLORS[leg.transport] ?? '#94a3b8';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Badge variant="accent">{from?.name ?? '?'}</Badge>
        <ArrowRight size={14} className="text-subtle" />
        <Badge variant="accent">{to?.name ?? '?'}</Badge>
      </div>

      {/* Distance */}
      {distance !== null && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-elevated/60">
          <Route size={14} style={{ color }} />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-default tabular-nums">
              {formatDistance(distance)}
            </span>
            <span className="text-[10px] text-subtle">distance à vol d'oiseau</span>
          </div>
          <div
            className="ml-auto w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
            title={leg.transport}
          />
        </div>
      )}

      <Select
        label="Moyen de transport"
        value={leg.transport}
        onChange={(e) => update({ transport: e.target.value as Leg['transport'] })}
        options={TRANSPORT_MODES}
      />

      <Input
        label="Durée estimée"
        value={leg.duration}
        onChange={(e) => update({ duration: e.target.value })}
        placeholder="ex: 2h30, 1 jour..."
      />

      <Input
        label="Date"
        type="date"
        value={leg.date}
        onChange={(e) => update({ date: e.target.value })}
      />

      <TextArea
        label="Notes"
        value={leg.notes}
        onChange={(e) => update({ notes: e.target.value })}
        placeholder="Notes sur le trajet..."
      />
    </div>
  );
}
