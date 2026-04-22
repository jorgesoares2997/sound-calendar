'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { id: 'calendar', label: 'Calendário', href: '/', icon: 'calendar_today' },
  { id: 'scale-creator', label: 'Gerador', href: '/gerar-escalas', icon: 'auto_awesome' },
  { id: 'members', label: 'Equipe', href: '/equipe', icon: 'group' },
  { id: 'automation', label: 'Automação', href: '/automacao', icon: 'flowsheet' },
  { id: 'settings', label: 'Ajustes', href: '/configuracoes', icon: 'settings' },
];

interface SidebarProps {
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ teamName, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 theme-overlay-soft backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col
          theme-card-solid backdrop-blur-2xl border-r theme-border
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-[20px_0_40px_-15px_rgba(0,0,0,0.03)] p-6 space-y-8
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white shadow-lift">
            <span className="material-symbols-outlined">graphic_eq</span>
          </div>
          <div>
            <h1 className="text-lg font-bold theme-text-primary tracking-tight">Sound Calendar</h1>
            <p className="text-[10px] font-semibold theme-text-secondary uppercase tracking-widest">Studio_Rhythm</p>
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href="/gerar-escalas"
          className="w-full bg-accent-primary text-white py-3 px-4 rounded-xl font-medium shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
        >
          <span className="material-symbols-outlined text-sm transition-transform group-hover:rotate-90">add</span>
          Nova Escala
        </Link>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 scale-100 active:scale-[0.98]
                  ${isActive
                    ? 'theme-surface text-accent-primary shadow-sm font-semibold'
                    : 'theme-text-secondary hover:bg-[var(--color-bg-surface)]'}
                `}
              >
                <span 
                  className="material-symbols-outlined" 
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* System Info */}
        <div className="pt-6 border-t theme-border">
          <div className="flex items-center gap-3 px-4 py-3 theme-text-muted">
            <span className="material-symbols-outlined text-sm">database</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-wider">Equipe_Ativa</span>
              <span className="text-xs theme-text-secondary font-bold truncate w-32">{teamName || 'SEM_SINAL'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


