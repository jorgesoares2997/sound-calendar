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
    <div className="fixed inset-0 theme-overlay-soft backdrop-blur-sm z-[6000] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}>
      <div className="glass-card rounded-[40px] p-10 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up relative theme-border-strong"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col">
            <h3 className="text-3xl font-light theme-text-primary tracking-tight">
              {initialData ? 'Editar Escala' : 'Nova Escala'}
            </h3>
            <p className="theme-text-secondary font-medium mt-1">{formatLong(date)}</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-[var(--color-bg-surface)] theme-text-muted transition-all flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="flex flex-col gap-8" onSubmit={(e) => { e.preventDefault(); if (form.title.trim()) onSave(form); }}>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Título da Sessão</label>
              <input 
                className="organic-input w-full" 
                placeholder="Ex: Culto de Celebração" 
                value={form.title}
                onChange={(e) => set('title', e.target.value)} 
                required 
                autoFocus 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Tipo de Evento</label>
                <select 
                  className="organic-input w-full appearance-none" 
                  value={form.type} 
                  onChange={(e) => set('type', e.target.value as ShiftType)}
                >
                  {SHIFT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Horário de Início</label>
                <input 
                  type="time" 
                  className="organic-input w-full" 
                  value={form.startTime} 
                  onChange={(e) => set('startTime', e.target.value)} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Equipe Escalada</label>
              <div className="flex flex-wrap gap-2 p-4 theme-card-solid rounded-3xl border theme-border">
                {members.filter(m => m.active).map((m) => {
                  const sel = form.memberIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMember(m.id)}
                      className={`
                        px-4 py-2 rounded-xl text-xs font-bold transition-all border
                        ${sel 
                          ? 'bg-accent-primary text-white border-accent-primary shadow-sm scale-105' 
                          : 'theme-surface theme-text-secondary theme-border hover:border-accent-primary/40'}
                      `}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Observações</label>
              <textarea 
                className="organic-input w-full min-h-[100px] py-4" 
                placeholder="Notas técnicas ou lembretes importantes..."
                value={form.notes} 
                onChange={(e) => set('notes', e.target.value)} 
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-4 pt-10 border-t theme-border">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-4 rounded-2xl text-xs font-bold theme-text-muted hover:opacity-75 transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-10 py-4 rounded-2xl text-xs font-bold bg-accent-primary text-white shadow-lift hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              Salvar Escala
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
