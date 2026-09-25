import React from 'react';
import { Palette, Sparkles, Zap, Shield, Eye, Smartphone, Compass } from 'lucide-react';

export type AppThemeMode =
  | 'chrome_ios_dark'
  | 'chrome_ios_oled'
  | 'chrome_ios_light'
  | 'cyber_oled'
  | 'titanium_slate'
  | 'frosted_obsidian'
  | 'monochrome_acid';

interface ThemeSelectorProps {
  activeTheme: AppThemeMode;
  onSelectTheme: (theme: AppThemeMode) => void;
  onOpenVisuals: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ activeTheme, onSelectTheme, onOpenVisuals }) => {
  const themes: { id: AppThemeMode; label: string; dotColor: string; bgBadge: string; icon: any }[] = [
    {
      id: 'chrome_ios_dark',
      label: 'Chrome iOS Dark',
      dotColor: 'bg-[#4285F4]',
      bgBadge: 'border-[#4285F4]/60 text-[#8AB4F8]',
      icon: Compass
    },
    {
      id: 'chrome_ios_oled',
      label: 'Chrome OLED',
      dotColor: 'bg-[#4285F4]',
      bgBadge: 'border-[#4285F4]/60 text-[#4285F4]',
      icon: Smartphone
    },
    {
      id: 'chrome_ios_light',
      label: 'Chrome iOS Light',
      dotColor: 'bg-[#1A73E8]',
      bgBadge: 'border-[#1A73E8]/60 text-[#1A73E8] bg-white/10',
      icon: Compass
    },
    {
      id: 'cyber_oled',
      label: 'Cyber OLED',
      dotColor: 'bg-[#00FF87]',
      bgBadge: 'border-[#00FF87]/40 text-[#00FF87]',
      icon: Zap
    },
    {
      id: 'titanium_slate',
      label: 'Titanium',
      dotColor: 'bg-[#FF5722]',
      bgBadge: 'border-[#FF5722]/40 text-[#FF5722]',
      icon: Shield
    },
    {
      id: 'frosted_obsidian',
      label: 'Frosted M3',
      dotColor: 'bg-[#10B981]',
      bgBadge: 'border-[#10B981]/40 text-[#10B981]',
      icon: Sparkles
    },
    {
      id: 'monochrome_acid',
      label: 'Acid Volt',
      dotColor: 'bg-[#CCFF00]',
      bgBadge: 'border-[#CCFF00]/40 text-[#CCFF00]',
      icon: Eye
    }
  ];

  return (
    <div className="bg-[#0A0D14] border-b border-[#2C384E]/80 px-3 py-2">
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
          <Palette className="w-3 h-3 text-cyan-400" />
          <span>Wybór motywu (w tym Chrome iOS):</span>
        </div>
        <button
          onClick={onOpenVisuals}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/50 text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
        >
          <Sparkles className="w-3 h-3 text-blue-400" />
          Otwórz Wizualizacje UI (Wszystkie 7)
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {themes.map((t) => {
          const isActive = activeTheme === t.id;
          const IconComponent = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTheme(t.id)}
              className={`py-1 px-2.5 rounded-xl border text-center flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? `bg-[#1F2736] ${t.bgBadge} shadow-md border-2 font-bold scale-[1.02]`
                  : 'bg-[#0F1218] border-[#2C384E]/60 text-[#64748B] hover:text-white hover:border-[#2C384E]'
              }`}
            >
              <IconComponent className="w-3 h-3" />
              <span className={`w-1.5 h-1.5 rounded-full ${t.dotColor}`} />
              <span className="text-[10px]">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
