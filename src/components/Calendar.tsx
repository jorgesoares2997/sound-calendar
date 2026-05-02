'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Shift, Member, AppSettings, ShiftType } from '@/types';
import { buildReminderMessage, sendTelegramMessage } from '@/utils/telegram';
import { getEnvConfigStatusAction } from '@/app/actions/telegram';
import { ShiftCard } from './ShiftCard';
import { AddShiftModal } from './AddShiftModal';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const SHIFT_TYPES: { value: ShiftType; label: string; color: string }[] = [
  { value: 'manha', label: 'MANHÃ', color: '#3e5e82' },
  { value: 'tarde', label: 'TARDE', color: '#4b6458' },
  { value: 'noite', label: 'NOITE', color: '#5f5c55' },
  { value: 'culto', label: 'CULTO', color: '#3e5e82' },
  { value: 'ensaio', label: 'ENSAIO', color: '#4b6458' },
  { value: 'evento', label: 'EVENTO', color: '#ba1a1a' },
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
  const [showAllShiftsModal, setShowAllShiftsModal] = useState(false);
  const [showDeleteShiftsModal, setShowDeleteShiftsModal] = useState(false);
  const [selectedShiftIdsToDelete, setSelectedShiftIdsToDelete] = useState<string[]>([]);

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

  const shiftsForModalDay = useMemo(() => {
    const targetDate = selectedDate ?? todayStr;
    return shifts
      .filter((s) => s.date === targetDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, shifts, todayStr]);

  const allShiftsSorted = useMemo(
    () => [...shifts].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)),
    [shifts],
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

  const handleViewAllDayShifts = () => {
    if (!selectedDate) {
      setSelectedDate(todayStr);
    }
    setShowAllShiftsModal(true);
  };

  const toggleShiftForDeletion = (shiftId: string) => {
    setSelectedShiftIdsToDelete((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId],
    );
  };

  const handleDeleteSelectedShifts = () => {
    if (selectedShiftIdsToDelete.length === 0) {
      toast.info('Selecione ao menos uma escala para apagar.');
      return;
    }

    selectedShiftIdsToDelete.forEach((id) => onDeleteShift(id));
    toast.success(`${selectedShiftIdsToDelete.length} escala(s) apagada(s) com sucesso.`);
    setSelectedShiftIdsToDelete([]);
    setShowDeleteShiftsModal(false);
  };

  const handleDeleteAllShifts = () => {
    if (allShiftsSorted.length === 0) {
      toast.info('Nao ha escalas para apagar.');
      return;
    }

    allShiftsSorted.forEach((shift) => onDeleteShift(shift.id));
    toast.success('Todas as escalas foram apagadas.');
    setSelectedShiftIdsToDelete([]);
    setShowDeleteShiftsModal(false);
  };

  const handleSendReminder = async (shift: Shift) => {
    const isConfigured = (settings.botToken && settings.groupChatId) || (envStatus?.hasToken && envStatus?.hasChatId);
    if (!isConfigured) { toast.error('Configure o bot e Chat ID primeiro.'); return; }
    const assigned = shift.memberIds.map((id) => members.find((m) => m.id === id)).filter(Boolean) as Member[];
    if (assigned.length === 0) { toast.error('Nenhum membro atribuído.'); return; }

    setSendingId(shift.id);
    let ok = 0;
    for (const member of assigned) {
      const text = buildReminderMessage(settings.reminderMessage, member, shift);
      const res = await sendTelegramMessage(settings.botToken, settings.groupChatId, text);
      if (res.ok) ok++;
    }
    setSendingId(null);
    if (ok > 0) toast.success(`${ok} lembrete(s) enviado(s)!`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 animate-fade-in">
      {/* Calendar Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-light theme-text-primary tracking-tight">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <p className="theme-text-secondary font-medium mt-1">
              {shifts.filter(s => s.date.startsWith(`${viewYear}-${String(viewMonth+1).padStart(2, '0')}`)).length} sessões programadas
            </p>
          </div>
          <div className="flex items-center gap-4 theme-surface p-1 rounded-2xl shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-[var(--color-bg-card-hover)] rounded-xl transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest theme-text-secondary">Hoje</button>
            <button onClick={nextMonth} className="p-2 hover:bg-[var(--color-bg-card-hover)] rounded-xl transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="glass-card rounded-[32px] overflow-hidden theme-border-strong shadow-ambient">
          {/* Grid Container with horizontal scroll on mobile */}
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[700px] lg:min-w-0">
              {/* Weekday Labels */}
              <div className="grid grid-cols-7 theme-card-solid border-b theme-border">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="py-4 text-center text-[10px] font-bold theme-text-muted uppercase tracking-[0.2em]">
                    {w}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 min-h-[500px] lg:min-h-[600px]">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} className="border-r border-b theme-border theme-card-solid" />;
              const dateStr = toISODate(viewYear, viewMonth, day);
              const dayShifts = getShiftsForDay(day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    border-r border-b theme-border p-4 relative group transition-all min-h-[100px] flex flex-col items-start gap-2
                    ${isSelected ? 'bg-accent-primary/10' : 'hover:bg-[var(--color-bg-card-hover)]'}
                  `}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-accent-primary' : 'theme-text-muted'}`}>
                    {day}
                  </span>
                  
                  <div className="flex flex-col gap-1 w-full">
                    {dayShifts.slice(0, 3).map((s) => (
                      <div 
                        key={s.id} 
                        className="h-1.5 w-full rounded-full opacity-60"
                        style={{ backgroundColor: getShiftMeta(s.type).color }}
                      />
                    ))}
                    {dayShifts.length > 3 && (
                      <span className="text-[8px] font-black theme-text-muted uppercase">+{dayShifts.length - 3} mais</span>
                    )}
                  </div>

                  {isToday && (
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent-primary shadow-[0_0_8px_var(--color-accent-primary)]" />
                  )}
                </button>
              );
            })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <aside className="w-full lg:w-[360px] flex flex-col gap-8">
        <div className="glass-card p-8 rounded-[32px] theme-border-strong shadow-ambient flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold theme-text-primary tracking-tight">Próximos Módulos</h3>
            <span className="text-[10px] font-bold text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">7 Dias</span>
          </div>

          <div className="flex flex-col gap-6">
            {upcomingShifts.length === 0 ? (
              <div className="py-12 text-center opacity-40">
                <p className="text-xs font-medium uppercase tracking-widest">Nenhum sinal detectado</p>
              </div>
            ) : (
              upcomingShifts.map((shift) => (
                <div key={shift.id} className="group cursor-pointer">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary flex-shrink-0">
                      <span className="material-symbols-outlined">{getShiftMeta(shift.type).value === 'culto' ? 'church' : 'graphic_eq'}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold theme-text-primary group-hover:text-accent-primary transition-colors uppercase tracking-tight">{shift.title}</h4>
                      <p className="text-xs theme-text-secondary mt-0.5 font-medium">{shift.startTime} - {shift.date.split('-').reverse().slice(0, 2).join('/')}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t theme-border">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSendReminder(shift); }}
                      className="text-[10px] font-bold text-accent-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
                    >
                      {sendingId === shift.id ? 'Enviando...' : 'Enviar Lembrete'}
                      <span className="material-symbols-outlined text-[14px]">send</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleViewAllDayShifts}
            className="w-full mt-8 py-3 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest"
          >
            Ver Tudo
          </button>
          <button
            onClick={() => setShowDeleteShiftsModal(true)}
            className="w-full mt-3 py-3 text-xs font-bold text-red-500 border border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-50/70 dark:hover:bg-red-900/20 transition-colors uppercase tracking-widest"
          >
            Apagar Escalas
          </button>
        </div>

        {/* Selected Date Actions */}
        {selectedDate && (
          <div className="glass-card p-8 rounded-[32px] theme-border-strong bg-accent-primary text-white shadow-lift animate-slide-up">
            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-4">{formatLong(selectedDate)}</h4>
            <div className="flex flex-col gap-4">
              {shiftsForSelected.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-sm font-bold uppercase tracking-tight">{s.title}</span>
                  <span className="text-xs opacity-70">{s.startTime}</span>
                </div>
              ))}
              <button 
                onClick={() => setShowModal(true)}
                className="w-full mt-4 bg-white text-accent-primary py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all shadow-md"
              >
                + Nova Entrada
              </button>
            </div>
          </div>
        )}
      </aside>

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

      {showAllShiftsModal && (
        <div
          className="fixed inset-0 theme-overlay-soft backdrop-blur-sm z-[7000] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAllShiftsModal(false)}
        >
          <div
            className="glass-card rounded-[32px] w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 theme-border-strong shadow-lift"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest theme-text-muted">Escalas do Dia</p>
                <h3 className="text-2xl font-bold theme-text-primary">
                  {formatLong(selectedDate ?? todayStr)}
                </h3>
              </div>
              <button
                onClick={() => setShowAllShiftsModal(false)}
                className="px-3 py-2 text-xs font-bold rounded-xl theme-surface theme-text-secondary uppercase tracking-wider"
              >
                Fechar
              </button>
            </div>

            {shiftsForModalDay.length === 0 ? (
              <div className="py-10 text-center theme-text-muted text-sm font-medium">
                Nenhuma escala registrada para este dia.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {shiftsForModalDay.map((shift) => (
                  <div key={shift.id} className="theme-card-solid border theme-border rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold theme-text-primary uppercase tracking-tight">{shift.title}</h4>
                        <p className="text-xs theme-text-secondary mt-1">{shift.startTime} - {shift.endTime}</p>
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                        style={{
                          color: getShiftMeta(shift.type).color,
                          backgroundColor: `${getShiftMeta(shift.type).color}20`,
                        }}
                      >
                        {getShiftMeta(shift.type).label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteShiftsModal && (
        <div
          className="fixed inset-0 theme-overlay-soft backdrop-blur-sm z-[7100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDeleteShiftsModal(false)}
        >
          <div
            className="glass-card rounded-[32px] w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 theme-border-strong shadow-lift"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Gerenciar Exclusao</p>
                <h3 className="text-2xl font-bold theme-text-primary">Apagar escalas registradas</h3>
                <p className="text-xs theme-text-secondary mt-1">
                  Selecione uma ou mais escalas para apagar, ou remova tudo de uma vez.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteShiftsModal(false)}
                className="px-3 py-2 text-xs font-bold rounded-xl theme-surface theme-text-secondary uppercase tracking-wider"
              >
                Fechar
              </button>
            </div>

            {allShiftsSorted.length === 0 ? (
              <div className="py-10 text-center theme-text-muted text-sm font-medium">
                Nao ha escalas cadastradas.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {allShiftsSorted.map((shift) => {
                  const checked = selectedShiftIdsToDelete.includes(shift.id);
                  return (
                    <label
                      key={shift.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checked ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'theme-border theme-card-solid'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleShiftForDeletion(shift.id)}
                        className="w-4 h-4 accent-red-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold theme-text-primary uppercase tracking-tight">{shift.title}</p>
                        <p className="text-xs theme-text-secondary mt-1">
                          {formatLong(shift.date)} - {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                        {getShiftMeta(shift.type).label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleDeleteSelectedShifts}
                className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Apagar selecionadas
              </button>
              <button
                onClick={handleDeleteAllShifts}
                className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-300 text-red-600 hover:bg-red-50/70 dark:hover:bg-red-900/20 transition-colors"
              >
                Apagar todas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
