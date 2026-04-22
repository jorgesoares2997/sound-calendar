'use client';

import type { Member } from '@/types';
import { Users, Radio, Database, Mail, UserCheck, UserMinus, AtSign } from 'lucide-react';

interface MembersProps {
  members: Member[];
  onUpdate: (id: string, changes: Partial<Member>) => void;
}

export function Members({ members, onUpdate }: MembersProps) {
  const active = members.filter((m) => m.active);
  const inactive = members.filter((m) => !m.active);

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-20">
      {/* Module Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Users size={12} className="text-accent-primary" />
          <span className="mono-label text-[10px] text-accent-primary uppercase tracking-widest">BANCO_DADOS_OPERADORES // v4.1</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
          Diretório_de_Equipe
        </h1>
      </div>

      {/* Rack Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { num: members.length, label: 'TOTAL_UNIDADES', color: 'text-white', icon: Database },
          { num: active.length, label: 'LINK_ATIVO', color: 'text-accent-green', icon: UserCheck },
          { num: inactive.length, label: 'MODO_BYPASS', color: 'text-text-muted', icon: UserMinus },
          { num: members.filter((m) => m.telegramId).length, label: 'REMOTO_PRONTO', color: 'text-telegram', icon: Radio },
        ].map((s) => (
          <div key={s.label} className="studio-panel rounded-lg p-5 group hover:border-accent-primary/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className={`text-4xl font-black mono-label ${s.color}`}>{String(s.num).padStart(2, '0')}</div>
              <s.icon size={20} className={s.color} />
            </div>
            <div className="mono-label text-[9px] text-text-muted mt-2 tracking-[0.2em] uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Database Display */}
      <div className="flex flex-col gap-8">
        {active.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="signal-led signal-led-active" />
              <span className="mono-label text-[10px] text-white font-black uppercase tracking-widest">Operadores_Ativos</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {active.map((m) => (
                <MemberCard key={m.id} member={m} onToggle={onUpdate} />
              ))}
            </div>
          </div>
        )}

        {inactive.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 opacity-40">
              <div className="signal-led" style={{ backgroundColor: '#333' }} />
              <span className="mono-label text-[10px] text-text-muted font-black uppercase tracking-widest">Operadores_em_Standby</span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
              {inactive.map((m) => (
                <MemberCard key={m.id} member={m} onToggle={onUpdate} />
              ))}
            </div>
          </div>
        )}
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
    <div className="studio-card rounded-lg p-5 flex flex-col gap-5 relative overflow-hidden group">
      {/* Module Strip */}
      <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: m.color, boxShadow: `0 0 5px ${m.color}` }} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-black/40 border border-white/10 flex items-center justify-center text-base font-black shadow-inner uppercase"
            style={{ color: m.color }}>
            {initials}
          </div>
          <div>
            <div className="text-sm font-black text-white uppercase tracking-tight">{m.name}</div>
            <div className="mono-label text-[9px] text-text-muted uppercase tracking-widest">{m.role.toUpperCase()}</div>
          </div>
        </div>
        
        <button
          onClick={() => onToggle(m.id, { active: !m.active })}
          className={`w-14 h-6 rounded flex items-center px-1 transition-all border ${m.active ? 'bg-accent-green/20 border-accent-green/40' : 'bg-white/5 border-white/10'}`}
        >
          <div className={`w-4 h-4 rounded-sm transition-all ${m.active ? 'translate-x-8 bg-accent-green shadow-[0_0_8px_var(--color-accent-green)]' : 'bg-text-muted'}`} />
          <span className={`absolute ${m.active ? 'left-2' : 'right-2'} mono-label text-[7px] font-black ${m.active ? 'text-accent-green' : 'text-text-muted'}`}>
            {m.active ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      <div className="p-3 bg-black/20 border border-white/[0.03] rounded space-y-2">
        {m.telegramId && (
          <div className="flex items-center gap-3">
            <Radio size={10} className="text-text-muted" />
            <span className="mono-label text-[8px] text-text-muted w-12 uppercase tracking-widest">TLGRM:</span>
            <span className="mono-label text-[10px] text-telegram font-bold uppercase tracking-tighter">@{m.telegramId}</span>
          </div>
        )}
        {m.email && (
          <div className="flex items-center gap-3">
            <AtSign size={10} className="text-text-muted" />
            <span className="mono-label text-[8px] text-text-muted w-12 uppercase tracking-widest">EMAIL:</span>
            <span className="mono-label text-[10px] text-text-secondary truncate uppercase tracking-tighter">{m.email}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1">
          <div className={`signal-led ${m.active ? 'signal-led-active' : ''}`} style={m.active ? { backgroundColor: m.color, boxShadow: `0 0 5px ${m.color}` } : { backgroundColor: '#333' }} />
          <div className="signal-led signal-led-active opacity-20" />
          <div className="signal-led signal-led-active opacity-10" />
        </div>
        <span className="mono-label text-[8px] text-text-muted uppercase tracking-widest">REF_ID: {m.id.slice(0, 8).toUpperCase()}</span>
      </div>
    </div>
  );
}


