import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCode,
  Shield,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Exercise } from '../data/sampleData';

interface ImportPreviewModalProps {
  existingExercises: Exercise[];
  onClose: () => void;
  onImportSuccess: (newExercises: Exercise[]) => void;
}

export type MergeStrategy = 'ADD_AS_NEW' | 'SKIP_DUPLICATES' | 'OVERWRITE' | 'KEEP_EXISTING';

export interface RawCandidate {
  name: string;
  sourceCategory: string;
  mappedCategory: string;
  notes: string;
  isDuplicate: boolean;
  selected: boolean;
  strategy: MergeStrategy;
  isAmbiguous: boolean;
}

const SAMPLE_JSON = `{
  "app": "GymTracker Pro",
  "version": "2.4.1",
  "exercises": [
    {"name": "Wyciskanie hantli na skosie dodatnim", "category": "Chest / Upper", "sets": 3, "notes": "Kąt 30 st"},
    {"name": "Wznosy bokiem na wyciągu", "category": "Shoulders / Delts", "sets": 4, "notes": "Pojedyncza rączka"},
    {"name": "Uginanie ramion chwyt młotkowy", "category": "Arms / Biceps", "sets": 3, "notes": "Hantle stojąc"},
    {"name": "Wyciskanie francuskie ze sztangą łamaną", "category": "Arms / Triceps", "sets": 3, "notes": "Leżąc na ławce"},
    {"name": "Dziwne ćwiczenie z nieznaną partią", "category": "SuperUnknownGroup", "sets": 3, "notes": "Nieznana grupa"}
  ],
  "templates": [
    {"name": "Push A (Importowany)", "description": "Szablon z pliku JSON", "exercises": ["Wyciskanie hantli na skosie dodatnim"]}
  ],
  "plans": [
    {"name": "Cykl Jesień 2026", "type": "ROTATIONAL", "workouts": ["Push A (Importowany)"]}
  ]
}`;

