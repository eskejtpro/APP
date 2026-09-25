import React from 'react';
import { Settings, Shield, HardDrive, Smartphone, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-[#181E29] border border-[#2C384E] rounded-2xl p-4 shadow-lg space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Ustawienia PlanPasika.v1
        </h2>

        {/* Device profile */}
        <div className="bg-[#0F1218] border border-[#2C384E] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-xs font-semibold text-white">Profil urządzenia</p>
              <p className="text-[10px] text-[#94A3B8]">Xiaomi 14T (144Hz AMOLED, Dark Mode)</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
            Zoptymalizowano
          </span>
        </div>

        {/* Database & Privacy */}
        <div className="bg-[#0F1218] border border-[#2C384E] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-white">Lokalna baza danych</p>
              <p className="text-[10px] text-[#94A3B8]">Android Room (SQLite) • 100% Offline</p>
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 font-semibold">Wersja 1</span>
        </div>

        {/* Zero cloud badge */}
        <div className="bg-[#0F1218] border border-[#2C384E] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs font-semibold text-white">Prywatność i brak chmury</p>
              <p className="text-[10px] text-[#94A3B8]">Brak logowania, brak serwerów, brak analityki</p>
            </div>
          </div>
          <span className="text-[10px] bg-[#1F2736] text-[#94A3B8] px-2 py-0.5 rounded border border-[#2C384E]">
            Bezpieczne
          </span>
        </div>
      </div>

      {/* Backup Preview Banner */}
      <div className="bg-[#181E29] border border-cyan-500/30 rounded-2xl p-4 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
          <HardDrive className="w-4 h-4" />
          Kopia zapasowa bazy danych (Faza 4)
        </div>
        <p className="text-xs text-[#94A3B8]">
          Eksport i import pliku kopii <code className="text-white">.bak</code> z telefonu przez Storage Access Framework bez konieczności połączenia z internetem.
        </p>
      </div>
    </div>
  );
};
