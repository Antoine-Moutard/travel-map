import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Map, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useTripStore } from '../../store/useTripStore';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { ItineraryItem } from './ItineraryItem';

export function ItineraryList() {
  const destinations = useTripStore((s) => s.trip.destinations);
  const legs = useTripStore((s) => s.trip.legs);
  const reorderDestinations = useTripStore((s) => s.reorderDestinations);
  const setSearching = useTripStore((s) => s.setSearching);

  const [collapsed, setCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        reorderDestinations(active.id as string, over.id as string);
      }
    },
    [reorderDestinations],
  );

  if (collapsed) {
    return (
      <div className="hidden sm:block fixed right-4 top-5 z-20">
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Afficher l'itinéraire"
          className="glass w-10 h-10 rounded-xl flex items-center justify-center text-subtle hover:text-default transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="hidden sm:flex fixed right-4 top-5 bottom-5 w-[280px] z-20 flex-col glass rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-default tracking-widest uppercase">
            Itinéraire
          </span>
          {destinations.length > 0 && (
            <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full tabular-nums">
              {destinations.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Réduire"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-subtle hover:text-default hover:bg-elevated transition-all cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-muted/60 to-transparent" />

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {destinations.length === 0 ? (
          <EmptyState
            icon={<Map size={28} />}
            title="Aucune destination"
            description="Ajoutez votre première étape pour commencer."
            action={
              <Button size="sm" onClick={() => setSearching(true)}>
                Ajouter
              </Button>
            }
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={destinations.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              {destinations.map((dest, i) => (
                <ItineraryItem
                  key={dest.id}
                  destination={dest}
                  index={i}
                  leg={legs[i]}
                  nextDestination={destinations[i + 1]}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer */}
      {destinations.length > 0 && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-muted/60 to-transparent" />
          <div className="px-4 py-3">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setSearching(true)}
            >
              + Ajouter une étape
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
