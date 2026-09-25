import React from 'react';
import { Calendar, CalendarDays, Dumbbell, BarChart3, CheckSquare } from 'lucide-react';

export type M3TabKey = 'today' | 'plans' | 'workout' | 'calendar' | 'analytics';

interface M3BottomNavBarProps {
  activeTab: M3TabKey;
  onSelectTab: (tab: M3TabKey) => void;
}

export const M3BottomNavBar: React.FC<M3BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { key: M3TabKey; label: string; icon: any }[] = [
    { key: 'today', label: 'Dzisiaj', icon: CheckSquare },
    { key: 'plans', label: 'Plany', icon: CalendarDays },
    { key: 'workout', label: 'Trening', icon: Dumbbell },
    { key: 'calendar', label: 'Kalendarz', icon: Calendar },
    { key: 'analytics', label: 'Analizy', icon: BarChart3 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-[#171B24]/95 backdrop-blur-md border-t border-[#2C3548] px-2 py-1.5 flex justify-around items-center select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative ${
              isActive ? 'text-[#00E676] font-bold' : 'text-[#94A3B8] hover:text-white font-medium'
            }`}
          >
            {/* Active Indicator Pill (Material 3 style) */}
            <div
              className={`w-12 h-7 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-[#00E676]/20' : 'bg-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E676] stroke-[2.5]' : 'text-[#94A3B8]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
