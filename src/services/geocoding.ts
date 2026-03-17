import type { GeoSearchResult } from '../types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const cache = new Map<string, GeoSearchResult[]>();

async function fetchNominatim<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'TravelMap/1.0' },
  });
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);
  return res.json() as Promise<T>;
}

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    country?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
}

function parseResult(r: NominatimSearchResult): GeoSearchResult {
  return {
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    country: r.address?.country ?? '',
    city: r.address?.city ?? r.address?.town ?? r.address?.village ?? '',
  };
}

export async function searchLocations(query: string): Promise<GeoSearchResult[]> {
  if (!query.trim()) return [];

  const cacheKey = query.toLowerCase().trim();
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const encoded = encodeURIComponent(query);
  const url = `${NOMINATIM_BASE}/search?q=${encoded}&format=json&addressdetails=1&limit=6`;
  const results = await fetchNominatim<NominatimSearchResult[]>(url);
  const parsed = results.map(parseResult);

  cache.set(cacheKey, parsed);
  return parsed;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeoSearchResult | null> {
  const cacheKey = `rev_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const cached = cache.get(cacheKey);
  if (cached?.[0]) return cached[0];

  try {
    const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const result = await fetchNominatim<NominatimSearchResult>(url);
    const parsed = parseResult(result);
    cache.set(cacheKey, [parsed]);
    return parsed;
  } catch {
    return null;
  }
}
