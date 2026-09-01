'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAppStore } from '@/components/Providers';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';

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
  const { members } = useAppStore();
  const { currentUser, setCurrentUser } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className="w-full h-16 sticky top-0 backdrop-blur-xl border-b theme-border flex justify-between items-center px-6 lg:px-12 z-40 shadow-sm transition-colors duration-300"
      style={{
        backgroundColor: (mounted && currentUser) ? `${currentUser.color}08` : 'var(--color-bg-card-solid)',
        borderBottomColor: (mounted && currentUser) ? `${currentUser.color}30` : undefined,
      }}
    >
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
        {mounted && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 theme-surface p-1.5 px-3 rounded-full border theme-border hover:bg-[var(--color-bg-surface)] transition-all"
            >
              {currentUser ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: currentUser.color }}
                  />
                  <span className="text-sm font-medium theme-text-primary hidden sm:inline-block">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-xs theme-text-muted hidden sm:inline-block border-l theme-border pl-2">
                    {currentUser.role || 'Sem Função'}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-sm font-medium theme-text-primary hidden sm:inline-block">Selecionar Perfil</span>
                </>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 theme-card-solid backdrop-blur-md rounded-xl shadow-lg border theme-border overflow-hidden animate-fade-in z-50">
                <div className="p-2 space-y-1">
                  {members.filter(m => m.active).map(member => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setCurrentUser(member);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all
                        ${currentUser?.id === member.id ? 'bg-accent-primary/10 text-accent-primary font-medium' : 'theme-text-primary hover:bg-[var(--color-bg-surface)]'}
                      `}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                      />
                      <div className="truncate">
                        <div>{member.name}</div>
                        <div className="text-xs opacity-70">{member.accessLevel || 'basic'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 theme-surface p-1 rounded-full border theme-border">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
