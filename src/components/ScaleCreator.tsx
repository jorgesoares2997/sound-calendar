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
    toast.success(`${draftShifts.length} escalas sincronizadas! ✅`);
  };

  const handleSaveSingle = (index: number) => {
    const shift = draftShifts[index];
    logger.info(`ScaleCreator: handleSaveSingle acionado para escala no índice ${index}`, { shiftTitle: shift.title });
    if (!shift.title.trim()) {
      toast.error('A escala precisa de um título.');
      return;
    }
    onSaveSingle(shift);
    toast.success('Escala individual salva! ✅');
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent leading-tight">
            🪄 Gerador de Escalas
          </h1>
          <p className="text-xs text-[#5a5f75] mt-1">Crie escalas automáticas ou manuais</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#161821] p-1 rounded-xl border border-white/5">
          <button 
            type="button"
            onClick={() => {
              logger.info('ScaleCreator: Botão "Mensal" clicado.');
              setMode('monthly');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'monthly' ? 'bg-violet-600 text-white shadow-lg' : 'text-[#5a5f75] hover:text-[#9296ab]'}`}
          >
            📅 Mensal
          </button>
          <button 
            type="button"
            onClick={() => {
              logger.info('ScaleCreator: Botão "Isolada" clicado.');
              setMode('isolated');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'isolated' ? 'bg-violet-600 text-white shadow-lg' : 'text-[#5a5f75] hover:text-[#9296ab]'}`}
          >
            ➕ Isolada
          </button>
        </div>
      </div>

      {mode === 'monthly' && (
        <div className="flex items-center gap-2 px-1 mb-2">
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className={inputCls + ' !py-1.5 text-xs w-28'}
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className={inputCls + ' !py-1.5 text-xs w-20'}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-[10px] text-[#5a5f75] ml-2 italic hidden sm:inline">
            * Sugestões baseadas em domingos e quartas.
          </span>
        </div>
      )}

      {/* Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 px-1">
        {draftShifts.map((shift, idx) => (
          <div key={`${idx}-${shift.date}-${mode}`} className="bg-[#161821] border border-white/[0.06] rounded-2xl p-3 sm:p-4 flex gap-4 hover:border-white/10 transition-all relative group overflow-hidden">
            {/* Minimalist Date Column */}
            <div className="flex flex-col items-center justify-center gap-0.5 border-r border-white/5 pr-4 flex-shrink-0 min-w-[75px]">
              <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-tight">
                {formatDayName(shift.date)}
              </span>
              <input 
                type="number"
                min="1"
                max="31"
                className="bg-transparent text-xl font-black text-[#f0f1f6] outline-none text-center w-14 hover:text-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

            {/* Row Content */}
            <div className="flex flex-col gap-3 flex-grow min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <select 
                    className="bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-[10px] font-bold text-[#5a5f75] uppercase outline-none"
                    value={shift.type}
                    onChange={(e) => updateShift(idx, { type: e.target.value as ShiftType })}
                  >
                    {SHIFT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label.split(' ')[1]}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <input 
                      type="time"
                      className="bg-transparent text-xs text-[#9296ab] outline-none focus:text-white w-14"
                      value={shift.startTime}
                      onChange={(e) => updateShift(idx, { startTime: e.target.value })}
                    />
                    <span className="text-[#5a5f75] text-[10px]">-</span>
                    <input 
                      type="time"
                      className="bg-transparent text-xs text-[#9296ab] outline-none focus:text-white w-14"
                      value={shift.endTime}
                      onChange={(e) => updateShift(idx, { endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => handleSaveSingle(idx)}
                    className="w-8 h-8 rounded-lg text-green-500/40 hover:bg-green-500/10 hover:text-green-400 transition-all flex items-center justify-center"
                    title="Salvar apenas esta escala"
                  >
                    💾
                  </button>
                  <button 
                    type="button"
                    onClick={() => removeShift(idx)}
                    className="w-8 h-8 rounded-lg text-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Remover"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <input 
                  className="bg-transparent text-sm font-bold text-[#f0f1f6] outline-none focus:text-purple-400 transition-colors w-full p-0 border-none"
                  value={shift.title}
                  placeholder="Título da escala..."
                  onChange={(e) => updateShift(idx, { title: e.target.value })}
                />
                <select 
                  className="w-full bg-[#111219] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#f0f1f6] outline-none focus:border-violet-500 appearance-none"
                  value={shift.memberIds[0] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateShift(idx, { memberIds: val ? [val] : [] });
                  }}
                >
                  <option value="">Selecione o técnico...</option>
                  {activeMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        
        <button 
          type="button"
          onClick={() => {
            logger.info('ScaleCreator: Botão "Adicionar Escala" clicado.');
            addEmptyShift();
          }}
          className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-6 flex items-center justify-center gap-3 text-sm font-bold text-[#5a5f75] hover:border-white/20 hover:bg-white/[0.04] hover:text-[#9296ab] transition-all min-h-[110px]"
        >
          <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-lg">+</span>
          Adicionar Escala {mode === 'isolated' ? 'Manual' : 'Extra'}
        </button>
      </div>

      {/* Footer */}
      {(mode === 'monthly' || draftShifts.length > 0) && (
        <div className="sticky bottom-0 bg-[#0a0b0f]/80 backdrop-blur-xl border-t border-white/[0.06] p-4 -mx-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 sm:rounded-b-2xl sm:mx-0">
          <span className="text-xs text-[#5a5f75]">
            Rascunho: <strong className="text-white">{draftShifts.length} escalas</strong>
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {justSaved && (
              <button 
                type="button"
                onClick={() => {
                  logger.info('ScaleCreator: Botão "Checar Automações" clicado.');
                  onNavigate?.('automation');
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-purple-400 hover:bg-white/10 transition-all flex-1 sm:flex-none animate-fade-in"
              >
                🤖 Checar Automações
              </button>
            )}
            {mode === 'monthly' && (
              <button 
                type="button"
                onClick={handleSaveAll}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-xl shadow-violet-500/30 hover:brightness-110 active:scale-95 transition-all flex-1 sm:flex-none"
              >
                💾 Salvar Tudo (Substituir Mês)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'px-3.5 py-2.5 bg-[#161821] border border-white/10 rounded-xl text-sm text-[#f0f1f6] outline-none focus:border-violet-500 transition-all';
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
