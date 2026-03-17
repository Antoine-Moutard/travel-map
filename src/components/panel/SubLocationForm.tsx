import { useCallback } from 'react';
import { Trash2, MapPinned } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { SUB_LOCATION_TYPES } from '../../constants';
import type { SubLocation } from '../../types';

interface SubLocationFormProps {
  destId: string;
  subLocation: SubLocation;
}

export function SubLocationForm({ destId, subLocation }: SubLocationFormProps) {
  const updateSubLocation = useTripStore((s) => s.updateSubLocation);
  const removeSubLocation = useTripStore((s) => s.removeSubLocation);

  const update = useCallback(
    (updates: Partial<SubLocation>) => {
      updateSubLocation(destId, subLocation.id, updates);
    },
    [destId, subLocation.id, updateSubLocation],
  );

  return (
    <div className="rounded-xl border border-muted/50 bg-elevated/50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <MapPinned size={12} className="text-accent-light shrink-0" />
          <input
            value={subLocation.name}
            onChange={(e) => update({ name: e.target.value })}
            className="text-sm font-medium text-default bg-transparent border-none focus:outline-none w-full"
            placeholder="Nom du lieu"
          />
        </div>
        <button
          onClick={() => removeSubLocation(destId, subLocation.id)}
          aria-label="Supprimer"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-subtle hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer shrink-0"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <select
        value={subLocation.type}
        onChange={(e) => update({ type: e.target.value })}
        className="text-xs bg-surface border border-muted/50 rounded-lg px-3 py-2 text-subtle focus:outline-none focus:border-accent cursor-pointer transition-colors"
      >
        {SUB_LOCATION_TYPES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
      <input
        value={subLocation.notes}
        onChange={(e) => update({ notes: e.target.value })}
        placeholder="Notes..."
        className="text-xs text-subtle bg-transparent border-none focus:outline-none placeholder:text-subtle/40"
      />
    </div>
  );
}
