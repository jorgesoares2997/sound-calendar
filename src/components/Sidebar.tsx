'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Zap, Bot, Users, Sliders } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'calendar', label: 'Calendário', href: '/', code: '[CAL]', icon: Calendar },
  { id: 'scale-creator', label: 'Gerador', href: '/gerar-escalas', code: '[GEN]', icon: Zap },
  { id: 'automation', label: 'Automação', href: '/automacao', code: '[ROUT]', icon: Bot },
  { id: 'members', label: 'Equipe', href: '/equipe', code: '[OPS]', icon: Users },
  { id: 'settings', label: 'Ajustes', href: '/configuracoes', code: '[SYS]', icon: Sliders },
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
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col
          bg-bg-surface border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-[10px_0_30px_rgba(0,0,0,0.5)]
        `}
      >
        {/* Rack Ears (Decorative) */}
        <div className="absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-r from-transparent to-white/5" />
        
        {/* Brand/Console Header */}
        <div className="px-6 py-8 flex flex-col gap-4 border-b border-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded bg-bg-surface border border-white/10 flex items-center justify-center text-[10px] font-black text-accent-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                SC
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-primary shadow-[0_0_8px_var(--color-accent-primary)] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-[0.2em] text-white uppercase">
                SC-CONSO
              </span>
              <span className="mono-label text-accent-primary uppercase">v2.0 MESTRE</span>
            </div>
          </div>
          
          <div className="p-3 bg-black/40 border border-white/[0.05] rounded-lg">
            <div className="mono-label text-[10px] mb-1 text-text-muted uppercase">EQUIPE ATIVA</div>
            <div className="text-sm font-bold text-white truncate uppercase tracking-tighter">{teamName || 'SEM_SINAL'}</div>
          </div>
        </div>

        {/* Console Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <div className="mono-label text-[10px] px-3 mb-2 text-text-muted uppercase">ROTEAMENTO / MÓDULOS</div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded border transition-all duration-300
                  ${isActive
                    ? 'bg-white/[0.03] border-white/10 text-white shadow-lg'
                    : 'border-transparent text-text-secondary hover:text-white hover:bg-white/[0.01]'}
                `}
              >
                {/* Active Indicator LED */}
                <div className={`w-1.5 h-4 rounded-full transition-all duration-500 ${isActive ? 'bg-accent-primary shadow-[0_0_10px_var(--color-accent-primary)]' : 'bg-white/5'}`} />
                
                <div className="flex items-center gap-2">
                  <Icon size={14} className={isActive ? 'text-accent-primary' : 'text-text-muted group-hover:text-white'} />
                  <span className="mono-label text-[9px] font-black w-8 text-center transition-transform group-hover:scale-110">{item.code}</span>
                </div>
                
                <span className="text-[11px] font-bold uppercase tracking-wider flex-1">{item.label}</span>
                
                {isActive && (
                  <div className="vu-meter">
                    <div className="vu-bar" style={{ animationDelay: '0s' }} />
                    <div className="vu-bar" style={{ animationDelay: '0.2s' }} />
                    <div className="vu-bar" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / System Status */}
        <div className="p-6 border-t border-white/[0.03] bg-black/20">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="mono-label text-[9px] text-text-muted uppercase">STATUS DO SISTEMA</span>
              <div className="flex gap-1">
                <div className="signal-led signal-led-active" />
                <div className="signal-led signal-led-active" style={{ opacity: 0.5 }} />
                <div className="signal-led" style={{ backgroundColor: '#333' }} />
              </div>
            </div>
            
            <div className="px-3 py-2 bg-telegram/10 border border-telegram/20 rounded flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-telegram animate-pulse shadow-[0_0_5px_var(--color-telegram)]" />
              <span className="mono-label text-[9px] text-telegram font-black uppercase">TLGRM_PRONTO</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


