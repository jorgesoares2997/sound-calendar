'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/useToast';
import { getEnvConfigStatusAction } from '@/app/actions/telegram';
import { Sidebar } from '@/components/Sidebar';
import { Calendar } from '@/components/Calendar';
import { ScaleCreator } from '@/components/ScaleCreator';
import { Automation } from '@/components/Automation';
import { Members } from '@/components/Members';
import { Settings } from '@/components/Settings';
import { ToastContainer } from '@/components/Toast';
import type { Page } from '@/types';

const PAGE_TITLES: Record<Page, string> = {
  calendar: '📅 Calendário de Escalas',
  'scale-creator': '🪄 Gerador de Escalas Mensal',
  automation: '🤖 Automações de Notificação',
  members: '👥 Equipe',
  settings: '⚙️ Configurações',
};

export function AppShell() {
  const [page, setPage] = useState<Page>('calendar');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [envStatus, setEnvStatus] = useState<{ hasToken: boolean; hasChatId: boolean } | null>(null);
  const { toasts, toast } = useToast();

  useEffect(() => {
    getEnvConfigStatusAction().then(setEnvStatus);
  }, []);

  const {
    members, shifts, settings, setSettings,
    updateMember,
    addShift, addShifts, syncMonthShifts, deleteShift,
  } = useStore();

  return (
    <div className="flex min-h-screen bg-[#0a0b0f] relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-40 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />

      {/* Sidebar */}
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        teamName={settings.teamName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-60">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#0a0b0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              id="btn-menu"
              className="lg:hidden w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#9296ab] hover:text-white transition-all"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <h1 className="text-sm sm:text-base font-bold text-[#f0f1f6]">{PAGE_TITLES[page]}</h1>
          </div>

          <div className="flex items-center gap-2">
            {!settings.botToken && !envStatus?.hasToken ? (
              <button
                id="topbar-setup-telegram"
                onClick={() => setPage('settings')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/[0.08] border border-amber-500/20 hover:bg-amber-500/15 transition-all animate-pulse-glow"
              >
                <span>⚠️</span>
                <span className="hidden sm:inline">Configure o Telegram</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/[0.08] border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
                <span className="text-xs font-semibold text-[#22c55e] hidden sm:inline">Bot ativo</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 relative z-10 transition-all">
          {page === 'calendar' && (
            <Calendar
              shifts={shifts} members={members} settings={settings}
              onAddShift={addShift} onDeleteShift={deleteShift} toast={toast}
            />
          )}
          {page === 'scale-creator' && (
            <ScaleCreator 
              members={members} 
              onSave={(newShifts, yr, mo) => syncMonthShifts(yr, mo, newShifts)} 
              onNavigate={setPage}
              toast={toast} 
            />
          )}
          {page === 'automation' && (
            <Automation toast={toast} />
          )}
          {page === 'members' && (
            <Members
              members={members}
              onUpdate={updateMember}
            />
          )}
          {page === 'settings' && (
            <Settings settings={settings} onSave={setSettings} toast={toast} />
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
