import { QrCode, Sun, Moon, Settings } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export default function Header({ isDark, onToggleTheme, onOpenSettings }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 border-b-[3px] border-black"
      style={{ background: isDark ? '#111' : '#0a0a0a' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center border-[2px] border-white"
            style={{ background: '#f5c518', boxShadow: '2px 2px 0 rgba(255,255,255,0.3)' }}
          >
            <QrCode size={18} color="#000" strokeWidth={2.5} />
          </div>
          <span
            className="text-white text-2xl tracking-[3px]"
            style={{ fontFamily: '"Bebas Neue", sans-serif' }}
          >
            QR GENERATOR
          </span>
          <span
            className="hidden sm:inline tag bg-[#f5c518] text-black border-yellow-600 ml-1"
            style={{ fontSize: 9 }}
          >
            v1.0
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile settings button */}
          <button
            onClick={onOpenSettings}
            className="lg:hidden flex items-center gap-1.5 text-white border-[2px] border-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            <Settings size={12} />
            Settings
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center border-[2px] border-white text-white hover:bg-white hover:text-black transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
