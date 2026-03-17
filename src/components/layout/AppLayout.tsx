import { GlobeView } from '../globe/GlobeView';
import { GlobeOverlay } from '../globe/GlobeOverlay';
import { SidePanel } from '../panel/SidePanel';
import { ItineraryList } from '../itinerary/ItineraryList';
import { TripStatsBar } from '../stats/TripStats';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export function AppLayout() {
  useKeyboardShortcuts();

  return (
    <div className="relative w-full h-full overflow-hidden bg-base">
      <GlobeView />
      <GlobeOverlay />
      <ItineraryList />
      <TripStatsBar />
      <SidePanel />
    </div>
  );
}
