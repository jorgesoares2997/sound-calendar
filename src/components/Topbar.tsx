'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Calendário de Escalas',
  '/gerar-escalas': 'Gerador de Escalas',
  '/automacao': 'Central de Automação',
  '/equipe': 'Diretório de Equipe',
  '/configuracoes': 'Ajustes do Sistema',
};

interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'Sound Calendar';

  return (
    <header className="w-full h-16 sticky top-0 backdrop-blur-xl border-b theme-border flex justify-between items-center px-6 lg:px-12 z-40 shadow-sm theme-card-solid">
      <div className="flex items-center gap-4 lg:gap-6">
        <button
          id="btn-menu"
          className="lg:hidden p-2 rounded-xl theme-text-secondary hover:bg-[var(--color-bg-surface)] transition-all -ml-2"
          onClick={onOpenSidebar}
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white shadow-lift">
            <span className="material-symbols-outlined text-sm">graphic_eq</span>
          </div>
          <span className="font-bold theme-text-primary text-sm tracking-tight truncate max-w-[120px] sm:max-w-none">Sound Calendar</span>
        </div>

        <h2 className="hidden lg:block text-sm font-bold theme-text-muted uppercase tracking-widest">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 theme-surface p-1 rounded-full border theme-border">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
