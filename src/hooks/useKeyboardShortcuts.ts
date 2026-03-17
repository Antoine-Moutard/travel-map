import { useEffect } from 'react';
import { useTripStore } from '../store/useTripStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      if (isMod && e.key === 'k') {
        e.preventDefault();
        useTripStore.getState().setSearching(true);
        return;
      }

      if (e.key === 'Escape' && !isInput) {
        const state = useTripStore.getState();
        if (state.panelOpen) {
          useTripStore.getState().setPanelOpen(false);
        }
        return;
      }

      if (isMod && e.key === 'e') {
        e.preventDefault();
        const json = useTripStore.getState().exportTrip();
        const name = useTripStore.getState().trip.name;
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    };

    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);
}
