'use client';

import { useState, useEffect } from 'react';
import type { Shift, Member, ShiftType } from '@/types';
import { SHIFT_TYPES } from './Calendar';

interface AddShiftModalProps {
  date: string;
  members: Member[];
  onClose: () => void;
  onSave: (data: Omit<Shift, 'id' | 'createdAt' | 'date'>) => void;
  initialData?: Shift;
}

export function AddShiftModal({ date, members, onClose, onSave, initialData }: AddShiftModalProps) {
  const [form, setForm] = useState({
    title: '', type: 'culto' as ShiftType,
    startTime: '', endTime: '', memberIds: [] as string[], notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        type: initialData.type,
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        memberIds: initialData.memberIds || [],
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleMember = (id: string) => setForm((f) => ({
    ...f,
    memberIds: f.memberIds.includes(id) ? f.memberIds.filter((x) => x !== id) : [...f.memberIds, id],
  }));

  const formatLong = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[6000] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}>
      <div className="bg-[#161821] border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#f0f1f6]">
            {initialData ? '✏️ Editar Escala' : '➕ Nova Escala'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#9296ab] hover:text-white transition-all flex items-center justify-center text-sm">✕</button>
        </div>

        <div className="mb-5 px-3 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-300 text-sm font-semibold capitalize">
          📅 {formatLong(date)}
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (form.title.trim()) onSave(form); }}>
          <Field label="Título">
            <input id="shift-title" className={inputCls} placeholder="ex: Culto da manhã..." value={form.title}
              onChange={(e) => set('title', e.target.value)} required autoFocus />
          </Field>

          <Field label="Tipo">
            <select id="shift-type" className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value as ShiftType)}>
              {SHIFT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Início">
              <input id="shift-start" type="time" className={inputCls} value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
            </Field>
            <Field label="Fim">
              <input id="shift-end" type="time" className={inputCls} value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
            </Field>
          </div>

          <Field label="Membros Escalados">
            {members.filter((m) => m.active).length === 0
              ? <p className="text-xs text-[#5a5f75] italic">Adicione membros na aba Membros primeiro.</p>
              : <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {members.filter((m) => m.active).map((m) => {
                  const sel = form.memberIds.includes(m.id);
                  return (
                    <label key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${sel ? 'bg-violet-600/10 border-violet-500/40' : 'bg-[#111219] border-white/[0.06] hover:border-white/10'}`}>
                      <input type="checkbox" checked={sel} onChange={() => toggleMember(m.id)} className="hidden" />
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                      <span className="text-sm font-semibold text-[#f0f1f6] flex-1">{m.name}</span>
                      <span className="text-xs text-[#5a5f75]">{m.role}</span>
                      {sel && <span className="text-purple-400 font-bold text-sm">✓</span>}
                    </label>
                  );
                })}
              </div>
            }
          </Field>

          <Field label="Observações">
            <textarea id="shift-notes" className={`${inputCls} resize-y min-h-[70px]`} placeholder="Info adicional..."
              value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>

          <div className="flex gap-3 justify-end mt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#9296ab] bg-white/[0.04] border border-white/[0.08] hover:text-white hover:bg-white/[0.08] transition-all">
              Cancelar
            </button>
            <button type="submit" id="btn-save-shift" className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:brightness-110 active:scale-95 transition-all">
              💾 Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = 'w-full px-3.5 py-2.5 bg-[#111219] border border-white/10 rounded-xl text-sm text-[#f0f1f6] placeholder-[#5a5f75] outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-[#9296ab] uppercase tracking-widest">{label}</span>
      {children}
    </div>
  );
}
