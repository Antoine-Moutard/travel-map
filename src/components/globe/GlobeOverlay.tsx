import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, RotateCcw, Sun, Moon, Download, Upload, Keyboard } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { ConfirmModal } from '../ui/ConfirmModal';

export function GlobeOverlay() {
  const tripName = useTripStore((s) => s.trip.name);
  const destinationCount = useTripStore((s) => s.trip.destinations.length);
  const setSearching = useTripStore((s) => s.setSearching);
  const resetTrip = useTripStore((s) => s.resetTrip);
  const updateTripName = useTripStore((s) => s.updateTripName);
  const isDark = useTripStore((s) => s.isDark);
  const toggleTheme = useTripStore((s) => s.toggleTheme);
  const exportTrip = useTripStore((s) => s.exportTrip);
  const importTrip = useTripStore((s) => s.importTrip);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tripName);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditName(tripName);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateTripName(editName.trim() || 'Mon Voyage');
    setIsEditing(false);
  };

  const handleExport = useCallback(() => {
    const json = exportTrip();
    const name = useTripStore.getState().trip.name;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportTrip]);

  const handleImport = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        importTrip(text);
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [importTrip],
  );

  const isMac = navigator.platform.includes('Mac');
  const mod = isMac ? '⌘' : 'Ctrl';

  return (
    <>
      {/* Top-center — trip name */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <div className="glass rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="text-sm font-semibold text-default bg-transparent border-none outline-none text-center min-w-[120px]"
            />
          ) : (
            <button
              onClick={handleStartEdit}
              className="text-sm font-semibold text-default tracking-tight hover:text-accent-light transition-colors cursor-pointer"
              title="Cliquer pour renommer"
            >
              {tripName}
            </button>
          )}
          {destinationCount > 0 && (
            <span className="text-[11px] text-subtle font-medium tabular-nums">
              {destinationCount} étape{destinationCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Bottom-left — controls */}
      <div className="absolute bottom-6 left-4 z-10 pointer-events-auto flex flex-col gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Changer de thème"
          title="Changer de thème"
          className="glass w-10 h-10 rounded-xl flex items-center justify-center text-subtle hover:text-default transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={handleExport}
          aria-label="Exporter le voyage"
          title={`Exporter (${mod}+E)`}
          className="glass w-10 h-10 rounded-xl flex items-center justify-center text-subtle hover:text-default transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
        >
          <Download size={15} />
        </button>
        <button
          onClick={handleImport}
          aria-label="Importer un voyage"
          title="Importer un voyage"
          className="glass w-10 h-10 rounded-xl flex items-center justify-center text-subtle hover:text-default transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
        >
          <Upload size={15} />
        </button>
        <button
          onClick={() => setShowShortcuts((s) => !s)}
          aria-label="Raccourcis clavier"
          title="Raccourcis clavier"
          className="glass w-10 h-10 rounded-xl flex items-center justify-center text-subtle hover:text-default transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
        >
          <Keyboard size={15} />
        </button>
        <button
          onClick={() => setConfirmReset(true)}
          aria-label="Réinitialiser le voyage"
          title="Réinitialiser"
          className="glass w-10 h-10 rounded-xl flex items-center justify-center text-subtle hover:text-destructive transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Keyboard shortcuts tooltip */}
      {showShortcuts && (
        <div className="absolute bottom-6 left-16 z-20 pointer-events-auto">
          <div className="glass rounded-xl p-4 shadow-xl min-w-[200px]">
            <h4 className="text-[11px] font-bold text-default uppercase tracking-wider mb-3">
              Raccourcis
            </h4>
            <div className="flex flex-col gap-2">
              {[
                [`${mod}+K`, 'Rechercher'],
                [`${mod}+E`, 'Exporter'],
                ['Esc', 'Fermer le panel'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-[11px] text-subtle">{desc}</span>
                  <kbd className="text-[10px] font-mono font-semibold text-default bg-elevated px-1.5 py-0.5 rounded">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom-center — add destination */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <button
          onClick={() => setSearching(true)}
          className="bg-accent hover:bg-accent-light text-white rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2.5 transition-all shadow-lg shadow-accent/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} />
          Ajouter une destination
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Confirm reset modal */}
      <ConfirmModal
        open={confirmReset}
        title="Réinitialiser le voyage ?"
        description="Toutes les destinations, trajets et données seront supprimés. Cette action est irréversible."
        confirmLabel="Réinitialiser"
        variant="danger"
        onConfirm={() => {
          resetTrip();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}
