'use client';

import type { Member } from '@/types';

interface MembersProps {
  members: Member[];
  onUpdate: (id: string, changes: Partial<Member>) => void;
}

export function Members({ members, onUpdate }: MembersProps) {
  const active = members.filter((m) => m.active);
  const inactive = members.filter((m) => !m.active);

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="mb-12">
        <h2 className="text-5xl font-light theme-text-primary tracking-tight">Diretório de Equipe</h2>
        <p className="text-lg theme-text-secondary mt-3 max-w-2xl font-medium">
          Conecte-se com os criadores, arquitetos e diretores por trás do ecossistema Sound Calendar.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div>
            <p className="text-[10px] font-bold theme-text-secondary uppercase tracking-widest">Total no Estúdio</p>
            <p className="text-xl font-bold theme-text-primary">{members.length} Membros</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
            <span className="material-symbols-outlined">pulse_alert</span>
          </div>
          <div>
            <p className="text-[10px] font-bold theme-text-secondary uppercase tracking-widest">Ativos Agora</p>
            <p className="text-xl font-bold theme-text-primary">{active.length} Online</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-tertiary/10 flex items-center justify-center text-accent-tertiary">
            <span className="material-symbols-outlined">hub</span>
          </div>
          <div>
            <p className="text-[10px] font-bold theme-text-secondary uppercase tracking-widest">Em Standby</p>
            <p className="text-xl font-bold theme-text-primary">{inactive.length} Unidades</p>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((m) => (
          <MemberCard key={m.id} member={m} onToggle={onUpdate} />
        ))}
        
        {/* Add Member Placeholder */}
        <div className="border-2 border-dashed theme-border p-8 rounded-[32px] flex flex-col items-center justify-center text-center group hover:border-accent-primary/40 transition-all cursor-pointer min-h-[320px]">
          <div className="w-16 h-16 rounded-full theme-surface flex items-center justify-center mb-4 group-hover:bg-accent-primary/5 transition-colors">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-accent-primary transition-colors">person_add</span>
          </div>
          <h3 className="text-lg font-bold theme-text-primary">Adicionar Membro</h3>
          <p className="text-xs theme-text-muted font-medium mt-2">Convide novos talentos para o estúdio</p>
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member: m, onToggle }: {
  member: Member;
  onToggle: (id: string, changes: Partial<Member>) => void;
}) {
  const initials = m.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return (
    <div className={`glass-card p-8 rounded-[32px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lift group flex flex-col ${!m.active ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="relative">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lift uppercase"
            style={{ backgroundColor: m.color }}
          >
            {initials}
          </div>
          {m.active && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />}
        </div>
        <button 
          onClick={() => onToggle(m.id, { active: !m.active })}
          className={`p-2 rounded-xl transition-all ${m.active ? 'text-accent-primary hover:bg-accent-primary/5' : 'text-slate-400 hover:bg-slate-100'}`}
        >
          <span className="material-symbols-outlined">{m.active ? 'person_check' : 'person_off'}</span>
        </button>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold theme-text-primary mb-1 tracking-tight">{m.name}</h3>
        <p className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-4">{m.role}</p>
        
        <div className="space-y-3">
          {m.telegramId && (
            <div className="flex items-center gap-2 theme-text-muted">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span className="text-xs font-semibold tracking-tight">@{m.telegramId}</span>
            </div>
          )}
          {m.email && (
            <div className="flex items-center gap-2 theme-text-muted">
              <span className="material-symbols-outlined text-[18px]">alternate_email</span>
              <span className="text-xs font-semibold tracking-tight lowercase">{m.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button className="flex-1 py-2.5 rounded-xl theme-surface theme-text-secondary text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-colors">
          Perfil Completo
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors">
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
}
