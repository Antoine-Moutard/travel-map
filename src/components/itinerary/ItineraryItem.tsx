import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowDown, Plane, Train, Car, Ship } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { TRANSPORT_COLORS } from '../../constants';
import { haversineDistance, formatDistance } from '../../utils/distance';
import type { Destination, Leg, TransportMode } from '../../types';

const transportIcons: Partial<Record<TransportMode, typeof Plane>> = {
  flight: Plane,
  train: Train,
  car: Car,
  boat: Ship,
};

const transportLabels: Partial<Record<TransportMode, string>> = {
  flight: 'Vol',
  train: 'Train',
  car: 'Route',
  boat: 'Bateau',
  bus: 'Bus',
  walk: 'Marche',
};

interface ItineraryItemProps {
  destination: Destination;
  index: number;
  leg?: Leg;
  nextDestination?: Destination;
}

export function ItineraryItem({ destination, index, leg, nextDestination }: ItineraryItemProps) {
  const selectedId = useTripStore((s) => s.selectedId);
  const selectDestination = useTripStore((s) => s.selectDestination);
  const selectLeg = useTripStore((s) => s.selectLeg);
  const isSelected = selectedId === destination.id;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: destination.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const TransportIcon = leg ? (transportIcons[leg.transport] ?? ArrowDown) : null;
  const transportColor = leg ? TRANSPORT_COLORS[leg.transport] : undefined;

  const legDistance = useMemo(() => {
    if (!nextDestination) return null;
    return haversineDistance(
      destination.lat, destination.lng,
      nextDestination.lat, nextDestination.lng,
    );
  }, [destination, nextDestination]);

  const stayDays = useMemo(() => {
    if (!destination.arrivalDate || !destination.departureDate) return null;
    const a = new Date(destination.arrivalDate);
    const d = new Date(destination.departureDate);
    const days = Math.round((d.getTime() - a.getTime()) / 86_400_000);
    return days > 0 ? days : null;
  }, [destination.arrivalDate, destination.departureDate]);

  return (
    <div ref={setNodeRef} style={style}>
      <button
        onClick={() => selectDestination(destination.id)}
        className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-150 cursor-pointer group ${
          isSelected
            ? 'bg-accent/10 ring-1 ring-accent/30'
            : 'hover:bg-elevated/80'
        }`}
      >
        <div
          {...attributes}
          {...listeners}
          className="text-muted hover:text-subtle cursor-grab active:cursor-grabbing transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>

        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
            destination.emoji
              ? 'text-base'
              : isSelected
                ? 'bg-accent text-white shadow-sm shadow-accent/30 text-[11px] font-bold'
                : 'bg-muted/60 text-subtle group-hover:bg-accent/15 group-hover:text-accent-light text-[11px] font-bold'
          }`}
        >
          {destination.emoji || index + 1}
        </div>

        <div className="flex flex-col min-w-0 gap-0.5 flex-1">
          <span
            className={`text-[13px] font-semibold truncate transition-colors ${
              isSelected ? 'text-accent-light' : 'text-default'
            }`}
          >
            {destination.name}
          </span>
          <div className="flex items-center gap-2">
            {destination.country && (
              <span className="text-[10px] text-subtle truncate leading-tight">
                {destination.country}
              </span>
            )}
            {stayDays && (
              <span className="text-[9px] text-accent/70 font-medium">
                {stayDays}j
              </span>
            )}
          </div>
        </div>

        {destination.budget > 0 && (
          <span className="text-[10px] text-subtle font-medium tabular-nums shrink-0">
            {destination.budget.toLocaleString('fr-FR')}€
          </span>
        )}
      </button>

      {/* Leg connector */}
      {leg && (
        <button
          onClick={() => selectLeg(leg.id)}
          className={`w-full flex items-center justify-center gap-2 py-2 my-0.5 rounded-lg transition-all duration-150 cursor-pointer ${
            selectedId === leg.id ? 'bg-accent/8' : 'hover:bg-elevated/50'
          }`}
        >
          <div className="flex items-center gap-2">
            {TransportIcon && (
              <TransportIcon size={10} style={{ color: transportColor }} />
            )}
            <span
              className={`text-[9px] font-medium uppercase tracking-wider ${
                selectedId === leg.id ? 'text-accent-light' : 'text-subtle/50'
              }`}
            >
              {transportLabels[leg.transport] ?? leg.transport}
            </span>
            {legDistance !== null && (
              <span className="text-[9px] text-subtle/40 font-mono tabular-nums">
                {formatDistance(legDistance)}
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  );
}
