'use client';

import type { Page } from '@/types';

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'calendar', label: 'Calendário', icon: '📅' },
  { id: 'members', label: 'Membros', icon: '👥' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activePage, onNavigate, teamName, isOpen, onClose }: SidebarProps) {
  const handleNavigate = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-60 flex flex-col
          bg-[#111219] border-r border-white/[0.06] transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-5 border-b border-white/[0.06]">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-xl shadow-lg animate-pulse-glow flex-shrink-0">
            🎛️
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              Sound Calendar
            </span>
            <span className="text-xs text-[#5a5f75] font-medium truncate">{teamName || 'Sound Team'}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3 pt-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleNavigate(item.id)}
              className={`
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 w-full text-left relative
                ${activePage === item.id
                  ? 'bg-violet-600/15 text-purple-400'
                  : 'text-[#9296ab] hover:bg-white/[0.04] hover:text-[#f0f1f6]'}
              `}
            >
              <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {activePage === item.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3 border-t border-white/[0.06] mt-auto">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/20">
            <span className="text-base">✈️</span>
            <span className="text-xs font-semibold text-[#229ED9]">Telegram Bot</span>
          </div>
        </div>
      </aside>
    </>
  );
}
