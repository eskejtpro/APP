import React, { useState } from 'react';
import {
  Search,
  Plus,
  Dumbbell,
  FolderOpen
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { AnalyticsSheet } from '../components/shared/AnalyticsSheet';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from '../components/shared/BackupSettingsDialog';
import { APPROVED_EXERCISE_CATEGORIES, Exercise } from '../data/sampleData';

export const Propozycja6App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Wszystkie');

  // Exercise database in Room: Starts with an honest empty state, populated via Import or manual addition
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);

  // Add custom exercise modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<string>(APPROVED_EXERCISE_CATEGORIES[0]);
  const [newExNotes, setNewExNotes] = useState('');

  // Dialogs
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleAddCustomExercise = () => {
    if (!newExName.trim()) {
      alert('Wpisz nazwę ćwiczenia.');
      return;
    }
    setExerciseList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newExName.trim(),
        category: newExCategory,
        notes: newExNotes.trim(),
        isCustom: true
      }
    ]);
    setNewExName('');
    setNewExNotes('');
    setShowAddModal(false);
  };

  const filteredExercises = exerciseList.filter((ex) => {
    const matchesCategory =
      selectedCategory === 'Wszystkie' || ex.category === selectedCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      <div className="w-full max-w-md min-h-screen bg-[#0F1218] flex flex-col relative shadow-2xl border-x border-[#212735]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 6: Biblioteka ćwiczeń"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
              BAZA DANYCH ĆWICZEŃ • XIAOMI 14T
            </span>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-white">Biblioteka Ćwiczeń</h1>
              <span className="text-xs font-mono text-[#00E676] bg-[#00E676]/15 px-2 py-0.5 rounded-full border border-[#00E676]/30">
                {exerciseList.length} pozycji
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Szukaj ćwiczenia w bazie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171B24] border border-[#2C3548] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676] transition-all"
            />
          </div>

          {/* 7 Approved Muscle Categories Filter Bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block px-1">
              Filtruj wg 7 zatwierdzonych kategorii:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['Wszystkie', ...APPROVED_EXERCISE_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/20'
                      : 'bg-[#171B24] text-[#94A3B8] hover:text-white border border-[#2C3548]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row: Add Custom Exercise or Import GymTracker */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#212735] hover:bg-[#2C3548] border border-[#2C3548] text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Dodaj ćwiczenie</span>
            </button>

            <button
              onClick={() => setShowImport(true)}
              className="bg-[#00E676]/15 hover:bg-[#00E676]/25 border border-[#00E676]/30 text-[#00E676] p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Import GymTracker</span>
            </button>
          </div>

          {/* Exercise List or Honest Empty State */}
          <div className="space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#0F1218] flex items-center justify-center mx-auto text-[#64748B]">
                  <Dumbbell className="w-5 h-5 text-[#00E676]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">
                    Brak ćwiczeń spełniających kryteria
                  </span>
                  <p className="text-[11px] text-[#64748B] max-w-xs mx-auto">
                    Baza lokalna Room jest czysta. Dodaj własne ćwiczenie lub skorzystaj z selektywnego importu z GymTrackera.
                  </p>
                </div>
              </div>
            ) : (
              filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="bg-[#171B24] border border-[#2C3548] rounded-2xl p-3.5 space-y-1 hover:border-[#00E676]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white">{ex.name}</h3>
                    <span className="text-[9px] bg-[#00E676]/15 text-[#00E676] font-mono px-2 py-0.5 rounded-full border border-[#00E676]/30">
                      {ex.category}
                    </span>
                  </div>
                  {ex.notes && (
                    <p className="text-[11px] text-[#94A3B8]">{ex.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <M3BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'today') window.location.href = '/propozycja-1-dzisiaj.html';
            if (tab === 'workout') window.location.href = '/propozycja-3-trening.html';
            if (tab === 'analytics') setShowAnalytics(true);
          }}
        />

        {/* Modal: Dodaj ćwiczenie */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
            <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Dodaj Własne Ćwiczenie</h3>
                <p className="text-[11px] text-[#94A3B8]">
                  Wybierz jedną z 7 zatwierdzonych kategorii anatomicznych:
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nazwa ćwiczenia..."
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676]"
                />

                <div className="space-y-1">
                  <span className="text-[10px] text-[#94A3B8] font-bold block">Kategoria:</span>
                  <select
                    value={newExCategory}
                    onChange={(e) => setNewExCategory(e.target.value)}
                    className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00E676]"
                  >
                    {APPROVED_EXERCISE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Notatki techniczne (opcjonalne)..."
                  value={newExNotes}
                  onChange={(e) => setNewExNotes(e.target.value)}
                  className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#2C3548] hover:bg-[#212735] text-xs font-semibold text-[#94A3B8]"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAddCustomExercise}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold shadow-md shadow-[#00E676]/20"
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        )}

        <AnalyticsSheet isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
        <GymTrackerImportDialog
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onConfirmImport={(newEx) => {
            setExerciseList((prev) => [...prev, ...newEx]);
            alert(`Pomyślnie zaimportowano ${newEx.length} ćwiczeń do bazy.`);
          }}
        />
        <BackupSettingsDialog
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onOpenImport={() => setShowImport(true)}
        />
      </div>
    </div>
  );
};
