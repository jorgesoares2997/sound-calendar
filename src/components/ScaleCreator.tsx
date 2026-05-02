'use client';

import { useState } from 'react';
import type { Shift, Member, ShiftType } from '@/types';
import { SHIFT_TYPES } from './Calendar';

interface ScaleCreatorProps {
  members: Member[];
  onSave: (shifts: Omit<Shift, 'id' | 'createdAt'>[]) => void;
}

type Tab = 'mensal' | 'isolada';
type SaveMode = 'all' | 'filled';

export function ScaleCreator({ members, onSave }: ScaleCreatorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('mensal');
  const [saveMode, setSaveMode] = useState<SaveMode>('filled');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [generatedShifts, setGeneratedShifts] = useState<Omit<Shift, 'id' | 'createdAt'>[]>([]);

  const generateMonth = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const newShifts: Omit<Shift, 'id' | 'createdAt'>[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay();
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Domingo: 09:30 e 18:30
      if (dayOfWeek === 0) {
        newShifts.push({ title: 'Culto da Manhã', date: dateStr, type: 'culto', startTime: '09:30', endTime: '12:00', memberIds: [], notes: '' });
        newShifts.push({ title: 'Culto da Noite', date: dateStr, type: 'culto', startTime: '18:30', endTime: '21:00', memberIds: [], notes: '' });
      }
      // Quarta: 19:30
      if (dayOfWeek === 3) {
        newShifts.push({ title: 'Culto de Quarta', date: dateStr, type: 'culto', startTime: '19:30', endTime: '21:30', memberIds: [], notes: '' });
      }
    }
    setGeneratedShifts(newShifts);
  };

  const addIsolatedShift = () => {
    const today = new Date().toISOString().split('T')[0];
    setGeneratedShifts(prev => [
      ...prev,
      { title: 'Nova Escala Isolada', date: today, type: 'evento', startTime: '19:00', endTime: '21:00', memberIds: [], notes: '' }
    ]);
  };

  const updateShift = (index: number, memberId: string) => {
    const updated = [...generatedShifts];
    const shift = { ...updated[index] };
    if (shift.memberIds.includes(memberId)) {
      shift.memberIds = shift.memberIds.filter(id => id !== memberId);
    } else {
      shift.memberIds = [...shift.memberIds, memberId];
    }
    updated[index] = shift;
    setGeneratedShifts(updated);
  };

  const updateShiftField = (index: number, field: keyof Omit<Shift, 'id' | 'createdAt'>, value: any) => {
    const updated = [...generatedShifts];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedShifts(updated);
  };

  const saveSingle = (index: number) => {
    onSave([generatedShifts[index]]);
  };

  const saveAll = () => {
    const shiftsToSave = saveMode === 'filled' 
      ? generatedShifts.filter(s => s.memberIds.length > 0)
      : generatedShifts;
    
    if (shiftsToSave.length > 0) {
      onSave(shiftsToSave);
    }
  };

  const removeShift = (index: number) => {
    setGeneratedShifts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      {/* Header & Tabs */}
      <div className="px-6 lg:px-12 py-8 space-y-8 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-light theme-text-primary tracking-tight">Gerador de Escalas</h2>
            <p className="theme-text-secondary font-medium mt-1">Defina o cronograma e atribua a equipe.</p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Tab Switcher */}
            <div className="flex p-1 theme-surface rounded-2xl w-fit">
              <button 
                onClick={() => { setActiveTab('mensal'); setGeneratedShifts([]); }}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'mensal' ? 'theme-card-solid shadow-sm text-accent-primary' : 'theme-text-secondary'}`}
              >
                Mensal
              </button>
              <button 
                onClick={() => { setActiveTab('isolada'); setGeneratedShifts([]); }}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'isolada' ? 'theme-card-solid shadow-sm text-accent-primary' : 'theme-text-secondary'}`}
              >
                Isolada
              </button>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-4">
               {activeTab === 'mensal' ? (
                 <div className="flex gap-2 theme-surface p-1 rounded-2xl">
                    <select 
                      value={month} 
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest px-4 py-2 cursor-pointer focus:ring-0"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={generateMonth}
                      className="px-6 py-2 rounded-xl bg-accent-primary text-white font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-sm"
                    >
                      Gerar
                    </button>
                 </div>
               ) : (
                 <button 
                   onClick={addIsolatedShift}
                   className="px-6 py-3 rounded-2xl bg-accent-primary text-white font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lift flex items-center gap-2"
                 >
                   <span className="material-symbols-outlined text-sm">add</span>
                   Nova Escala
                 </button>
               )}
            </div>
          </div>
        </div>

        {/* Global Save Toggle */}
        <div className="flex items-center justify-between py-4 border-y theme-border">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold theme-text-muted uppercase tracking-[0.2em]">Modo de Gravação</span>
            <div className="flex p-1 theme-card-solid rounded-xl border theme-border">
              <button 
                onClick={() => setSaveMode('all')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${saveMode === 'all' ? 'theme-surface shadow-sm text-accent-primary' : 'theme-text-muted'}`}
              >
                Salvar Todos
              </button>
              <button 
                onClick={() => setSaveMode('filled')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${saveMode === 'filled' ? 'theme-surface shadow-sm text-accent-primary' : 'theme-text-muted'}`}
              >
                Apenas Preenchidos
              </button>
            </div>
          </div>
          
          <button 
            onClick={saveAll}
            disabled={generatedShifts.length === 0}
            className="px-10 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lift hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Gravar Lote e Notificar
          </button>
        </div>
      </div>

      {/* Vertical Card List */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 space-y-6 pb-20 custom-scrollbar">
        {generatedShifts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed theme-border rounded-[40px] opacity-40">
            <span className="material-symbols-outlined text-4xl mb-2">pending_actions</span>
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma escala {activeTab === 'mensal' ? 'gerada' : 'adicionada'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {generatedShifts.map((shift, idx) => (
              <div key={idx} className="glass-card p-8 rounded-[40px] shadow-ambient theme-border-strong flex flex-col gap-6 group hover:shadow-lift transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <input 
                      type="text" 
                      value={shift.title} 
                      onChange={(e) => updateShiftField(idx, 'title', e.target.value)}
                      className="bg-transparent border-none p-0 text-lg font-bold theme-text-primary uppercase tracking-tight focus:ring-0 w-full"
                    />
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-accent-primary">calendar_today</span>
                      <input 
                        type="date" 
                        value={shift.date}
                        onChange={(e) => updateShiftField(idx, 'date', e.target.value)}
                        className="bg-transparent border-none p-0 text-[10px] font-bold theme-text-secondary uppercase tracking-widest focus:ring-0"
                      />
                    </div>
                  </div>
                  <button onClick={() => removeShift(idx)} className="opacity-0 group-hover:opacity-100 p-2 theme-text-muted hover:text-red-500 transition-all">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Início</label>
                    <input 
                      type="time" 
                      value={shift.startTime}
                      onChange={(e) => updateShiftField(idx, 'startTime', e.target.value)}
                      className="organic-input w-full text-xs font-bold py-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Término</label>
                    <input 
                      type="time" 
                      value={shift.endTime}
                      onChange={(e) => updateShiftField(idx, 'endTime', e.target.value)}
                      className="organic-input w-full text-xs font-bold py-2"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-1">Atribuir Operador</label>
                  <div className="relative">
                    <select 
                      className="organic-input w-full text-[11px] font-bold py-3 appearance-none"
                      onChange={(e) => updateShift(idx, e.target.value)}
                      value=""
                    >
                      <option value="">Selecionar...</option>
                      {members.filter(m => m.active).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {shift.memberIds.map(id => {
                      const member = members.find(m => m.id === id);
                      return (
                        <span key={id} className="px-3 py-1.5 bg-accent-primary/5 dark:bg-accent-primary/10 rounded-xl text-[10px] font-bold text-accent-primary uppercase tracking-tight flex items-center gap-2 border border-accent-primary/10">
                          {member?.name}
                          <button onClick={() => updateShift(idx, id)} className="hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => saveSingle(idx)}
                  className="mt-auto w-full py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-accent-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Gravar Esta Escala
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
