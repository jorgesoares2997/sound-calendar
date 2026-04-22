'use client';

import { useState, useEffect } from 'react';
import type { Shift, Member, ShiftType } from '@/types';
import { SHIFT_TYPES } from './Calendar';
import { PenTool, Calendar as CalendarIcon, Save, X, Clock, Users, FileText } from 'lucide-react';

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
      <div className="studio-panel rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <PenTool size={10} className="text-accent-primary" />
              <span className="mono-label text-[9px] text-accent-primary uppercase tracking-widest">PATCH_EDITOR // v1.2</span>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              {initialData ? 'Ajustar_Módulo' : 'Novo_Módulo_de_Escala'}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="mb-8 p-4 bg-black/40 border border-white/5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
            <CalendarIcon size={20} className="text-accent-primary" />
          </div>
          <div className="flex flex-col">
            <span className="mono-label text-[8px] text-text-muted block mb-1 uppercase tracking-widest">TIMESTAMP_ALVO</span>
            <div className="text-sm font-black text-accent-primary uppercase tracking-wider">
              {formatLong(date)}
            </div>
          </div>
        </div>

        <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); if (form.title.trim()) onSave(form); }}>
          <Field label="TÍTULO_DA_ESCALA">
            <input id="shift-title" className="studio-input font-bold uppercase tracking-widest" placeholder="EX: CULTO_MATUTINO..." value={form.title}
              onChange={(e) => set('title', e.target.value)} required autoFocus />
          </Field>

          <Field label="TIPO_DE_SINAL">
            <select id="shift-type" className="studio-input font-bold uppercase tracking-widest appearance-none" value={form.type} onChange={(e) => set('type', e.target.value as ShiftType)}>
              {SHIFT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="START_TX">
              <input id="shift-start" type="time" className="studio-input font-mono text-sm" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
            </Field>
            <Field label="END_TX">
              <input id="shift-end" type="time" className="studio-input font-mono text-sm" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
            </Field>
          </div>

          <Field label="PATCH_DE_OPERADORES">
            {members.filter((m) => m.active).length === 0
              ? <p className="text-[10px] text-accent-red/60 mono-label uppercase italic">ERRO: NENHUM_OPERADOR_ATIVO_DETECTADO</p>
              : <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {members.filter((m) => m.active).map((m) => {
                  const sel = form.memberIds.includes(m.id);
                  return (
                    <label key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${sel ? 'bg-accent-primary/10 border-accent-primary/40' : 'bg-black/40 border-white/[0.05] hover:border-white/20'}`}>
                      <input type="checkbox" checked={sel} onChange={() => toggleMember(m.id)} className="hidden" />
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: m.color, boxShadow: `0 0 5px ${m.color}` }} />
                      <span className="text-xs font-bold text-white flex-1 uppercase tracking-tighter">{m.name}</span>
                      <span className="mono-label text-[8px] text-text-muted uppercase tracking-widest">{m.role}</span>
                      {sel && <span className="mono-label text-[9px] text-accent-primary font-black uppercase">LINK</span>}
                    </label>
                  );
                })}
              </div>
            }
          </Field>

          <Field label="NOTAS_DE_ENGENHARIA">
            <textarea id="shift-notes" className="studio-input resize-y min-h-[80px] text-xs leading-relaxed uppercase tracking-tight placeholder:opacity-20" placeholder="INFO_ADICIONAL_MÓDULO..."
              value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>

          <div className="flex gap-4 justify-end mt-4 pt-6 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded mono-label text-[10px] font-black text-text-muted hover:text-white transition-all uppercase tracking-widest">
              CANCELAR
            </button>
            <button type="submit" id="btn-save-shift" className="px-8 py-3 rounded text-xs font-black bg-accent-primary text-white shadow-neon hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center gap-3">
              <Save size={16} />
              GRAVAR_PATCH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="mono-label text-[9px] text-text-muted uppercase tracking-[0.2em]">{label}</span>
      {children}
    </div>
  );
}

