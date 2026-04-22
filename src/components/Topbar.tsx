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
    <header className="w-full h-16 sticky top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center px-6 lg:px-12 z-40 shadow-sm shadow-slate-200/20">
      <div className="flex items-center gap-6">
        <button
          id="btn-menu"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          onClick={onOpenSidebar}
        >
          <Menu size={20} />
        </button>
        
        <h2 className="hidden sm:block text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tema</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
