import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { searchLocations } from '../../services/geocoding';
import { useTripStore } from '../../store/useTripStore';
import type { GeoSearchResult } from '../../types';

export function LocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  const addDestination = useTripStore((s) => s.addDestination);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchLocations(debouncedQuery)
      .then((r) => {
        if (!cancelled) setResults(r);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = (result: GeoSearchResult) => {
    addDestination({
      name: result.city || result.displayName.split(',')[0],
      lat: result.lat,
      lng: result.lng,
      country: result.country,
      city: result.city,
    });
    setQuery('');
    setResults([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un lieu..."
          autoFocus
          className="w-full rounded-xl border border-muted bg-elevated pl-10 pr-4 py-3 text-sm text-default placeholder:text-subtle/50 focus:border-accent focus:outline-none transition-colors"
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-subtle animate-spin"
          />
        )}
      </div>

      {results.length > 0 && (
        <ul className="flex flex-col gap-1">
          {results.map((r, i) => (
            <li key={`${r.lat}-${r.lng}-${i}`}>
              <button
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-elevated transition-all flex items-start gap-3 group cursor-pointer"
              >
                <MapPin
                  size={14}
                  className="text-accent mt-0.5 shrink-0 group-hover:scale-110 transition-transform"
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-default truncate group-hover:text-accent-light transition-colors">
                    {r.displayName.split(',')[0]}
                  </span>
                  <span className="text-[11px] text-subtle truncate leading-tight">
                    {r.displayName.split(',').slice(1).join(',').trim()}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {debouncedQuery && !loading && results.length === 0 && (
        <p className="text-xs text-subtle text-center py-6">Aucun résultat trouvé</p>
      )}

      <p className="text-[10px] text-subtle/40 text-center mt-2">
        Vous pouvez aussi cliquer directement sur le globe
      </p>
    </div>
  );
}
