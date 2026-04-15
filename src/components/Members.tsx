'use client';

import { useState } from 'react';
import type { Member } from '@/types';

const ROLES = [
  'Líder de Som', 'Operador de Som', 'Técnico de Palco',
  'Músico', 'Vocal', 'Multimídia', 'Iluminação', 'Voluntário',
];

const COLORS = [
  '#7c3aed', '#a855f7', '#06b6d4', '#22c55e',
  '#f59e0b', '#ef4444', '#ec4899', '#f97316',
  '#14b8a6', '#6366f1', '#84cc16', '#e879f9',
];

interface MembersProps {
  members: Member[];
  onAdd: (m: Omit<Member, 'id'>) => void;
  onUpdate: (id: string, changes: Partial<Member>) => void;
  onDelete: (id: string) => void;
  toast: { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void };
}

export function Members({ members, onAdd, onUpdate, onDelete, toast }: MembersProps) {
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);

  const handleEdit = (m: Member) => { setEditMember(m); setShowModal(true); };
  const handleSave = (data: Omit<Member, 'id'>) => {
    if (editMember) { onUpdate(editMember.id, data); toast.success('Membro atualizado! ✅'); }
    else { onAdd(data); toast.success('Membro adicionado! ✅'); }
    setShowModal(false); setEditMember(null);
  };
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Remover ${name} da equipe?`)) { onDelete(id); toast.info(`${name} removido.`); }
  };

  const active = members.filter((m) => m.active);
  const inactive = members.filter((m) => !m.active);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent leading-tight">
            👥 Membros da Equipe
          </h1>
          <p className="text-sm text-[#5a5f75] mt-1">Gerencie quem está na sua equipe de som</p>
        </div>
        <button id="btn-add-member" onClick={() => { setEditMember(null); setShowModal(true); }}
          className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:brightness-110 active:scale-95 transition-all flex-shrink-0">
          + Novo Membro
        </button>
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
          <button onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:brightness-110 transition-all">
            + Adicionar Primeiro Membro
          </button>
        </div>
      )}

      {/* Active members */}
      {active.length > 0 && (
        <div className="flex flex-col gap-4">
          <SectionTitle dot="active" label="Membros Ativos" count={active.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((m) => (
              <MemberCard key={m.id} member={m} onEdit={handleEdit} onDelete={handleDelete} onToggle={onUpdate} />
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
              <MemberCard key={m.id} member={m} onEdit={handleEdit} onDelete={handleDelete} onToggle={onUpdate} />
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <MemberModal
          member={editMember}
          onClose={() => { setShowModal(false); setEditMember(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── MemberCard ──────────────────────────────────────────
function MemberCard({ member: m, onEdit, onDelete, onToggle }: {
  member: Member;
  onEdit: (m: Member) => void;
  onDelete: (id: string, name: string) => void;
  onToggle: (id: string, changes: Partial<Member>) => void;
}) {
  const initials = m.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return (
    <div className="bg-[#161821] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-xl transition-all relative overflow-hidden">
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
        {/* Actions */}
        <div className="flex gap-1.5">
          <button id={`edit-${m.id}`} onClick={() => onEdit(m)}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#9296ab] hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center text-sm">
            ✏️
          </button>
          <button id={`delete-${m.id}`} onClick={() => onDelete(m.id, m.name)}
            className="w-8 h-8 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center text-sm">
            🗑️
          </button>
        </div>
      </div>

      <div>
        <div className="text-base font-bold text-[#f0f1f6]">{m.name}</div>
        <div className="text-xs text-[#5a5f75] mt-0.5">{m.role}</div>
      </div>

      {m.telegramId
        ? <div className="flex items-center gap-1.5 text-xs text-[#229ED9] font-mono">✈️ {m.telegramId}</div>
        : <div className="text-xs text-[#5a5f75] italic">Sem Telegram configurado</div>
      }

      <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2.5">
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

// ─── MemberModal ─────────────────────────────────────────
function MemberModal({ member, onClose, onSave }: {
  member: Member | null;
  onClose: () => void;
  onSave: (data: Omit<Member, 'id'>) => void;
}) {
  const [form, setForm] = useState({
    name: member?.name ?? '',
    role: member?.role ?? ROLES[0],
    telegramId: member?.telegramId ?? '',
    color: member?.color ?? COLORS[0],
    active: member?.active ?? true,
  });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}>
      <div className="bg-[#161821] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#f0f1f6]">{member ? '✏️ Editar Membro' : '👤 Novo Membro'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#9296ab] hover:text-white transition-all flex items-center justify-center text-sm">✕</button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) onSave(form); }}>
          <Field label="Nome">
            <input id="member-name" className={inputCls} placeholder="Nome completo" value={form.name}
              onChange={(e) => set('name', e.target.value)} required autoFocus />
          </Field>

          <Field label="Função">
            <select id="member-role" className={inputCls} value={form.role} onChange={(e) => set('role', e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          <Field label="Telegram ID / Username (opcional)">
            <input id="member-telegram" className={inputCls} placeholder="@username ou chat_id numérico"
              value={form.telegramId} onChange={(e) => set('telegramId', e.target.value)} />
          </Field>

          <Field label="Cor de Identificação">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${form.color === c ? 'scale-125 ring-2 ring-white/50' : ''}`}
                  style={{ background: c, boxShadow: form.color === c ? `0 0 10px ${c}88` : undefined }} />
              ))}
            </div>
          </Field>

          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#9296ab] hover:text-[#f0f1f6] transition-colors">
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)}
              className="w-4 h-4 accent-violet-500" />
            Membro ativo (pode ser escalado)
          </label>

          <div className="flex gap-3 justify-end mt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#9296ab] bg-white/[0.04] border border-white/[0.08] hover:text-white transition-all">
              Cancelar
            </button>
            <button type="submit" id="btn-save-member"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:brightness-110 active:scale-95 transition-all">
              💾 {member ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────
const inputCls = 'w-full px-3.5 py-2.5 bg-[#111219] border border-white/10 rounded-xl text-sm text-[#f0f1f6] placeholder-[#5a5f75] outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-[#9296ab] uppercase tracking-widest">{label}</span>
      {children}
    </div>
  );
}

function SectionTitle({ dot, label, count }: { dot: 'active' | 'inactive'; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-[#9296ab] uppercase tracking-widest">
      <span className={`w-2 h-2 rounded-full ${dot === 'active' ? 'bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-[#5a5f75]'}`} />
      {label}
      <span className="ml-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px]">{count}</span>
    </div>
  );
}
