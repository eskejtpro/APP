import React, { useState } from 'react';
import {
  BarChart3,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { M3TopAppBar } from '../components/shared/M3TopAppBar';
import { M3BottomNavBar, M3TabKey } from '../components/shared/M3BottomNavBar';
import { GymTrackerImportDialog } from '../components/shared/GymTrackerImportDialog';
import { BackupSettingsDialog } from '../components/shared/BackupSettingsDialog';
import { APPROVED_EXERCISE_CATEGORIES } from '../data/sampleData';

interface CategoryMetric {
  name: string;
  completedSets: number;
}

export const Propozycja7App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<M3TabKey>('analytics');
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH'>('WEEK');

  // Honest Empty State: Only 7 approved categories, 0 completed sets from Room
  const [categories] = useState<CategoryMetric[]>(
    APPROVED_EXERCISE_CATEGORIES.map((cat) => ({
      name: cat,
      completedSets: 0
    }))
  );

  const totalCompletedSets = categories.reduce((sum, c) => sum + c.completedSets, 0);

  // Dialogs
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#F8FAFC] flex justify-center selection:bg-[#00E676] selection:text-black">
      <div className="w-full max-w-md min-h-screen bg-[#0F1218] flex flex-col relative shadow-2xl border-x border-[#212735]">
        {/* Top App Bar */}
        <M3TopAppBar
          proposalLabel="Propozycja 7: Analizy danych"
          onOpenLibrary={() => setShowImport(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4 pb-24">
          {/* Header */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider block font-mono">
              CZYTELNOŚĆ DANYCH • XIAOMI 14T
            </span>
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-white">Analiza Objętości</h1>
              <span className="text-xs font-mono text-[#00E676] bg-[#00E676]/15 px-2.5 py-0.5 rounded-full border border-[#00E676]/30 font-bold">
                {totalCompletedSets} ukończonych serii
              </span>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="bg-[#171B24] border border-[#2C3548] p-1.5 rounded-2xl flex">
            <button
              onClick={() => setTimeRange('WEEK')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                timeRange === 'WEEK'
                  ? 'bg-[#00E676] text-black shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Bieżący Tydzień
            </button>
            <button
              onClick={() => setTimeRange('MONTH')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                timeRange === 'MONTH'
                  ? 'bg-[#00E676] text-black shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Bieżący Miesiąc
            </button>
          </div>

          {/* Core Analytics Rule Notice */}
          <div className="bg-[#171B24] border border-[#2C3548] p-3.5 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Zasada Zliczania Objętości
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Analizy w PlanPasika zliczają <strong>wyłącznie rzeczywiście ukończone serie</strong> zarejestrowane podczas sesji treningowych i przyporządkowane do <strong>7 zatwierdzonych kategorii anatomicznych</strong>. Dni oznaczone ręcznie jako wykonane bez sesji nie zasilają tego modułu.
            </p>
          </div>

          {/* Honest Empty State Hero */}
          {totalCompletedSets === 0 && (
            <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl p-6 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-full bg-[#0F1218] border border-[#2C3548] flex items-center justify-center mx-auto text-[#00E676]">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Brak Zarejestrowanych Serii w Bazie Room</h3>
                <p className="text-xs text-[#94A3B8] max-w-xs mx-auto leading-relaxed">
                  Moduł nie generuje sztucznych wykresów ani fikcyjnych tonaży. Dane pojawią się automatycznie po przeprowadzeniu pierwszej rzeczywistej sesji treningowej.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => (window.location.href = '/propozycja-3-trening.html')}
                  className="bg-[#212735] hover:bg-[#2C3548] text-[#00E676] border border-[#00E676]/40 text-xs font-bold py-2.5 px-4 rounded-xl inline-flex items-center gap-1.5 transition-all"
                >
                  <span>Przejdź do rejestracji treningu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 7 Approved Muscle Categories Breakdown */}
          <div className="bg-[#171B24] border border-[#2C3548] rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                7 Zatwierdzonych Partii Anatomicznych
              </h3>
              <span className="text-[10px] text-[#64748B] font-mono">Model domenowy</span>
            </div>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-[#0F1218] p-3 rounded-xl border border-[#2C3548] flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{cat.name}</span>
                    <span className="text-[10px] text-[#64748B]">
                      {cat.completedSets === 0 ? 'Brak danych o seriach' : `${cat.completedSets} ukończonych serii`}
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-[#94A3B8]">
                      {cat.completedSets}
                    </span>
                    <span className="text-[10px] text-[#64748B] ml-1">serii</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <M3BottomNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'today') window.location.href = '/propozycja-1-dzisiaj.html';
            if (tab === 'plans') window.location.href = '/propozycja-2-harmonogram.html';
            if (tab === 'workout') window.location.href = '/propozycja-3-trening.html';
            if (tab === 'calendar') window.location.href = '/propozycja-5-dziennik.html';
          }}
        />

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
