import { useCallback, useState } from 'react';
import { Trash2, MapPin, Plus, Copy, Calendar, Wallet } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ConfirmModal } from '../ui/ConfirmModal';
import { SubLocationForm } from './SubLocationForm';
import { DESTINATION_EMOJIS, CURRENCIES } from '../../constants';
import type { Destination } from '../../types';

interface DestinationFormProps {
  destination: Destination;
}

export function DestinationForm({ destination }: DestinationFormProps) {
  const updateDestination = useTripStore((s) => s.updateDestination);
  const removeDestination = useTripStore((s) => s.removeDestination);
  const duplicateDestination = useTripStore((s) => s.duplicateDestination);
  const addSubLocation = useTripStore((s) => s.addSubLocation);
  const currency = useTripStore((s) => s.trip.currency);
  const updateCurrency = useTripStore((s) => s.updateCurrency);

  const [newActivity, setNewActivity] = useState('');
  const [showActivityInput, setShowActivityInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = useCallback(
    (updates: Partial<Destination>) => {
      updateDestination(destination.id, updates);
    },
    [destination.id, updateDestination],
  );

  const handleAddActivity = useCallback(() => {
    if (newActivity.trim()) {
      update({ activities: [...destination.activities, newActivity.trim()] });
      setNewActivity('');
      setShowActivityInput(false);
    }
  }, [newActivity, destination.activities, update]);

  const handleRemoveActivity = useCallback(
    (index: number) => {
      update({ activities: destination.activities.filter((_, i) => i !== index) });
    },
    [destination.activities, update],
  );

  const handleAddSubLocation = useCallback(() => {
    addSubLocation(destination.id, {
      name: 'Nouveau lieu',
      lat: destination.lat + (Math.random() - 0.5) * 0.02,
      lng: destination.lng + (Math.random() - 0.5) * 0.02,
    });
  }, [destination.id, destination.lat, destination.lng, addSubLocation]);

  const curSymbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? '€';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowEmojiPicker((s) => !s)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-elevated transition-all cursor-pointer"
            title="Choisir une icône"
          >
            {destination.emoji || <MapPin size={15} className="text-accent" />}
          </button>
          <Badge variant="accent">Destination {destination.order + 1}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => duplicateDestination(destination.id)}
            aria-label="Dupliquer"
            title="Dupliquer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-subtle hover:text-accent hover:bg-accent/10 transition-all cursor-pointer"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Supprimer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-subtle hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-elevated/60 border border-muted/30">
          <button
            onClick={() => {
              update({ emoji: '' });
              setShowEmojiPicker(false);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-subtle text-xs hover:bg-surface transition-all cursor-pointer"
            title="Aucun"
          >
            ✕
          </button>
          {DESTINATION_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => {
                update({ emoji: e });
                setShowEmojiPicker(false);
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-surface transition-all cursor-pointer ${
                destination.emoji === e ? 'bg-accent/15 ring-1 ring-accent/30' : ''
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Fields */}
      <Input
        label="Nom"
        value={destination.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="Nom du lieu"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Pays"
          value={destination.country}
          onChange={(e) => update({ country: e.target.value })}
          placeholder="Pays"
        />
        <Input
          label="Ville"
          value={destination.city}
          onChange={(e) => update({ city: e.target.value })}
          placeholder="Ville"
        />
      </div>

      {/* Dates */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-accent" />
          <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider">
            Dates du séjour
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Arrivée"
            type="date"
            value={destination.arrivalDate}
            onChange={(e) => update({ arrivalDate: e.target.value })}
          />
          <Input
            label="Départ"
            type="date"
            value={destination.departureDate}
            onChange={(e) => update({ departureDate: e.target.value })}
          />
        </div>
      </div>

      {/* Budget */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <Wallet size={12} className="text-accent" />
          <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider">
            Budget
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <div className="relative">
              <input
                type="number"
                min={0}
                value={destination.budget || ''}
                onChange={(e) => update({ budget: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full rounded-xl border border-muted/60 bg-elevated pl-4 pr-10 py-2.5 text-sm text-default placeholder:text-subtle/40 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-subtle font-medium">
                {curSymbol}
              </span>
            </div>
          </div>
          <select
            value={currency}
            onChange={(e) => updateCurrency(e.target.value)}
            className="rounded-xl border border-muted/60 bg-elevated px-2 py-2.5 text-xs text-default transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10 cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Hôtel"
        value={destination.hotel}
        onChange={(e) => update({ hotel: e.target.value })}
        placeholder="Nom de l'hôtel"
      />

      {/* Activities */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider">
            Activités
          </span>
          <button
            onClick={() => setShowActivityInput(true)}
            className="text-xs text-accent hover:text-accent-light font-medium transition-colors cursor-pointer"
          >
            + Ajouter
          </button>
        </div>

        {showActivityInput && (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddActivity();
                if (e.key === 'Escape') {
                  setNewActivity('');
                  setShowActivityInput(false);
                }
              }}
              placeholder="Nom de l'activité..."
              className="flex-1 rounded-lg border border-muted/60 bg-elevated px-3 py-1.5 text-xs text-default placeholder:text-subtle/40 focus:border-accent focus:outline-none"
            />
            <button
              onClick={handleAddActivity}
              className="text-xs text-accent font-medium hover:text-accent-light cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {destination.activities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {destination.activities.map((a, i) => (
              <Badge key={i} variant="default">
                {a}
                <button
                  onClick={() => handleRemoveActivity(i)}
                  className="ml-1.5 text-subtle hover:text-destructive transition-colors cursor-pointer"
                  aria-label={`Supprimer ${a}`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          !showActivityInput && (
            <p className="text-xs text-subtle/50 italic">Aucune activité ajoutée</p>
          )
        )}
      </div>

      <TextArea
        label="Notes"
        value={destination.notes}
        onChange={(e) => update({ notes: e.target.value })}
        placeholder="Notes libres..."
      />

      {/* Coordinates */}
      <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg bg-elevated/60">
        <div className="text-[11px] text-subtle font-mono">
          <span className="text-subtle/60">lat</span> {destination.lat.toFixed(4)}
        </div>
        <div className="text-[11px] text-subtle font-mono">
          <span className="text-subtle/60">lng</span> {destination.lng.toFixed(4)}
        </div>
      </div>

      {/* Sub-locations */}
      <div className="flex flex-col gap-3 pt-4 border-t border-muted/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-default uppercase tracking-wider">
            Sous-lieux
          </span>
          <Button size="sm" variant="ghost" onClick={handleAddSubLocation}>
            <Plus size={12} />
            Ajouter
          </Button>
        </div>

        {destination.subLocations.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {destination.subLocations.map((sub) => (
              <SubLocationForm key={sub.id} destId={destination.id} subLocation={sub} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-subtle/50 italic">
            Ajoutez des lieux spécifiques dans cette destination
          </p>
        )}
      </div>

      {/* Confirm delete */}
      <ConfirmModal
        open={confirmDelete}
        title={`Supprimer ${destination.name} ?`}
        description="La destination et tous ses sous-lieux seront définitivement supprimés."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => {
          removeDestination(destination.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
