import React, { useState } from 'react';
import { X, Sparkles, Zap, Shield, Eye, Check, ExternalLink, Compass, Smartphone, Sun } from 'lucide-react';
import { AppThemeMode } from './ThemeSelector';

interface VisualShowcaseModalProps {
  onClose: () => void;
  onApplyTheme: (theme: AppThemeMode) => void;
}

export const VisualShowcaseModal: React.FC<VisualShowcaseModalProps> = ({ onClose, onApplyTheme }) => {
  const [selectedStyle, setSelectedStyle] = useState<AppThemeMode>('chrome_ios_dark');

  const styles = [
    {
      id: 'chrome_ios_dark' as AppThemeMode,
      title: '1. Google Chrome iOS Dark (Najbardziej polecany)',
      subtitle: 'Dolna Pigułka Omnibox + Kafelki Speed Dial + Google Blue #4285F4',
      badge: 'Styl Google Chrome iOS',
      badgeColor: 'bg-[#4285F4]/20 text-[#8AB4F8] border-[#4285F4]/60',
      svgPath: '/mockup_chrome_ios_dark.svg',
      description: 'Ikoniczny interfejs Google Chrome z iOS. Dolny pływający pasek nawigacji ze strzałkami, centralną pigułką aktywnego treningu, licznikiem serii w ikonie kart [4] oraz kafelkami skrótów Speed Dial.',
      colors: [
        { name: 'Chrome Dark', hex: '#1F2023' },
        { name: 'Google Blue', hex: '#4285F4' },
        { name: 'Card Surface', hex: '#282A2F' },
        { name: 'Google Green', hex: '#34A853' }
      ],
      icon: Compass
    },
    {
      id: 'chrome_ios_oled' as AppThemeMode,
      title: '2. Google Chrome iOS OLED Fusion',
      subtitle: 'Prawdziwa Czerń #000000 + Pigułka Omnibox Chrome + 4 Barwy Google',
      badge: 'Chrome + AMOLED Xiaomi 14T',
      badgeColor: 'bg-[#4285F4]/20 text-[#4285F4] border-[#4285F4]/60',
      svgPath: '/mockup_chrome_ios_oled.svg',
      description: 'Połączenie pigułki i wygody Chrome z iOS z bezkompromisową czernią OLED (0% zużycia baterii) oraz kolorowymi akcentami Google do oznaczania postępu serii.',
      colors: [
        { name: 'Pitch Black', hex: '#000000' },
        { name: 'Google Blue', hex: '#4285F4' },
        { name: 'Google Yellow', hex: '#FBBC04' },
        { name: 'Google Red', hex: '#EA4335' }
      ],
      icon: Smartphone
    },
    {
      id: 'chrome_ios_light' as AppThemeMode,
      title: '3. Google Chrome iOS Pure Clean',
      subtitle: 'Czysta Biel #FFFFFF + Alabaster #F1F3F4 + Błękit Google #1A73E8',
      badge: 'Jasny Styl Apple/Chrome',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      svgPath: '/mockup_chrome_ios_light.svg',
      description: 'Klasyczny, przejrzysty, jasny motyw Chrome z iPhone. Płynne cienie iOS, śnieżnobiałe karty i perfekcyjna widoczność nawet w pełnym słońcu.',
      colors: [
        { name: 'Pure White', hex: '#FFFFFF' },
        { name: 'Google Blue', hex: '#1A73E8' },
        { name: 'Light Gray', hex: '#F1F3F4' },
        { name: 'Text Dark', hex: '#202124' }
      ],
      icon: Sun
    },
    {
      id: 'cyber_oled' as AppThemeMode,
      title: '4. Cyber-OLED Stealth',
      subtitle: 'True Black #000000 + Neon Lime #00FF87',
      badge: 'Sportowa Telemetria',
      badgeColor: 'bg-[#00FF87]/20 text-[#00FF87] border-[#00FF87]/50',
      svgPath: '/mockup_cyber_oled.svg',
      description: 'Zaprojektowany specjalnie pod matrycę AMOLED 144Hz. Czyste czarne piksele pobierają 0% energii, a laserowe akcenty gwarantują doskonałą czytelność pod ostrym oświetleniem siłowni.',
      colors: [
        { name: 'OLED Black', hex: '#000000' },
        { name: 'Neon Lime', hex: '#00FF87' },
        { name: 'Laser Cyan', hex: '#00E5FF' },
        { name: 'Border Slate', hex: '#1E2738' }
      ],
      icon: Zap
    },
    {
      id: 'titanium_slate' as AppThemeMode,
      title: '5. Titanium Nordic Slate',
      subtitle: 'Industrialny Tytan #161A20 + Miedź #FF5722',
      badge: 'Ciężki Trening Siłowy',
      badgeColor: 'bg-[#FF5722]/20 text-[#FF5722] border-[#FF5722]/50',
      svgPath: '/mockup_titanium_slate.svg',
      description: 'Surowy, techniczny klimat prawdziwego żelastwa, klatek Power Rack i tytanowych wykończeń. Ciemny grafit połączony z dynamicznym, płonącym miedzianym akcentem.',
      colors: [
        { name: 'Gunmetal', hex: '#161A20' },
        { name: 'Burnt Copper', hex: '#FF5722' },
        { name: 'Steel Blue', hex: '#8892B0' },
        { name: 'Dark Plate', hex: '#252C36' }
      ],
      icon: Shield
    },
    {
      id: 'frosted_obsidian' as AppThemeMode,
      title: '6. Frosted Obsidian',
      subtitle: 'Ciemne Szkło + Jadeit #10B981 & Indygo',
      badge: 'Nowoczesny M3 Glass',
      badgeColor: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50',
      svgPath: '/mockup_frosted_obsidian.svg',
      description: 'Warstwowe ciemne matowe szkło, organiczne zaokrąglenia i miękkie rozmycia (frosted blur). Płynne, eleganckie przejścia i wysoka ergonomia dotykowa.',
      colors: [
        { name: 'Obsidian Deep', hex: '#04060C' },
        { name: 'Jade Mint', hex: '#10B981' },
        { name: 'Electric Indigo', hex: '#6366F1' },
        { name: 'Glass Card', hex: '#24314A' }
      ],
      icon: Sparkles
    },
    {
      id: 'monochrome_acid' as AppThemeMode,
      title: '7. Swiss Monochrome & Acid Volt',
      subtitle: 'Minimalizm Typograficzny + Acid #CCFF00',
      badge: 'Ultra-Minimalizm',
      badgeColor: 'bg-[#CCFF00]/20 text-[#CCFF00] border-[#CCFF00]/50',
      svgPath: '/mockup_acid_volt.svg',
      description: 'Zero zbędnych ozdobników. Wielkie, czytelne liczby, styl szwajcarskich plakatów i systemów telemetrii Whoop/Apple Fitness z jaskrawym kwasowym akcentem.',
      colors: [
        { name: 'Pitch Dark', hex: '#0D0E11' },
        { name: 'Acid Volt', hex: '#CCFF00' },
        { name: 'Card Dark', hex: '#14161B' },
        { name: 'Muted Text', hex: '#717684' }
      ],
      icon: Eye
    }
  ];

  const current = styles.find((s) => s.id === selectedStyle) || styles[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0A0D14] border border-[#20293A] rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#20293A] flex items-center justify-between bg-[#111724]/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Studio Wizualizacji UI — PlanPasika.v1
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-mono">
                  7 Stylów (w tym Chrome iOS)
                </span>
              </h2>
              <p className="text-[11px] text-[#8892B0]">
                Wizualizacje na pełnym ekranie smartfona Xiaomi 14T (AMOLED 1.5K 144Hz)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8892B0] hover:text-white hover:bg-[#1E2738] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Selector Tabs */}
        <div className="bg-[#0E131F] border-b border-[#20293A] px-4 py-2 flex gap-2 overflow-x-auto">
          {styles.map((style) => {
            const Icon = style.icon;
            const isSel = style.id === selectedStyle;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSel
                    ? 'bg-[#182234] text-white border-cyan-500/60 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                    : 'bg-[#0A0D14] text-[#717E94] border-[#1C2536] hover:text-white hover:border-[#2C384E]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-cyan-400' : 'text-[#64748B]'}`} />
                <span>{style.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body: Left Mockup preview + Right Specs */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Vector Smartphone Mockup (5 cols) */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-[320px] rounded-[36px] overflow-hidden shadow-2xl border border-[#20293A] bg-black">
              <img
                src={current.svgPath}
                alt={current.title}
                className="w-full h-auto block select-none"
              />
            </div>
            <a
              href={current.svgPath}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Otwórz grafikę wektorową w pełnej rozdzielczości
            </a>
          </div>

          {/* Right: Detailed Specification & Color Tokens (7 cols) */}
          <div className="md:col-span-6 lg:col-span-7 space-y-4">
            <div>
              <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border mb-2 ${current.badgeColor}`}>
                {current.badge}
              </span>
              <h3 className="text-xl font-extrabold text-white">{current.title}</h3>
              <p className="text-xs text-cyan-400 font-mono mt-0.5">{current.subtitle}</p>
              <p className="text-xs text-[#94A3B8] leading-relaxed mt-2.5">
                {current.description}
              </p>
            </div>

            {/* Color Palette Tokens */}
            <div className="bg-[#0E131F] border border-[#20293A] rounded-2xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Główne Kolory i Tokeny Stylu:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {current.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-[#070A10] p-2 rounded-xl border border-[#1C2536]">
                    <span
                      className="w-6 h-6 rounded-lg border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div>
                      <p className="text-[11px] font-bold text-white">{c.name}</p>
                      <p className="text-[10px] font-mono text-[#717E94]">{c.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ergonomics & Screen Highlights */}
            <div className="bg-[#0E131F] border border-[#20293A] rounded-2xl p-4 space-y-2 text-xs text-[#94A3B8]">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Dopasowanie do Xiaomi 14T (HyperOS / Android 14):
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-[11px]">
                <li><strong className="text-white">Ekran AMOLED:</strong> Gwarancja idealnego kontrastu i czytelności na siłowni bez odblasków.</li>
                <li><strong className="text-white">Stoper Odpoczynku:</strong> Wyraźny timer z dużym paskiem postępu i fizyczną wibracją po zakończeniu.</li>
                <li><strong className="text-white">Duże cele dotykowe:</strong> Przyciski serii min. 48–56dp, łatwe do kliknięcia spoconą dłonią.</li>
                <li><strong className="text-white">Pasek tygodnia:</strong> Stały, kompaktowy podgląd rotacji planu bez konieczności przewijania.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  onApplyTheme(current.id);
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Zastosuj ten motyw w aplikacji
              </button>

              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-[#141B28] hover:bg-[#1E2738] text-[#94A3B8] hover:text-white text-xs font-semibold border border-[#20293A] transition-colors"
              >
                Zamknij podgląd
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
