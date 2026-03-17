import { useMemo } from 'react';
import { useTripStore } from '../../store/useTripStore';
import type { TransportMode } from '../../types';

export interface MarkerDatum {
  id: string;
  lat: number;
  lng: number;
  name: string;
  order: number;
  isSelected: boolean;
  emoji: string;
}

export function useGlobeData() {
  const destinations = useTripStore((s) => s.trip.destinations);
  const legs = useTripStore((s) => s.trip.legs);
  const selectedId = useTripStore((s) => s.selectedId);

  const markersData: MarkerDatum[] = useMemo(
    () =>
      destinations.map((d, i) => ({
        id: d.id,
        lat: d.lat,
        lng: d.lng,
        name: d.name,
        order: i + 1,
        isSelected: d.id === selectedId,
        emoji: d.emoji,
      })),
    [destinations, selectedId],
  );

  const routeGeoJson = useMemo(() => {
    const destMap = new Map(destinations.map((d) => [d.id, d]));
    const features = legs
      .map((leg) => {
        const from = destMap.get(leg.fromId);
        const to = destMap.get(leg.toId);
        if (!from || !to) return null;
        return {
          type: 'Feature' as const,
          properties: {
            id: leg.id,
            isSelected: leg.id === selectedId,
            transport: leg.transport as TransportMode,
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: interpolateGreatCircle(
              [from.lng, from.lat],
              [to.lng, to.lat],
              48,
            ),
          },
        };
      })
      .filter(Boolean);

    return { type: 'FeatureCollection' as const, features };
  }, [destinations, legs, selectedId]);

  return { markersData, routeGeoJson };
}

function interpolateGreatCircle(
  start: [number, number],
  end: [number, number],
  steps: number,
): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const lat1 = toRad(start[1]);
  const lng1 = toRad(start[0]);
  const lat2 = toRad(end[1]);
  const lng2 = toRad(end[0]);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2,
      ),
    );

  if (d < 1e-10) return [start, end];

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    points.push([toDeg(Math.atan2(y, x)), toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))]);
  }
  return points;
}
