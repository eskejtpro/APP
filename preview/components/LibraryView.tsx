import React, { useState } from 'react';
import { Search, Plus, Upload, Dumbbell, FileText } from 'lucide-react';
import { Exercise } from '../data/sampleData';

interface LibraryViewProps {
  exercises: Exercise[];
  onOpenImport: () => void;
  onAddCustomExercise: (ex: Exercise) => void;
}

const CATEGORIES = [
  'Wszystkie',
  'Klatka piersiowa',
  'Plecy',
  'Nogi',
  'Barki',
  'Biceps',
  'Triceps',
  'Pozostałe'
];

export const LibraryView: React.FC<LibraryViewProps> = ({
  exercises,
  onOpenImport,
  onAddCustomExercise
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Klatka piersiowa');
  const [newNotes, setNewNotes] = useState('');

  const filtered = exercises.filter((ex) => {
    const matchesCategory =
      selectedCategory === 'Wszystkie' || ex.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddCustomExercise({
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      notes: newNotes.trim(),
      isCustom: true
    });
    setNewName('');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-white flex items-center gap-1.5">
          <Dumbbell className="w-5 h-5 text-emerald-400" />
          Biblioteka Ćwiczeń ({exercises.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 text-xs bg-[#1F2736] hover:bg-[#2C384E] text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-lg transition-colors font-semibold shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Import JSON
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] px-3 py-1.5 rounded-lg transition-colors font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Dodaj
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj ćwiczenia lub notatek..."
          className="w-full bg-[#181E29] border border-[#2C384E] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-[#0F1218] font-bold shadow-sm'
                : 'bg-[#181E29] text-[#94A3B8] hover:text-white border border-[#2C384E]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-[#181E29] border border-[#2C384E] rounded-2xl p-6">
            <p className="text-sm text-[#94A3B8]">Brak ćwiczeń spełniających kryteria.</p>
          </div>
        ) : (
          filtered.map((ex) => (
            <div
              key={ex.id}
              className="bg-[#181E29] border border-[#2C384E] rounded-xl p-3 flex flex-col gap-1 hover:border-[#3D4F6E] transition-colors"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-semibold text-white">{ex.name}</span>
                <span className="text-[10px] bg-[#1F2736] text-cyan-400 px-2 py-0.5 rounded border border-[#2C384E]">
                  {ex.category}
                </span>
              </div>
              {ex.notes && (
                <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5">
                  <FileText className="w-3 h-3 text-[#64748B]" /> {ex.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Nowe ćwiczenie własne</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">Nazwa ćwiczenia</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="np. Wyciskanie na maszynie Hammer"
                  className="w-full bg-[#0F1218] border border-[#2C384E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">Kategoria / Partia mięśniowa</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#0F1218] border border-[#2C384E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.filter((c) => c !== 'Wszystkie').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#94A3B8] block mb-1">Notatki techniczne (opcjonalnie)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="np. Ustawienie siedziska nr 4"
                  className="w-full bg-[#0F1218] border border-[#2C384E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#1F2736] hover:bg-[#2C384E] text-[#94A3B8] font-semibold py-2 rounded-lg text-xs"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] font-bold py-2 rounded-lg text-xs"
                >
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
