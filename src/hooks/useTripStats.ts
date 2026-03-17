import { useMemo } from 'react';
import { useTripStore } from '../store/useTripStore';
import { haversineDistance } from '../utils/distance';
import { CURRENCIES } from '../constants';

export interface TripStats {
  destinationCount: number;
  countryCount: number;
  totalDistanceKm: number;
  totalBudget: number;
  currencySymbol: string;
  tripDays: number | null;
}

export function useTripStats(): TripStats {
  const destinations = useTripStore((s) => s.trip.destinations);
  const currency = useTripStore((s) => s.trip.currency);

  return useMemo(() => {
    const destinationCount = destinations.length;

    const countries = new Set(
      destinations.map((d) => d.country).filter(Boolean),
    );
    const countryCount = countries.size;

    let totalDistanceKm = 0;
    for (let i = 0; i < destinations.length - 1; i++) {
      const a = destinations[i];
      const b = destinations[i + 1];
      totalDistanceKm += haversineDistance(a.lat, a.lng, b.lat, b.lng);
    }

    const totalBudget = destinations.reduce((sum, d) => sum + (d.budget || 0), 0);

    const cur = CURRENCIES.find((c) => c.value === currency);
    const currencySymbol = cur?.symbol ?? currency;

    let tripDays: number | null = null;
    const dates = destinations
      .flatMap((d) => [d.arrivalDate, d.departureDate])
      .filter(Boolean)
      .sort();
    if (dates.length >= 2) {
      const first = new Date(dates[0]);
      const last = new Date(dates[dates.length - 1]);
      tripDays = Math.round((last.getTime() - first.getTime()) / 86_400_000) + 1;
    }

    return { destinationCount, countryCount, totalDistanceKm, totalBudget, currencySymbol, tripDays };
  }, [destinations, currency]);
}
