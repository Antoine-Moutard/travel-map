import { useEffect } from 'react';
import { X, Globe } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { EmptyState } from '../ui/EmptyState';
import { LocationSearch } from './LocationSearch';
import { DestinationForm } from './DestinationForm';
import { LegForm } from './LegForm';

export function SidePanel() {
  const panelOpen = useTripStore((s) => s.panelOpen);
  const selectedId = useTripStore((s) => s.selectedId);
  const selectionType = useTripStore((s) => s.selectionType);
  const isSearching = useTripStore((s) => s.isSearching);
  const setPanelOpen = useTripStore((s) => s.setPanelOpen);

  const trip = useTripStore((s) => s.trip);

  const selectedDestination =
    selectionType === 'destination'
      ? trip.destinations.find((d) => d.id === selectedId)
      : undefined;

  const selectedLeg =
    selectionType === 'leg' ? trip.legs.find((l) => l.id === selectedId) : undefined;

  const title = isSearching
    ? 'Ajouter une destination'
    : selectedDestination
      ? selectedDestination.name
      : selectedLeg
        ? 'Trajet'
        : 'Détails';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelOpen) setPanelOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelOpen, setPanelOpen]);

  return (
    <>
      {/* Backdrop for mobile */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 sm:hidden"
          onClick={() => setPanelOpen(false)}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[400px] z-30 transform transition-transform duration-300 ease-out ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-surface/95 backdrop-blur-2xl border-l border-muted/40">
          {/* Accent line */}
          <div className="h-[2px] bg-gradient-to-r from-accent via-accent-light to-accent/50 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 shrink-0">
            <h2 className="text-sm font-bold text-default truncate tracking-tight">{title}</h2>
            <button
              onClick={() => setPanelOpen(false)}
              aria-label="Fermer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-subtle hover:text-default hover:bg-elevated transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-muted/50 to-transparent shrink-0" />

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isSearching && <LocationSearch />}

            {!isSearching && selectedDestination && (
              <DestinationForm destination={selectedDestination} />
            )}

            {!isSearching && selectedLeg && <LegForm leg={selectedLeg} />}

            {!isSearching && !selectedDestination && !selectedLeg && (
              <EmptyState
                icon={<Globe size={36} />}
                title="Aucune sélection"
                description="Cliquez sur une destination ou un trajet sur le globe pour l'éditer."
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
