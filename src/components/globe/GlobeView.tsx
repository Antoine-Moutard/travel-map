import { useRef, useEffect, memo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTripStore } from '../../store/useTripStore';
import { useGlobeData } from './useGlobeData';
import { reverseGeocode } from '../../services/geocoding';
import { TRANSPORT_COLORS } from '../../constants';
import type { MarkerDatum } from './useGlobeData';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

const MAP_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`
  : 'https://tiles.openfreemap.org/styles/liberty';

function createMarkerElement(marker: MarkerDatum): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'destination-marker flex flex-col items-center cursor-pointer';

  const dot = document.createElement('div');
  dot.className = `marker-dot${marker.isSelected ? ' marker-dot--selected' : ''}`;
  dot.textContent = marker.emoji || String(marker.order);

  const label = document.createElement('span');
  label.className = 'marker-label';
  label.textContent = marker.name;

  el.appendChild(dot);
  el.appendChild(label);
  return el;
}

const TRANSPORT_COLOR_EXPR = [
  'match',
  ['get', 'transport'],
  ...Object.entries(TRANSPORT_COLORS).flat(),
  '#94a3b8',
];

function GlobeViewInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [ready, setReady] = useState(false);

  const { markersData, routeGeoJson } = useGlobeData();
  const selectedId = useTripStore((s) => s.selectedId);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [10, 30],
      zoom: 2,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');
    map.addControl(new maplibregl.GlobeControl(), 'top-left');

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' });
      map.setSky({ 'atmosphere-blend': 0.8 });
    });

    map.on('load', () => {
      map.addSource('routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': TRANSPORT_COLOR_EXPR as any,
          'line-width': 8,
          'line-opacity': 0.12,
          'line-blur': 4,
        },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': TRANSPORT_COLOR_EXPR as any,
          'line-width': [
            'case',
            ['==', ['get', 'isSelected'], true],
            3.5,
            2.5,
          ],
          'line-opacity': [
            'case',
            ['==', ['get', 'isSelected'], true],
            1,
            0.8,
          ],
        },
      });

      map.addLayer({
        id: 'route-dash',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': 'rgba(255,255,255,0.5)',
          'line-width': 1,
          'line-dasharray': [2, 4],
        },
      });

      setReady(true);
    });

    map.on('click', 'route-line', (e) => {
      if (e.features?.[0]?.properties?.id) {
        useTripStore.getState().selectLeg(e.features[0].properties.id);
        e.originalEvent.stopPropagation();
      }
    });

    map.on('mouseenter', 'route-line', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'route-line', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', async (e) => {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.destination-marker')) return;
      if (target.closest('.maplibregl-ctrl')) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: ['route-line'],
      });
      if (features.length > 0) return;

      const { lng, lat } = e.lngLat;
      const id = useTripStore.getState().addDestination({
        name: 'Chargement...',
        lat,
        lng,
      });
      const result = await reverseGeocode(lat, lng);
      if (result) {
        useTripStore.getState().updateDestination(id, {
          name: result.city || result.country || result.displayName.split(',')[0],
          country: result.country,
          city: result.city,
        });
      } else {
        useTripStore.getState().updateDestination(id, {
          name: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const source = mapRef.current.getSource('routes') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(routeGeoJson as any);
    }
  }, [routeGeoJson, ready]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const existing = markersRef.current;
    const currentIds = new Set(markersData.map((m) => m.id));

    for (const [id, marker] of existing) {
      if (!currentIds.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    }

    for (const m of markersData) {
      const prev = existing.get(m.id);
      if (prev) {
        prev.setLngLat([m.lng, m.lat]);
        const el = prev.getElement();
        const dot = el.querySelector('.marker-dot');
        if (dot) {
          dot.className = `marker-dot${m.isSelected ? ' marker-dot--selected' : ''}`;
          dot.textContent = m.emoji || String(m.order);
        }
        const label = el.querySelector('.marker-label');
        if (label) label.textContent = m.name;
      } else {
        const el = createMarkerElement(m);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          useTripStore.getState().selectDestination(m.id);
        });
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([m.lng, m.lat])
          .addTo(map);
        existing.set(m.id, marker);
      }
    }
  }, [markersData]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const dest = useTripStore.getState().trip.destinations.find((d) => d.id === selectedId);
    if (dest) {
      mapRef.current.flyTo({
        center: [dest.lng, dest.lat],
        zoom: Math.max(mapRef.current.getZoom(), 5),
        duration: 1400,
      });
    }
  }, [selectedId]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="w-full h-full" style={{ background: 'hsl(240,20%,4%)' }} />
      {!MAPTILER_KEY && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 bg-surface/70 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] text-subtle pointer-events-none">
          Ajoutez VITE_MAPTILER_KEY dans .env pour la vue satellite
        </div>
      )}
    </div>
  );
}

export const GlobeView = memo(GlobeViewInner);
