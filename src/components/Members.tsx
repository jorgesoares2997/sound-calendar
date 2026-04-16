'use client';

import { useState } from 'react';
import type { Member } from '@/types';

interface MembersProps {
  members: Member[];
  onUpdate: (id: string, changes: Partial<Member>) => void;
}

export function Members({ members, onUpdate }: MembersProps) {
  const active = members.filter((m) => m.active);
  const inactive = members.filter((m) => !m.active);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent leading-tight">
            👥 Equipe de Técnicos
          </h1>
          <p className="text-sm text-[#5a5f75] mt-1 pr-4">
            Base de dados gerida via <code className="bg-white/5 px-1.5 py-0.5 rounded text-violet-300">members.json</code>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { num: members.length, label: 'Total', color: 'text-[#f0f1f6]' },
          { num: active.length, label: 'Ativos', color: 'text-[#22c55e]' },
          { num: inactive.length, label: 'Inativos', color: 'text-[#5a5f75]' },
          { num: members.filter((m) => m.telegramId).length, label: 'Com Telegram', color: 'text-[#229ED9]' },
        ].map((s) => (
          <div key={s.label} className="bg-[#161821] border border-white/[0.06] rounded-2xl p-4 hover:border-white/10 transition-colors">
            <div className={`text-3xl font-black font-mono ${s.color}`}>{s.num}</div>
            <div className="text-xs font-bold text-[#5a5f75] uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Empty */}
      {members.length === 0 && (
        <div className="flex flex-col items-center gap-4 text-center py-16 bg-[#161821] border border-dashed border-white/10 rounded-3xl">
          <div className="text-6xl animate-float">👤</div>
          <h3 className="text-xl font-bold text-[#f0f1f6]">Nenhum membro ainda</h3>
          <p className="text-sm text-[#9296ab] max-w-sm">
            Adicione os membros para poder escalar e enviar lembretes.
          </p>
          <button disabled
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 text-[#5a5f75] border border-white/10 cursor-not-allowed">
            Gestão Manual (JSON)
          </button>
        </div>
      )}

      {/* Active members */}
      {active.length > 0 && (
        <div className="flex flex-col gap-4">
          <SectionTitle dot="active" label="Membros Ativos" count={active.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((m) => (
              <MemberCard key={m.id} member={m} onToggle={onUpdate} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive members */}
      {inactive.length > 0 && (
        <div className="flex flex-col gap-4">
          <SectionTitle dot="inactive" label="Inativos" count={inactive.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {inactive.map((m) => (
              <MemberCard key={m.id} member={m} onToggle={onUpdate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MemberCard ──────────────────────────────────────────
function MemberCard({ member: m, onToggle }: {
  member: Member;
  onToggle: (id: string, changes: Partial<Member>) => void;
}) {
  const initials = m.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return (
    <div className="bg-[#161821] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-xl transition-all relative overflow-hidden">
      {/* Color bar top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-70" style={{ background: m.color }} />

      <div className="flex items-start justify-between">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-extrabold border-2"
            style={{ background: `${m.color}22`, borderColor: `${m.color}55`, color: m.color }}>
            {initials}
          </div>
          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#161821] ${m.active ? 'bg-[#22c55e]' : 'bg-[#5a5f75]'}`}
            style={m.active ? { boxShadow: '0 0 6px rgba(34,197,94,0.6)' } : {}} />
        </div>
      </div>

      <div>
        <div className="text-base font-bold text-[#f0f1f6]">{m.name}</div>
        <div className="text-xs text-[#5a5f75] font-semibold uppercase tracking-wider mt-0.5">{m.role}</div>
      </div>

      <div className="flex flex-col gap-2 bg-[#111219]/50 rounded-xl p-3 border border-white/[0.03]">
        {m.telegramId && (
          <div className="flex items-center gap-2 text-[11px] text-[#229ED9] font-mono">
            <span className="opacity-70">✈️</span> {m.telegramId}
          </div>
        )}
        {m.email && (
          <div className="flex items-center gap-2 text-[11px] text-[#9296ab] font-mono">
            <span className="opacity-70">📧</span> {m.email}
          </div>
        )}
        {m.phone && (
          <div className="flex items-center gap-2 text-[11px] text-[#9296ab] font-mono">
            <span className="opacity-70">📞</span> {m.phone}
          </div>
        )}
      </div>

      <div className="pt-1 flex items-center gap-2.5">
        <button
          role="switch"
          aria-checked={m.active}
          onClick={() => onToggle(m.id, { active: !m.active })}
          className={`relative w-9 h-5 rounded-full border transition-all ${m.active ? 'bg-green-500/20 border-green-500/50' : 'bg-white/[0.04] border-white/[0.08]'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${m.active ? 'left-[18px] bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'left-0.5 bg-[#5a5f75]'}`} />
        </button>
        <span className={`text-xs font-semibold ${m.active ? 'text-[#22c55e]' : 'text-[#5a5f75]'}`}>
          {m.active ? 'Ativo' : 'Inativo'}
        </span>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────
function SectionTitle({ dot, label, count }: { dot: 'active' | 'inactive'; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-[#9296ab] uppercase tracking-widest">
      <span className={`w-2 h-2 rounded-full ${dot === 'active' ? 'bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-[#5a5f75]'}`} />
      {label}
      <span className="ml-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px]">{count}</span>
    </div>
  );
}
