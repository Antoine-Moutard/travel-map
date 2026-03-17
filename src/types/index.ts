export type TransportMode = 'flight' | 'train' | 'car' | 'bus' | 'boat' | 'walk' | 'other';

export interface SubLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  notes: string;
}

export interface Destination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  order: number;
  hotel: string;
  activities: string[];
  notes: string;
  subLocations: SubLocation[];
  arrivalDate: string;
  departureDate: string;
  budget: number;
  emoji: string;
}

export interface Leg {
  id: string;
  fromId: string;
  toId: string;
  transport: TransportMode;
  notes: string;
  duration: string;
  date: string;
}

export interface Trip {
  id: string;
  name: string;
  destinations: Destination[];
  legs: Leg[];
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type SelectionType = 'destination' | 'leg' | null;

export interface GeoSearchResult {
  displayName: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
}
