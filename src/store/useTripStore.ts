import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Destination, Leg, SubLocation, Trip, TransportMode, SelectionType } from '../types';
import { generateId } from '../utils/id';

function createDefaultTrip(): Trip {
  return {
    id: generateId(),
    name: 'Mon Voyage',
    destinations: [],
    legs: [],
    currency: 'EUR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function syncLegs(destinations: Destination[], existingLegs: Leg[]): Leg[] {
  if (destinations.length < 2) return [];
  const legs: Leg[] = [];
  for (let i = 0; i < destinations.length - 1; i++) {
    const fromId = destinations[i].id;
    const toId = destinations[i + 1].id;
    const existing = existingLegs.find((l) => l.fromId === fromId && l.toId === toId);
    legs.push(
      existing ?? {
        id: generateId(),
        fromId,
        toId,
        transport: 'flight' as TransportMode,
        notes: '',
        duration: '',
        date: '',
      },
    );
  }
  return legs;
}

interface TripState {
  trip: Trip;
  selectedId: string | null;
  selectionType: SelectionType;
  panelOpen: boolean;
  isSearching: boolean;
  isDark: boolean;

  toggleTheme: () => void;
  updateTripName: (name: string) => void;
  updateCurrency: (currency: string) => void;
  resetTrip: () => void;

  addDestination: (data: {
    name: string;
    lat: number;
    lng: number;
    country?: string;
    city?: string;
  }) => string;
  duplicateDestination: (id: string) => void;
  removeDestination: (id: string) => void;
  updateDestination: (id: string, updates: Partial<Destination>) => void;
  reorderDestinations: (activeId: string, overId: string) => void;

  addSubLocation: (
    destId: string,
    data: { name: string; lat: number; lng: number; type?: string },
  ) => void;
  removeSubLocation: (destId: string, subId: string) => void;
  updateSubLocation: (
    destId: string,
    subId: string,
    updates: Partial<SubLocation>,
  ) => void;

  updateLeg: (id: string, updates: Partial<Leg>) => void;

  selectDestination: (id: string) => void;
  selectLeg: (id: string) => void;
  clearSelection: () => void;
  setPanelOpen: (open: boolean) => void;
  setSearching: (searching: boolean) => void;

  exportTrip: () => string;
  importTrip: (json: string) => boolean;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trip: createDefaultTrip(),
      selectedId: null,
      selectionType: null,
      panelOpen: false,
      isSearching: false,
      isDark: true,

      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),

      updateTripName: (name) =>
        set((s) => ({
          trip: { ...s.trip, name, updatedAt: new Date().toISOString() },
        })),

      updateCurrency: (currency) =>
        set((s) => ({
          trip: { ...s.trip, currency, updatedAt: new Date().toISOString() },
        })),

      resetTrip: () =>
        set({
          trip: createDefaultTrip(),
          selectedId: null,
          selectionType: null,
          panelOpen: false,
          isSearching: false,
        }),

      addDestination: (data) => {
        const id = generateId();
        set((s) => {
          const dest: Destination = {
            id,
            name: data.name,
            lat: data.lat,
            lng: data.lng,
            country: data.country ?? '',
            city: data.city ?? '',
            order: s.trip.destinations.length,
            hotel: '',
            activities: [],
            notes: '',
            subLocations: [],
            arrivalDate: '',
            departureDate: '',
            budget: 0,
            emoji: '',
          };
          const destinations = [...s.trip.destinations, dest];
          const legs = syncLegs(destinations, s.trip.legs);
          return {
            trip: { ...s.trip, destinations, legs, updatedAt: new Date().toISOString() },
            selectedId: id,
            selectionType: 'destination' as SelectionType,
            panelOpen: true,
            isSearching: false,
          };
        });
        return id;
      },

      duplicateDestination: (id) =>
        set((s) => {
          const source = s.trip.destinations.find((d) => d.id === id);
          if (!source) return s;
          const newId = generateId();
          const copy: Destination = {
            ...source,
            id: newId,
            name: `${source.name} (copie)`,
            order: s.trip.destinations.length,
            lat: source.lat + (Math.random() - 0.5) * 0.05,
            lng: source.lng + (Math.random() - 0.5) * 0.05,
            subLocations: source.subLocations.map((sl) => ({ ...sl, id: generateId() })),
          };
          const destinations = [...s.trip.destinations, copy];
          const legs = syncLegs(destinations, s.trip.legs);
          return {
            trip: { ...s.trip, destinations, legs, updatedAt: new Date().toISOString() },
            selectedId: newId,
            selectionType: 'destination' as SelectionType,
            panelOpen: true,
          };
        }),

      removeDestination: (id) =>
        set((s) => {
          const destinations = s.trip.destinations
            .filter((d) => d.id !== id)
            .map((d, i) => ({ ...d, order: i }));
          const legs = syncLegs(destinations, s.trip.legs);
          const wasSelected = s.selectedId === id;
          return {
            trip: { ...s.trip, destinations, legs, updatedAt: new Date().toISOString() },
            selectedId: wasSelected ? null : s.selectedId,
            selectionType: wasSelected ? null : s.selectionType,
            panelOpen: wasSelected ? false : s.panelOpen,
          };
        }),

      updateDestination: (id, updates) =>
        set((s) => ({
          trip: {
            ...s.trip,
            destinations: s.trip.destinations.map((d) =>
              d.id === id ? { ...d, ...updates } : d,
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      reorderDestinations: (activeId, overId) =>
        set((s) => {
          const dests = [...s.trip.destinations];
          const oldIdx = dests.findIndex((d) => d.id === activeId);
          const newIdx = dests.findIndex((d) => d.id === overId);
          if (oldIdx === -1 || newIdx === -1) return s;
          const [moved] = dests.splice(oldIdx, 1);
          dests.splice(newIdx, 0, moved);
          const reordered = dests.map((d, i) => ({ ...d, order: i }));
          const legs = syncLegs(reordered, s.trip.legs);
          return {
            trip: { ...s.trip, destinations: reordered, legs, updatedAt: new Date().toISOString() },
          };
        }),

      addSubLocation: (destId, data) =>
        set((s) => ({
          trip: {
            ...s.trip,
            destinations: s.trip.destinations.map((d) =>
              d.id === destId
                ? {
                    ...d,
                    subLocations: [
                      ...d.subLocations,
                      {
                        id: generateId(),
                        name: data.name,
                        lat: data.lat,
                        lng: data.lng,
                        type: data.type ?? 'other',
                        notes: '',
                      },
                    ],
                  }
                : d,
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      removeSubLocation: (destId, subId) =>
        set((s) => ({
          trip: {
            ...s.trip,
            destinations: s.trip.destinations.map((d) =>
              d.id === destId
                ? { ...d, subLocations: d.subLocations.filter((sl) => sl.id !== subId) }
                : d,
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      updateSubLocation: (destId, subId, updates) =>
        set((s) => ({
          trip: {
            ...s.trip,
            destinations: s.trip.destinations.map((d) =>
              d.id === destId
                ? {
                    ...d,
                    subLocations: d.subLocations.map((sl) =>
                      sl.id === subId ? { ...sl, ...updates } : sl,
                    ),
                  }
                : d,
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      updateLeg: (id, updates) =>
        set((s) => ({
          trip: {
            ...s.trip,
            legs: s.trip.legs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
            updatedAt: new Date().toISOString(),
          },
        })),

      selectDestination: (id) => {
        const exists = get().trip.destinations.some((d) => d.id === id);
        if (!exists) return;
        set({ selectedId: id, selectionType: 'destination', panelOpen: true, isSearching: false });
      },

      selectLeg: (id) => {
        const exists = get().trip.legs.some((l) => l.id === id);
        if (!exists) return;
        set({ selectedId: id, selectionType: 'leg', panelOpen: true, isSearching: false });
      },

      clearSelection: () =>
        set({ selectedId: null, selectionType: null, panelOpen: false, isSearching: false }),

      setPanelOpen: (open) =>
        set({
          panelOpen: open,
          ...(open ? {} : { selectedId: null, selectionType: null, isSearching: false }),
        }),

      setSearching: (searching) =>
        set({
          isSearching: searching,
          panelOpen: true,
          selectedId: null,
          selectionType: null,
        }),

      exportTrip: () => {
        const { trip } = get();
        return JSON.stringify(trip, null, 2);
      },

      importTrip: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data.id || !data.name || !Array.isArray(data.destinations)) return false;
          const trip: Trip = {
            ...data,
            currency: data.currency ?? 'EUR',
            destinations: (data.destinations as Destination[]).map((d, i) => ({
              ...d,
              order: i,
              arrivalDate: d.arrivalDate ?? '',
              departureDate: d.departureDate ?? '',
              budget: d.budget ?? 0,
              emoji: d.emoji ?? '',
            })),
            updatedAt: new Date().toISOString(),
          };
          set({
            trip,
            selectedId: null,
            selectionType: null,
            panelOpen: false,
            isSearching: false,
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'travel-map-storage',
      version: 2,
      partialize: (state) => ({ trip: state.trip, isDark: state.isDark }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          const trip = state.trip as Trip | undefined;
          if (trip) {
            trip.currency = trip.currency ?? 'EUR';
            trip.destinations = trip.destinations.map((d: Destination) => ({
              ...d,
              arrivalDate: d.arrivalDate ?? '',
              departureDate: d.departureDate ?? '',
              budget: d.budget ?? 0,
              emoji: d.emoji ?? '',
            }));
          }
        }
        return state;
      },
    },
  ),
);