const CATEGORIES = [
  'Klatka piersiowa',
  'Plecy',
  'Nogi',
  'Barki',
  'Biceps',
  'Triceps',
  'Pozostałe'
];

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  existingExercises,
  onClose,
  onImportSuccess
}) => {
  const [step, setStep] = useState<'INPUT' | 'PREVIEW' | 'SUMMARY' | 'RESULT'>('INPUT');
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [fileName, setFileName] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<RawCandidate[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [resultStats, setResultStats] = useState({ added: 0, updated: 0, skipped: 0, conflicts: 0 });
  const [selectedCandidateForCategoryEdit, setSelectedCandidateForCategoryEdit] = useState<number | null>(null);

  const existingNames = new Set(existingExercises.map((e) => e.name.toLowerCase()));

  const mapCategory = (rawCat: string): { category: string; ambiguous: boolean } => {
    const lower = rawCat.toLowerCase();
    if (lower.includes('chest') || lower.includes('klatk')) return { category: 'Klatka piersiowa', ambiguous: false };
    if (lower.includes('back') || lower.includes('plec')) return { category: 'Plecy', ambiguous: false };
    if (lower.includes('leg') || lower.includes('nog') || lower.includes('squat')) return { category: 'Nogi', ambiguous: false };
    if (lower.includes('shoulder') || lower.includes('bark') || lower.includes('delt')) return { category: 'Barki', ambiguous: false };
    if (lower.includes('bicep') || lower.includes('ramion')) return { category: 'Biceps', ambiguous: false };
    if (lower.includes('tricep') || lower.includes('triceps')) return { category: 'Triceps', ambiguous: false };
    return { category: 'Pozostałe', ambiguous: true };
  };

  const handleAnalyze = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const rawList = Array.isArray(parsed) ? parsed : parsed.exercises || [];
      const analyzed: RawCandidate[] = rawList.map((item: any) => {
        const name = item.name || 'Nieznane ćwiczenie';
        const isDup = existingNames.has(name.toLowerCase());
        const { category, ambiguous } = mapCategory(item.category || '');
        return {
          name,
          sourceCategory: item.category || 'Brak',
          mappedCategory: category,
          notes: item.notes || '',
          isDuplicate: isDup,
          selected: true,
          strategy: isDup ? 'SKIP_DUPLICATES' : 'ADD_AS_NEW',
          isAmbiguous: ambiguous
        };
      });
      setCandidates(analyzed);
      setStep('PREVIEW');
    } catch (e: any) {
      alert(`Błąd składni JSON: ${e.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Plik przekracza limit 10 MB');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Summary counts
  const selectedCandidates = candidates.filter((c) => c.selected);
  const toAddCount = selectedCandidates.filter((c) => !c.isDuplicate || c.strategy === 'ADD_AS_NEW').length;
  const toOverwriteCount = selectedCandidates.filter((c) => c.isDuplicate && c.strategy === 'OVERWRITE').length;
  const toSkipCount = selectedCandidates.filter((c) => c.isDuplicate && (c.strategy === 'SKIP_DUPLICATES' || c.strategy === 'KEEP_EXISTING')).length;
  const deselectedCount = candidates.filter((c) => !c.selected).length;
  const ambiguousCount = selectedCandidates.filter((c) => c.isAmbiguous).length;

  const handleExecuteImport = () => {
    if (isExecuting || ambiguousCount > 0) return;
    setIsExecuting(true);
    setTimeout(() => {
      const newItems: Exercise[] = [];
      let added = 0;
      let updated = 0;
      let skipped = 0;
      let conflicts = 0;

      selectedCandidates.forEach((c) => {
        if (c.isDuplicate) {
          conflicts++;
          if (c.strategy === 'OVERWRITE') {
            updated++;
          } else if (c.strategy === 'ADD_AS_NEW') {
            newItems.push({
              id: `imported_${Date.now()}_${Math.random()}`,
              name: `${c.name} (Import)`,
              category: c.mappedCategory,
              notes: c.notes,
              isCustom: true
            });
            added++;
          } else {
            skipped++;
          }
        } else {
          newItems.push({
            id: `imported_${Date.now()}_${Math.random()}`,
            name: c.name,
            category: c.mappedCategory,
            notes: c.notes,
            isCustom: true
          });
          added++;
        }
      });

      setResultStats({ added, updated, skipped, conflicts });
      setIsExecuting(false);
      setStep('RESULT');
      onImportSuccess(newItems);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-[#2C384E] flex items-center justify-between bg-[#1F2736]/60">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Import danych GymTracker Pro
              <span className="ml-2 text-[10px] text-cyan-400 font-normal">
                {step === 'INPUT' && '• Wybór źródła danych'}
                {step === 'PREVIEW' && '• Podgląd i edycja kandydatów'}
                {step === 'SUMMARY' && '• Podsumowanie przed zatwierdzeniem'}
                {step === 'RESULT' && '• Wynik transakcji'}
              </span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#2C384E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* ================= STEP 1: INPUT ================= */}
          {step === 'INPUT' && (
            <div className="space-y-3">
              <p className="text-xs text-[#94A3B8]">
                Wybierz plik JSON z telefonu lub wklej treść poniżej. Analiza odbywa się w pamięci bez modyfikacji bazy danych.
              </p>

              {/* SAF File Upload simulation */}
              <div className="border border-dashed border-[#2C384E] hover:border-cyan-500/50 rounded-xl p-3 bg-[#0F1218] transition-colors">
                <input
                  type="file"
                  id="json-file-input"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="json-file-input"
                  className="cursor-pointer flex items-center justify-between text-xs text-cyan-400 font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    {fileName ? `Plik: ${fileName}` : 'Wybierz plik JSON z telefonu (SAF)'}
                  </span>
                  <span className="text-[10px] bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/30">
                    Limit 10 MB
                  </span>
                </label>
              </div>

              {/* Raw JSON textarea */}
              <div>
                <label className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-semibold mb-1">
                  Treść JSON:
                </label>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={8}
                  className="w-full bg-[#0F1218] border border-[#2C384E] rounded-xl p-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  placeholder="Wklej strukturę JSON..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFileName(null);
                    setJsonText(SAMPLE_JSON);
                  }}
                  className="text-xs text-[#94A3B8] hover:text-white bg-[#1F2736] hover:bg-[#2C384E] px-3 py-1.5 rounded-lg border border-[#2C384E] transition-colors"
                >
                  Wklej przykład
                </button>
                <button
                  onClick={() => {
                    setFileName(null);
                    setJsonText('');
                  }}
                  className="text-xs text-[#94A3B8] hover:text-white bg-[#1F2736] hover:bg-[#2C384E] px-3 py-1.5 rounded-lg border border-[#2C384E] transition-colors"
                >
                  Wyczyść
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PREVIEW & SELECTION ================= */}
          {step === 'PREVIEW' && (
            <div className="space-y-3">
              <div className="bg-[#0F1218] border border-[#2C384E] rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Rozpoznane dane w pliku</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {candidates.length} ćwiczeń • 1 szablon • 1 cykl
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  Zaznacz pozycje, które chcesz zaimportować, i dostosuj strategie scalania oraz kategorie.
                </p>
              </div>

              {/* Candidates List */}
              <div className="space-y-2">
                {candidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className={`bg-[#0F1218] border rounded-xl p-3 space-y-2 transition-colors ${
                      cand.isAmbiguous
                        ? 'border-cyan-500/50'
                        : cand.isDuplicate
                        ? 'border-amber-500/40'
                        : 'border-[#2C384E]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <label className="flex items-start gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={cand.selected}
                          onChange={(e) => {
                            const updated = [...candidates];
                            updated[idx].selected = e.target.checked;
                            setCandidates(updated);
                          }}
                          className="mt-0.5 rounded border-[#2C384E] text-emerald-500 focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{cand.name}</p>
                          {cand.notes && (
                            <p className="text-[10px] text-[#94A3B8]">Notatka: {cand.notes}</p>
                          )}
                        </div>
                      </label>

                      {cand.isDuplicate && (
                        <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded">
                          Duplikat
                        </span>
                      )}
                    </div>

                    {/* Category Mapping */}
                    <div className="flex items-center justify-between text-[11px] bg-[#1F2736] p-2 rounded-lg border border-[#2C384E]">
                      <div>
                        <span className="text-[#94A3B8] block text-[9px]">Źródło: {cand.sourceCategory}</span>
                        <span className="text-white font-semibold">
                          Docelowo: <strong className={cand.isAmbiguous ? 'text-amber-400' : 'text-emerald-400'}>{cand.mappedCategory}</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedCandidateForCategoryEdit(idx)}
                        className="text-[10px] text-cyan-400 hover:underline font-medium"
                      >
                        Zmień partię
                      </button>
                    </div>

                    {/* Strategy selection */}
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-[#94A3B8]">Strategia:</span>
                      <div className="flex gap-1">
                        {(['ADD_AS_NEW', 'SKIP_DUPLICATES', 'OVERWRITE'] as MergeStrategy[]).map((strat) => (
                          <button
                            key={strat}
                            onClick={() => {
                              const updated = [...candidates];
                              updated[idx].strategy = strat;
                              setCandidates(updated);
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-medium border transition-colors ${
                              cand.strategy === strat
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                                : 'bg-[#181E29] text-[#94A3B8] border-[#2C384E] hover:text-white'
                            }`}
                          >
                            {strat === 'ADD_AS_NEW' ? 'Nowe' : strat === 'SKIP_DUPLICATES' ? 'Pomiń' : 'Zastąp'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= STEP 3: SUMMARY & CONFIRMATION ================= */}
          {step === 'SUMMARY' && (
            <div className="space-y-3.5">
              <div className="bg-[#0F1218] border border-[#2C384E] rounded-xl p-3 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Bilans planowanych operacji w bazie Room
                </h4>
                <div className="space-y-1 text-xs text-[#94A3B8]">
                  <div className="flex justify-between">
                    <span>• Rekordy do dodania jako nowe:</span>
                    <strong className="text-emerald-400">{toAddCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>• Istniejące rekordy do zastąpienia:</span>
                    <strong className="text-amber-400">{toOverwriteCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>• Duplikaty do pominięcia:</span>
                    <strong className="text-[#94A3B8]">{toSkipCount}</strong>
                  </div>
                  {deselectedCount > 0 && (
                    <div className="flex justify-between">
                      <span>• Pozycje odznaczone przez użytkownika:</span>
                      <strong className="text-[#64748B]">{deselectedCount}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Ambiguity block warning */}
              {ambiguousCount > 0 && (
                <div className="bg-red-950/20 border border-red-500/40 rounded-xl p-3 text-xs text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Zatwierdzenie zablokowane:</strong>
                    {ambiguousCount} wybranych ćwiczeń ma nierozstrzygniętą kategorię partii mięśniowej. Wróć do podglądu i wskaż właściwą partię z 7 dozwolonych.
                  </div>
                </div>
              )}

              {/* Supported / Unsupported Data types breakdown */}
              <div className="bg-[#0F1218] border border-[#2C384E] rounded-xl p-3 space-y-1.5 text-xs">
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-semibold">
                  Obsługa typów danych w Etapie 3D:
                </span>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>✓ Ćwiczenia ({selectedCandidates.length} pozycji)</span>
                    <span>Pełny zapis do Room</span>
                  </div>
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span>• Szablony treningowe (1 szablon)</span>
                    <span className="text-[10px] text-amber-400">Tylko odczyt (Etap 3D)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span>• Cykle / Plany (1 cykl)</span>
                    <span className="text-[10px] text-amber-400">Tylko odczyt (Etap 3D)</span>
                  </div>
                </div>
              </div>

              {/* History protection banner */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-[#94A3B8]">
                  <strong className="text-white">Gwarancja integralności historii:</strong> Ukończone sesje, serie i historyczne kategorie pozostają w 100% nienaruszone. Zapis odbywa się w jednej atomowej transakcji.
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 4: RESULT REPORT ================= */}
          {step === 'RESULT' && (
            <div className="space-y-3 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>

              <h4 className="text-base font-bold text-white">Import zakończony pomyślnie!</h4>
              <p className="text-xs text-[#94A3B8]">
                Transakcja bazy danych Room została zatwierdzona.
              </p>

              <div className="bg-[#0F1218] border border-[#2C384E] rounded-xl p-3.5 text-left text-xs space-y-1.5 max-w-xs mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Dodano nowych ćwiczeń:</span>
                  <strong className="text-emerald-400">{resultStats.added}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Zaktualizowano istniejących:</span>
                  <strong className="text-amber-400">{resultStats.updated}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Pominięto duplikatów:</span>
                  <strong className="text-[#94A3B8]">{resultStats.skipped}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Rozwiązanych kolizji:</span>
                  <strong className="text-cyan-400">{resultStats.conflicts}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-[#2C384E] flex items-center justify-between bg-[#1F2736]/40">
          {step === 'INPUT' && (
            <>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!jsonText.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-[#0F1218] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                Analizuj strukturę JSON
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'PREVIEW' && (
            <>
              <button
                onClick={() => setStep('INPUT')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Wróć
              </button>
              <button
                onClick={() => setStep('SUMMARY')}
                disabled={selectedCandidates.length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-[#0F1218] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                Dalej: Podsumowanie ({selectedCandidates.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'SUMMARY' && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('PREVIEW')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
                >
                  Wróć do podglądu
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
                >
                  Anuluj
                </button>
              </div>
              <button
                onClick={handleExecuteImport}
                disabled={isExecuting || ambiguousCount > 0 || selectedCandidates.length === 0}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-[#0F1218] text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                {isExecuting ? 'Zapisywanie w Room...' : 'Zatwierdź import'}
              </button>
            </>
          )}

          {step === 'RESULT' && (
            <button
              onClick={onClose}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0F1218] text-xs font-bold py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            >
              Zakończ i zamknij
            </button>
          )}
        </div>
      </div>

      {/* Category Picker Popover Modal */}
      {selectedCandidateForCategoryEdit !== null && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl max-w-xs w-full p-4 space-y-3 shadow-2xl">
            <h4 className="text-xs font-bold text-white">Wybierz jedną z 7 partii głównych:</h4>
            <div className="space-y-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const updated = [...candidates];
                    updated[selectedCandidateForCategoryEdit].mappedCategory = cat;
                    updated[selectedCandidateForCategoryEdit].isAmbiguous = false;
                    setCandidates(updated);
                    setSelectedCandidateForCategoryEdit(null);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-[#0F1218] hover:bg-[#1F2736] border border-[#2C384E] hover:border-emerald-500 text-xs text-white font-medium transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedCandidateForCategoryEdit(null)}
              className="w-full bg-[#1F2736] text-[#94A3B8] text-xs py-1.5 rounded-xl hover:text-white"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
