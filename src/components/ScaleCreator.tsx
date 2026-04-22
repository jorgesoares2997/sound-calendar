'use client';

import { useState, useEffect } from 'react';
import type { Member, Shift, ShiftType, Page } from '@/types';
import { generateSuggestedScales } from '@/utils/date-helpers';
import { SHIFT_TYPES } from './Calendar';
import { logger } from '@/utils/logger';

interface ScaleCreatorProps {
  members: Member[];
  onSave: (shifts: Omit<Shift, 'id' | 'createdAt'>[], year: number, month: number) => void;
  onSaveSingle: (shift: Omit<Shift, 'id' | 'createdAt'>) => void;
  onNavigate?: (page: Page) => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}

export function ScaleCreator({ members, onSave, onSaveSingle, onNavigate, toast }: ScaleCreatorProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [mode, setMode] = useState<'monthly' | 'isolated'>('isolated');
  const [draftShifts, setDraftShifts] = useState<Omit<Shift, 'id' | 'createdAt'>[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    logger.debug(`ScaleCreator: Modo alterado para ${mode}. Mês: ${month}, Ano: ${year}`);
    if (mode === 'monthly') {
      const suggestions = generateSuggestedScales(year, month).map(({ id, createdAt, ...rest }) => ({
        ...rest,
        memberIds: rest.memberIds || []
      }));
      setDraftShifts(suggestions);
    } else {
      setDraftShifts([]);
    }
    setJustSaved(false);
  }, [year, month, mode]);

  const updateShift = (index: number, changes: Partial<Omit<Shift, 'id' | 'createdAt'>>) => {
    logger.debug(`ScaleCreator: Atualizando escala no índice ${index}`, changes);
    setDraftShifts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...changes };
      return next;
    });
  };

  const removeShift = (index: number) => {
    logger.debug(`ScaleCreator: Removendo escala no índice ${index}`);
    setDraftShifts((prev) => prev.filter((_, i) => i !== index));
  };

  const addEmptyShift = () => {
    logger.debug('ScaleCreator: Adicionando nova escala isolada.');
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    setDraftShifts((prev) => [
      ...prev,
      {
        date: dateStr,
        title: 'Nova Escala',
        type: 'culto',
        startTime: '19:30',
        endTime: '21:30',
        memberIds: [],
        notes: '',
      },
    ]);
  };

  const handleSaveAll = () => {
    logger.info(`ScaleCreator: handleSaveAll acionado com ${draftShifts.length} escalas.`);
    if (draftShifts.length === 0) {
      toast.error('Nenhuma escala para salvar.');
      return;
    }
    onSave(draftShifts, year, month);
    setJustSaved(true);
    toast.success(`${draftShifts.length} escalas sincronizadas!`);
  };

  const handleSaveSingle = (index: number) => {
    const shift = draftShifts[index];
    logger.info(`ScaleCreator: handleSaveSingle acionado para escala no índice ${index}`, { shiftTitle: shift.title });
    if (!shift.title.trim()) {
      toast.error('A escala precisa de um título.');
      return;
    }
    onSaveSingle(shift);
    toast.success('Escala individual salva!');
    removeShift(index);
  };

  const formatDayName = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return '';
    const [y, m, d] = parts.map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  };

  const activeMembers = members.filter((m) => m.active);

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
      {/* Console Header */}
      <div className="flex items-center justify-between gap-6 flex-wrap px-1">
        <div className="flex flex-col">
          <span className="mono-label text-[10px] text-accent-primary mb-1 uppercase tracking-widest">MÓDULO_DE_GERAÇÃO // v2.4</span>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
            Sintetizador_de_Escala
          </h1>
        </div>
        
        <div className="flex items-center p-1.5 bg-black/40 border border-white/5 rounded-lg shadow-inner">
          <button 
            type="button"
            onClick={() => setMode('monthly')}
            className={`px-6 py-2 rounded mono-label text-[10px] font-black transition-all uppercase tracking-widest ${mode === 'monthly' ? 'bg-accent-primary text-white shadow-neon' : 'text-text-muted hover:text-white'}`}
          >
            LOTE_MENSAL
          </button>
          <button 
            type="button"
            onClick={() => setMode('isolated')}
            className={`px-6 py-2 rounded mono-label text-[10px] font-black transition-all uppercase tracking-widest ${mode === 'isolated' ? 'bg-accent-primary text-white shadow-neon' : 'text-text-muted hover:text-white'}`}
          >
            TX_ISOLADA
          </button>
        </div>
      </div>

      {mode === 'monthly' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-black/20 border border-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="mono-label text-[9px] text-text-muted uppercase tracking-widest">SELEÇÃO_BANCO:</span>
            <select 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-black/60 border border-white/10 rounded px-3 py-1.5 mono-label text-[10px] text-white outline-none focus:border-accent-primary uppercase"
            >
              {MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m.toUpperCase()}</option>)}
            </select>
          </div>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-black/60 border border-white/10 rounded px-3 py-1.5 mono-label text-[10px] text-white outline-none focus:border-accent-primary"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <div className="signal-led signal-led-active opacity-40" />
            <span className="mono-label text-[8px] text-text-muted italic uppercase tracking-widest">GERAÇÃO_AUTO_ATIVA (DOM/QUA)</span>
          </div>
        </div>
      )}

      {/* Sequencer / Module Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {draftShifts.map((shift, idx) => (
          <div key={`${idx}-${shift.date}`} className="studio-panel rounded-lg p-5 flex gap-6 hover:border-accent-primary/30 transition-all relative group overflow-hidden">
            {/* Day Display Module */}
            <div className="flex flex-col items-center justify-center border-r border-white/5 pr-6 min-w-[80px]">
              <span className="mono-label text-[10px] text-accent-primary mb-1 uppercase font-black">{formatDayName(shift.date).toUpperCase()}</span>
              <input 
                type="number"
                className="bg-black/40 border border-white/10 rounded text-xl font-black text-white outline-none text-center w-14 py-2 focus:border-accent-primary shadow-inner"
                value={parseInt(shift.date.split('-')[2], 10) || 1}
                onChange={(e) => {
                  const dayNum = parseInt(e.target.value, 10);
                  if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
                    const val = String(dayNum).padStart(2, '0');
                    const [y, m] = shift.date.split('-');
                    updateShift(idx, { date: `${y}-${m}-${val}` });
                  }
                }}
              />
            </div>

            {/* Parameter Controls */}
            <div className="flex flex-col gap-4 flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select 
                    className="bg-black/60 border border-white/10 rounded px-2 py-1 mono-label text-[9px] text-accent-primary outline-none focus:border-accent-primary uppercase"
                    value={shift.type}
                    onChange={(e) => updateShift(idx, { type: e.target.value as ShiftType })}
                  >
                    {SHIFT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>)}
                  </select>
                  <div className="flex items-center gap-2 px-2 py-1 bg-black/40 border border-white/5 rounded">
                    <input type="time" className="bg-transparent mono-label text-[10px] text-white outline-none w-14" value={shift.startTime} onChange={(e) => updateShift(idx, { startTime: e.target.value })} />
                    <span className="text-text-muted text-[10px]">-</span>
                    <input type="time" className="bg-transparent mono-label text-[10px] text-white outline-none w-14" value={shift.endTime} onChange={(e) => updateShift(idx, { endTime: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleSaveSingle(idx)} className="px-1.5 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center mono-label text-[8px] font-black hover:text-accent-green transition-all uppercase">GRAVAR</button>
                  <button onClick={() => removeShift(idx)} className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center mono-label text-[10px] font-black hover:text-accent-red transition-all uppercase">DEL</button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute -top-2 left-2 px-1 bg-bg-card mono-label text-[7px] text-text-muted uppercase tracking-widest">RÓTULO_DO_MÓDULO</span>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-bold text-white outline-none focus:border-accent-primary placeholder:opacity-20 uppercase"
                    value={shift.title}
                    placeholder="NOME_DA_ESCALA..."
                    onChange={(e) => updateShift(idx, { title: e.target.value })}
                  />
                </div>
                
                <div className="relative">
                  <span className="absolute -top-2 left-2 px-1 bg-bg-card mono-label text-[7px] text-text-muted uppercase tracking-widest">PATCH_DE_OPERADOR</span>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-bold text-white outline-none focus:border-accent-primary appearance-none uppercase"
                    value={shift.memberIds[0] || ''}
                    onChange={(e) => updateShift(idx, { memberIds: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">SELECIONAR_OPERADOR...</option>
                    {activeMembers.map(m => <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button 
          type="button"
          onClick={addEmptyShift}
          className="studio-panel rounded-lg border-dashed border-white/10 flex flex-col items-center justify-center gap-3 p-8 hover:bg-white/[0.02] hover:border-accent-primary/40 transition-all group"
        >
          <div className="w-12 h-12 rounded bg-black/40 border border-white/10 flex items-center justify-center mono-label text-[10px] font-black group-hover:scale-110 transition-transform shadow-inner text-text-muted group-hover:text-white uppercase">ADD</div>
          <span className="mono-label text-[10px] text-text-muted group-hover:text-white uppercase tracking-widest">NOVO_MÓDULO_PATCH</span>
        </button>
      </div>

      {/* Master Control Bar */}
      {(mode === 'monthly' || draftShifts.length > 0) && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-black/80 backdrop-blur-2xl border-t border-white/10 p-4 flex items-center justify-between gap-6 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="mono-label text-[8px] text-text-muted uppercase tracking-widest">STATUS_DO_LOTE</span>
              <span className="text-xs font-black text-white uppercase tracking-tighter">{draftShifts.length} MÓDULOS_EM_BUFFER</span>
            </div>
            <div className="vu-meter w-20">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="vu-bar w-1.5" style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {justSaved && (
              <button 
                onClick={() => onNavigate?.('automation')}
                className="px-6 py-2.5 rounded mono-label text-[10px] font-black bg-white/5 border border-white/10 text-accent-primary hover:bg-accent-primary/10 transition-all animate-fade-in uppercase tracking-widest"
              >
                IR_PARA_ROBÔ_DE_ROTEAMENTO
              </button>
            )}
            <button 
              onClick={handleSaveAll}
              className="px-10 py-3 rounded mono-label text-xs font-black bg-accent-primary text-white shadow-neon hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em]"
            >
              COMMIT_TODOS_BUFFERS
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
