'use client';

import { usePathname } from 'next/navigation';
import { useAppStore } from '@/components/Providers';

const PAGE_TITLES: Record<string, string> = {
  '/': '📅 Calendário de Escalas',
  '/gerar-escalas': '🪄 Gerador de Escalas Mensal',
  '/automacao': '🤖 Automações de Notificação',
  '/equipe': '👥 Equipe',
  '/configuracoes': '⚙️ Configurações',
};

interface TopbarProps {
  onOpenSidebar: () => void;
  envStatus: { hasToken: boolean; hasChatId: boolean } | null;
}

export function Topbar({ onOpenSidebar, envStatus }: TopbarProps) {
  const pathname = usePathname();
  const { settings } = useAppStore();
  const title = PAGE_TITLES[pathname] || 'Sound Calendar';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0a0b0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center gap-3">
        <button
          id="btn-menu"
          className="lg:hidden w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#9296ab] hover:text-white transition-all"
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <h1 className="text-sm sm:text-base font-bold text-[#f0f1f6]">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {!settings.botToken && !envStatus?.hasToken ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/[0.08] border border-amber-500/20">
            <span>⚠️</span>
            <span className="hidden sm:inline">Configure o Telegram</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/[0.08] border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
            <span className="text-xs font-semibold text-[#22c55e] hidden sm:inline">Bot ativo</span>
          </div>
        )}
      </div>
    </header>
  );
}
