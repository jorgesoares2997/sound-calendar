'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Shift, Member, AppSettings, ShiftType } from '@/types';
import { buildReminderMessage, sendTelegramMessage } from '@/utils/telegram';
import { getEnvConfigStatusAction } from '@/app/actions/telegram';
import { ShiftCard } from './ShiftCard';
import { AddShiftModal } from './AddShiftModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Bell, 
  RefreshCcw,
  Signal
} from 'lucide-react';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const SHIFT_TYPES: { value: ShiftType; label: string; color: string }[] = [
  { value: 'manha', label: 'MANHÃ', color: '#f59e0b' },
  { value: 'tarde', label: 'TARDE', color: '#06b6d4' },
  { value: 'noite', label: 'NOITE', color: '#8b5cf6' },
  { value: 'culto', label: 'CULTO', color: '#7c3aed' },
  { value: 'ensaio', label: 'ENSAIO', color: '#22c55e' },
  { value: 'evento', label: 'EVENTO', color: '#ef4444' },
];

export function getShiftMeta(type: ShiftType) {
  return SHIFT_TYPES.find((s) => s.value === type) ?? SHIFT_TYPES[0];
}

function toISODate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function formatLong(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

interface CalendarProps {
  shifts: Shift[];
  members: Member[];
  settings: AppSettings;
  onAddShift: (shift: Omit<Shift, 'id' | 'createdAt'>) => void;
  onDeleteShift: (id: string) => void;
  toast: { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void };
}

export function Calendar({ shifts, members, settings, onAddShift, onDeleteShift, toast }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<{ hasToken: boolean; hasChatId: boolean } | null>(null);

  useEffect(() => {
    getEnvConfigStatusAction().then(setEnvStatus);
  }, []);

  const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [viewYear, viewMonth]);

  const shiftsForSelected = useMemo(
    () => (selectedDate ? shifts.filter((s) => s.date === selectedDate) : []),
    [shifts, selectedDate],
  );

  const upcomingShifts = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const in7 = new Date(now); in7.setDate(in7.getDate() + 7);
    return shifts
      .filter((s) => { const d = parseDate(s.date); return d >= now && d <= in7; })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shifts]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const getShiftsForDay = (day: number) =>
    shifts.filter((s) => s.date === toISODate(viewYear, viewMonth, day));

  const handleSendReminder = async (shift: Shift) => {
    const isConfigured = (settings.botToken && settings.groupChatId) || (envStatus?.hasToken && envStatus?.hasChatId);
    
    if (!isConfigured) {
      toast.error('Configure o bot e Chat ID em Ajustes ou no servidor (.env) primeiro.');
      return;
    }
    const assigned = shift.memberIds.map((id) => members.find((m) => m.id === id)).filter(Boolean) as Member[];
    if (assigned.length === 0) { toast.error('Nenhum membro atribuído a esta escala.'); return; }

    setSendingId(shift.id);
    let ok = 0;
    for (const member of assigned) {
      const text = buildReminderMessage(settings.reminderMessage, member, shift);
      const res = await sendTelegramMessage(settings.botToken, settings.groupChatId, text);
      if (res.ok) ok++;
      else toast.error(`Erro ao enviar para ${member.name}: ${res.error}`);
    }
    setSendingId(null);
    if (ok > 0) toast.success(`${ok} lembrete(s) enviado(s)!`);
  };

  return (
    <div className="flex flex-col xl:grid xl:grid-cols-[1fr_320px] gap-8">
      {/* ─── Main Console Grid ─── */}
      <div className="studio-panel rounded-lg overflow-hidden flex flex-col">
        {/* Module Header */}
        <div className="px-6 py-5 border-b border-white/[0.03] flex items-center justify-between gap-4 flex-wrap bg-black/20">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <CalendarIcon size={10} className="text-accent-primary" />
                <span className="mono-label text-[9px] text-accent-primary uppercase tracking-widest">BANCO_DE_SEQUÊNCIA</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tighter uppercase">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
            </div>
            
            <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded">
              <button id="prev-month" onClick={prevMonth}
                className="w-10 h-8 rounded bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                <ChevronLeft size={14} />
              </button>
              <button id="next-month" onClick={nextMonth}
                className="w-10 h-8 rounded bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <button id="btn-today" onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(todayStr); }}
            className="px-4 py-2 rounded mono-label bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-accent-primary/20 hover:border-accent-primary/40 transition-all text-[10px] font-black flex items-center gap-2">
            <RefreshCcw size={10} />
            RESETAR_PARA_HOJE
          </button>
        </div>

        <div className="p-6">
          {/* Weekdays Grid */}
          <div className="grid grid-cols-7 mb-4 border-b border-white/5 pb-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center mono-label text-text-muted font-bold tracking-[0.2em] uppercase">
                {w}
              </div>
            ))}
          </div>

          {/* Sequencer Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="aspect-square opacity-20 border border-white/[0.02]" />;
              const dateStr = toISODate(viewYear, viewMonth, day);
              const dayShifts = getShiftsForDay(day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              return (
                <button
                  key={dateStr}
                  id={`day-${dateStr}`}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    aspect-square flex flex-col items-center justify-center gap-1 border transition-all relative group
                    ${isToday ? 'bg-accent-primary/10 border-accent-primary shadow-[inset_0_0_15px_var(--color-accent-primary)] text-white' : ''}
                    ${isSelected && !isToday ? 'bg-white/5 border-white/20 text-white' : ''}
                    ${!isToday && !isSelected ? 'bg-black/20 border-white/[0.03] text-text-muted hover:border-white/20 hover:text-white hover:bg-white/[0.02]' : ''}
                  `}
                >
                  <span className="text-xs font-black mono-label z-10">{String(day).padStart(2, '0')}</span>
                  
                  {/* Signal Indicators */}
                  <div className="flex gap-0.5">
                    {dayShifts.length > 0 ? (
                      dayShifts.slice(0, 4).map((s) => (
                        <span key={s.id} className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: getShiftMeta(s.type).color, boxShadow: `0 0 5px ${getShiftMeta(s.type).color}` }} />
                      ))
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-white/5" />
                    )}
                  </div>

                  {/* Hover Scanline Effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 bg-gradient-to-b from-transparent via-white to-transparent h-2 w-full animate-[scanline_2s_linear_infinite]" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Data Module */}
        {selectedDate && (
          <div className="mt-auto border-t border-white/[0.05] bg-black/40 p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="mono-label text-[9px] text-text-muted uppercase tracking-widest">TIMESTAMP_SELECIONADO</span>
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  {formatLong(selectedDate)}
                </span>
              </div>
              <button id="btn-add-shift" onClick={() => setShowModal(true)}
                className="px-6 py-2 rounded text-[10px] font-black uppercase bg-accent-primary text-white shadow-neon hover:brightness-110 active:scale-95 transition-all tracking-widest flex items-center gap-2">
                <Plus size={14} />
                NOVA_ENTRADA
              </button>
            </div>

            {shiftsForSelected.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shiftsForSelected.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    members={members}
                    onDelete={() => onDeleteShift(shift.id)}
                    onSendReminder={() => handleSendReminder(shift)}
                    isSending={sendingId === shift.id}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 border border-dashed border-white/5 rounded flex flex-col items-center justify-center opacity-40">
                <span className="mono-label text-[10px] uppercase tracking-[0.2em]">SEM_DADOS_NO_ALVO</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Monitoring / Playlist Rack ─── */}
      <div className="flex flex-col gap-6">
        <div className="studio-panel rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Signal size={10} className="text-accent-green" />
                <span className="mono-label text-[9px] text-accent-green uppercase tracking-widest">FILA_DE_SINAL</span>
              </div>
              <span className="text-xs font-black text-white uppercase tracking-tighter">Próximos Módulos</span>
            </div>
            <div className="px-2 py-1 rounded bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan mono-label text-[9px] font-black">
              {upcomingShifts.length}_ATIVOS
            </div>
          </div>

          {upcomingShifts.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-white/5 rounded">
              <p className="mono-label text-[9px] text-text-muted uppercase">FILA_VAZIA</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingShifts.map((shift) => {
                const meta = getShiftMeta(shift.type);
                const d = parseDate(shift.date);
                const shiftMembers = shift.memberIds
                  .map((id) => members.find((m) => m.id === id))
                  .filter(Boolean) as Member[];
                return (
                  <div key={shift.id} className="studio-card p-4 rounded border-l-2" style={{ borderLeftColor: meta.color }}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="mono-label text-[8px] px-1.5 py-0.5 rounded border border-white/10 text-text-secondary bg-black/40 uppercase font-black">
                        {d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()}
                      </span>
                      <span className="mono-label text-[10px] text-white font-black">{shift.date.split('-').slice(1).reverse().join('/')}</span>
                    </div>
                    
                    <div className="text-xs font-black text-white uppercase mb-1 truncate tracking-tight">{shift.title}</div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="signal-led signal-led-active" style={{ backgroundColor: meta.color, boxShadow: `0 0 5px ${meta.color}` }} />
                      <span className="mono-label text-[9px] text-text-muted uppercase">{shift.startTime} {shift.endTime ? `- ${shift.endTime}` : ''}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {shiftMembers.map((m) => (
                        <span key={m.id} className="mono-label text-[8px] px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-text-secondary uppercase">
                          {m.name.split(' ')[0]}
                        </span>
                      ))}
                    </div>

                    <button
                      id={`send-upcoming-${shift.id}`}
                      onClick={() => handleSendReminder(shift)}
                      disabled={sendingId === shift.id}
                      className="w-full py-2 rounded text-[9px] font-black uppercase bg-telegram text-white hover:brightness-110 disabled:opacity-50 transition-all active:scale-95 tracking-[0.1em]">
                      {sendingId === shift.id ? 'ENVIANDO_SINAL...' : 'ENVIAR_LEMBRETE'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rack Modal */}
      {showModal && selectedDate && (
        <AddShiftModal
          date={selectedDate}
          members={members}
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            onAddShift({ ...data, date: selectedDate });
            setShowModal(false);
            toast.success('Escala adicionada!');
          }}
        />
      )}
    </div>
  );
}


