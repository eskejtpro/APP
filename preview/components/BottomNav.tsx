import React from 'react';
import { Home, CalendarDays, Dumbbell, Calendar, PlayCircle, Settings, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { AppThemeMode } from './ThemeSelector';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeTheme?: AppThemeMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, activeTheme = 'chrome_ios_dark' }) => {
  const tabs = [
    { id: 'dashboard', label: 'Start', icon: Home },
    { id: 'plans', label: 'Plany', icon: CalendarDays },
    { id: 'library', label: 'Baza', icon: Dumbbell },
    { id: 'session', label: 'Trening', icon: PlayCircle },
    { id: 'calendar', label: 'Termin', icon: Calendar },
    { id: 'settings', label: 'Opcje', icon: Settings },
  ];

  const isChromeIOS = activeTheme.startsWith('chrome_ios');

  if (isChromeIOS) {
    const isLight = activeTheme === 'chrome_ios_light';
    const activeTabObj = tabs.find((t) => t.id === currentTab) || tabs[1];

    const handleCycleTab = (direction: 1 | -1) => {
      const currentIndex = tabs.findIndex((t) => t.id === currentTab);
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
      onSelectTab(tabs[nextIndex].id);
    };

    return (
      <nav
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 px-3 py-2 transition-all ${
          isLight
            ? 'bg-white/95 text-slate-800 border-t border-slate-200 shadow-2xl backdrop-blur-md'
            : activeTheme === 'chrome_ios_oled'
            ? 'bg-black text-white border-t border-[#1F2636] shadow-2xl'
            : 'bg-[#1F2023]/95 text-white border-t border-[#35383F] shadow-2xl backdrop-blur-md'
        }`}
      >
        <div className="flex items-center justify-between gap-1.5">
          {/* Back button */}
          <button
            onClick={() => handleCycleTab(-1)}
            title="Poprzednia karta"
            className={`p-2 rounded-full transition-colors ${
              isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#2F323A] text-slate-400'
            }`}
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Forward button */}
          <button
            onClick={() => handleCycleTab(1)}
            title="Następna karta"
            className={`p-2 rounded-full transition-colors ${
              isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#2F323A] text-slate-400'
            }`}
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Central Chrome iOS Omnibox Pill */}
          <div
            onClick={() => {
              // Cycle to next view or open session
              onSelectTab(currentTab === 'session' ? 'plans' : 'session');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full cursor-pointer transition-all border ${
              isLight
                ? 'bg-[#F1F3F4] border-slate-300 hover:border-blue-500'
                : 'bg-[#282A2F] border-[#3C4047] hover:border-blue-400'
            }`}
          >
            {/* Google 4-Color icon dot */}
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-black text-white">
              G
            </div>
            <span className="text-xs font-bold truncate max-w-[130px]">
              {activeTabObj.label} • Pasika
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Tab counter badge [6] */}
          <button
            onClick={() => handleCycleTab(1)}
            title="Karty w rotacji"
            className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${
              isLight
                ? 'border-slate-500 text-slate-800 hover:bg-slate-100'
                : 'border-slate-400 text-slate-200 hover:bg-[#2F323A]'
            }`}
          >
            {tabs.length}
          </button>

          {/* Three dots menu */}
          <button
            onClick={() => onSelectTab('settings')}
            title="Więcej opcji"
            className={`p-2 rounded-full transition-colors ${
              isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-[#2F323A] text-slate-400'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Quick tabs switcher bar */}
        <div className="flex justify-between items-center px-1 pt-1.5 mt-1 border-t border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center py-0.5 px-2 rounded-lg text-[9px] font-semibold transition-all ${
                  isTabActive
                    ? isLight
                      ? 'text-blue-600 font-bold'
                      : 'text-blue-400 font-bold'
                    : isLight
                    ? 'text-slate-500 hover:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isTabActive ? 'scale-110' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-[#181E29]/95 backdrop-blur border-t border-[#2C384E] px-1 py-1.5 flex justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-emerald-400 bg-emerald-500/10 font-bold'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[9px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
