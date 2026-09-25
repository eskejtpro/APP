import React, { useState } from 'react';
import {
  Plus,
  ShieldCheck,
  Calendar,
  FolderPlus,
  ChevronRight
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { AnalyticsSheet } from '../components/shared/AnalyticsSheet';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from '../components/shared/BackupSettingsDialog';
import { APPROVED_EXERCISE_CATEGORIES } from '../data/sampleData';

export const Propozycja4App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('plans');

  // Honest Empty State: no fabricated workout templates
  const [userPlans, setUserPlans] = useState<
    { id: string; name: string; targetCategories: string[]; notes: string }[]
  >([]);

  // Modal for creating a new plan
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(APPROVED_EXERCISE_CATEGORIES[0]);

  // Dialogs
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleCreatePlan = () => {
    if (!newPlanName.trim()) {
      alert('Wprowadź nazwę planu treningowego.');
      return;
    }
    setUserPlans((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newPlanName.trim(),
        targetCategories: [selectedCategory],
        notes: 'Własny szablon treningowy'
      }
    ]);
    setNewPlanName('');
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      <div className="w-full max-w-md min-h-screen bg-[#0F1218] flex flex-col relative shadow-2xl border-x border-[#212735]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 4: Spokojny planer"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* 1. Header: Typographic Calm Planner */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
              ARCHITEKTURA PLANOWANIA • XIAOMI 14T
            </span>
            <h1 className="text-xl font-black text-white">Spokojny Planer</h1>
            <p className="text-xs text-[#94A3B8]">
              Zarządzanie strukturą planów i niezmiennymi regułami harmonogramu.
            </p>
          </div>

          {/* 2. Rules Card: Schedule Principles (Source of truth) */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-2.5 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Niezmienne Reguły Harmonogramu
              </h2>
            </div>

            <div className="space-y-2 text-xs text-[#94A3B8] leading-relaxed">
              <div className="flex items-start gap-2 bg-[#0F1218] p-2.5 rounded-xl border border-[#2C3548]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] mt-1.5 shrink-0" />
                <span>
                  <strong>Jeden wspólny harmonogram:</strong> Widok tygodnia i miesiąca korzystają z dokładnie tego samego źródła.
                </span>
              </div>

              <div className="flex items-start gap-2 bg-[#0F1218] p-2.5 rounded-xl border border-[#2C3548]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] mt-1.5 shrink-0" />
                <span>
                  <strong>Maksymalnie 1 trening na dzień:</strong> Dzień może być oznaczony jako Trening, Dzień wolny lub Brak planu.
                </span>
              </div>

              <div className="flex items-start gap-2 bg-[#0F1218] p-2.5 rounded-xl border border-[#2C3548]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] mt-1.5 shrink-0" />
                <span>
                  <strong>Kopiowanie wyłącznie w przyszłość:</strong> Z potwierdzeniem nadpisania, bez mechaniki przeciągania.
                </span>
              </div>
            </div>
          </div>

          {/* 3. Plans List Section */}
          <div className="bg-[#171B24] border border-[#2C3548] p-4 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">Szablony Planów Treningowych</h3>
                <span className="text-[10px] text-[#64748B]">Baza lokalna Room</span>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#00E676] hover:bg-[#00c864] text-black font-bold text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Nowy plan</span>
              </button>
            </div>

            {/* Honest Empty State for Plans */}
            {userPlans.length === 0 ? (
              <div className="p-6 bg-[#0F1218] rounded-xl border border-[#2C3548] text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#212735] flex items-center justify-center mx-auto text-[#94A3B8]">
                  <FolderPlus className="w-5 h-5 text-[#00E676]" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">
                    Brak utworzonych planów treningowych
                  </span>
                  <p className="text-[11px] text-[#64748B] max-w-xs mx-auto">
                    Aplikacja nie zawiera wstępnie wygenerowanych jednostek. Utwórz własny plan lub zaimportuj ćwiczenia z pliku GymTracker.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {userPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3 bg-[#0F1218] rounded-xl border border-[#2C3548] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{plan.name}</h4>
                      <span className="text-[10px] text-[#00E676] font-mono">
                        {plan.targetCategories.join(', ')}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B] bg-[#212735] px-2 py-0.5 rounded-lg border border-[#2C3548]">
                      Lokalny szablon
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Quick Link to Weekly Schedule */}
          <div className="p-3 bg-[#171B24] border border-[#2C3548] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00E676]" />
              <div>
                <span className="text-xs font-bold text-white block">Harmonogram Główny</span>
                <span className="text-[10px] text-[#94A3B8]">Przydzielaj plany do dni tygodnia</span>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = '/propozycja-2-harmonogram.html')}
              className="text-xs text-[#00E676] font-bold hover:underline flex items-center gap-0.5"
            >
              <span>Otwórz</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
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

        {/* Modal: Utwórz plan */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
            <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Nowy Plan Treningowy</h3>
                <p className="text-[11px] text-[#94A3B8]">
                  Wybierz partię docelową z 7 zatwierdzonych kategorii:
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nazwa planu (np. Własny Trening A)..."
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-xs text-white placeholder-[#64748B] outline-none focus:border-[#00E676]"
                />

                <div className="space-y-1">
                  <span className="text-[10px] text-[#94A3B8] font-bold block">Główna kategoria mięśniowa:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-[#0F1218] border border-[#2C3548] rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00E676]"
                  >
                    {APPROVED_EXERCISE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#2C3548] hover:bg-[#212735] text-xs font-semibold text-[#94A3B8]"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleCreatePlan}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold shadow-md shadow-[#00E676]/20"
                >
                  Utwórz
                </button>
              </div>
            </div>
          </div>
        )}

        <AnalyticsSheet isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
        <GymTrackerImportDialog
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onConfirmImport={() => alert('Zaimportowano pozycje.')}
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
