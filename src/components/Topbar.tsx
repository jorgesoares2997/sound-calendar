'use client';

import { usePathname } from 'next/navigation';
import { useAppStore } from '@/components/Providers';
import { Activity, Menu, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Calendário de Escalas',
  '/gerar-escalas': 'Gerador de Escalas Mensal',
  '/automacao': 'Automações de Notificação',
  '/equipe': 'Equipe de Técnicos',
  '/configuracoes': 'Ajustes do Sistema',
};

interface TopbarProps {
  onOpenSidebar: () => void;
  envStatus: { hasToken: boolean; hasChatId: boolean } | null;
}

export function Topbar({ onOpenSidebar, envStatus }: TopbarProps) {
  const pathname = usePathname();
  const { settings } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const title = PAGE_TITLES[pathname] || 'Sound Calendar';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 glass-morphism border-b border-white/5">
      <div className="flex items-center gap-6">
        <button
          id="btn-menu"
          className="lg:hidden w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-accent-primary animate-pulse" />
            <span className="mono-label text-[10px] text-accent-primary uppercase tracking-widest">MÓDULO_ATUAL</span>
          </div>
          <h1 className="text-sm font-black text-white tracking-tight uppercase">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-accent-primary transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          title={theme === 'dark' ? 'Mudar para Modo Luz' : 'Mudar para Modo Escuro'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* System Monitoring (Decorative) */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/5 rounded-lg">
          <div className="flex flex-col items-end">
            <span className="mono-label text-[8px] text-text-muted uppercase tracking-widest">FLUXO_SINAL</span>
            <div className="vu-meter h-2 w-16">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="vu-bar w-1" style={{ 
                  animationDelay: `${i * 0.1}s`,
                  height: '60%',
                  backgroundColor: i > 6 ? 'var(--color-accent-red)' : i > 4 ? 'var(--color-accent-amber)' : 'var(--color-accent-green)'
                }} />
              ))}
            </div>
          </div>
        </div>

        {!settings.botToken && !envStatus?.hasToken ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded bg-accent-amber/5 border border-accent-amber/20">
            <WifiOff size={12} className="text-accent-amber animate-pulse" />
            <span className="mono-label text-[10px] text-accent-amber font-bold hidden sm:inline uppercase">TG_DESCONECTADO</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded bg-accent-green/5 border border-accent-green/20">
            <Wifi size={12} className="text-accent-green" />
            <span className="mono-label text-[10px] text-accent-green font-bold hidden sm:inline uppercase">TG_SINAL_ESTÁVEL</span>
          </div>
        )}
      </div>
    </header>
  );
}


