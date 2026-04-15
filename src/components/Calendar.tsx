'use client';

import { useState, useMemo } from 'react';
import type { Shift, Member, AppSettings, ShiftType } from '@/types';
import { buildReminderMessage, sendTelegramMessage } from '@/utils/telegram';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const SHIFT_TYPES: { value: ShiftType; label: string; color: string }[] = [
  { value: 'manha', label: '☀️ Manhã', color: '#f59e0b' },
  { value: 'tarde', label: '🌤️ Tarde', color: '#06b6d4' },
  { value: 'noite', label: '🌙 Noite', color: '#8b5cf6' },
  { value: 'culto', label: '⛪ Culto', color: '#7c3aed' },
  { value: 'ensaio', label: '🎵 Ensaio', color: '#22c55e' },
  { value: 'evento', label: '🎉 Evento', color: '#ef4444' },
];

function getShiftMeta(type: ShiftType) {
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
    if (!settings.botToken || !settings.groupChatId) {
      toast.error('Configure o bot e Chat ID em Configurações primeiro.');
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
    if (ok > 0) toast.success(`${ok} lembrete(s) enviado(s)! ✅`);
  };

  return (
    <div className="flex flex-col xl:grid xl:grid-cols-[1fr_300px] gap-5">
      {/* ─── Main Calendar ─── */}
      <div className="bg-[#161821] border border-white/[0.06] rounded-2xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button id="prev-month" onClick={prevMonth}
              className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#9296ab] hover:bg-white/[0.08] hover:text-white transition-all flex items-center justify-center text-lg">
              ‹
            </button>
            <h2 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent min-w-[160px] text-center">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button id="next-month" onClick={nextMonth}
              className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#9296ab] hover:bg-white/[0.08] hover:text-white transition-all flex items-center justify-center text-lg">
              ›
            </button>
          </div>
          <button id="btn-today" onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(todayStr); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-[#9296ab] hover:text-white hover:bg-white/[0.08] transition-all">
            Hoje
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[10px] sm:text-xs font-bold text-[#5a5f75] uppercase tracking-widest py-2">
              {w}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />;
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
                  aspect-square flex flex-col items-center justify-center gap-1 rounded-xl
                  text-xs sm:text-sm font-semibold transition-all duration-150 relative
                  ${isToday ? 'bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/30' : ''}
                  ${isSelected && !isToday ? 'bg-violet-500/10 border border-violet-500/40 text-purple-300' : ''}
                  ${!isToday && !isSelected ? 'text-[#9296ab] hover:bg-white/[0.04] hover:text-white' : ''}
                `}
              >
                <span>{day}</span>
                {dayShifts.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayShifts.slice(0, 3).map((s) => (
                      <span key={s.id} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full" style={{ background: getShiftMeta(s.type).color }} />
                    ))}
                    {dayShifts.length > 3 && <span className="text-[8px] text-[#5a5f75]">+</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected date bar */}
        {selectedDate && (
          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap px-3 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <span className="text-xs sm:text-sm font-semibold text-[#9296ab] capitalize">
              📅 {formatLong(selectedDate)}
            </span>
            <button id="btn-add-shift" onClick={() => setShowModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-md shadow-violet-500/30 hover:brightness-110 active:scale-95 transition-all">
              + Adicionar Escala
            </button>
          </div>
        )}

        {/* Shifts list */}
        {selectedDate && shiftsForSelected.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
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
        )}

        {selectedDate && shiftsForSelected.length === 0 && (
          <div className="mt-6 text-center py-10">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm text-[#9296ab]">Nenhuma escala neste dia.</p>
            <p className="text-xs text-[#5a5f75] mt-1">Clique em &quot;Adicionar Escala&quot; para criar uma.</p>
          </div>
        )}

        {!selectedDate && (
          <div className="mt-6 text-center py-8">
            <p className="text-sm text-[#5a5f75]">👆 Selecione um dia para ver ou adicionar escalas.</p>
          </div>
        )}
      </div>

      {/* ─── Upcoming sidebar ─── */}
      <div className="bg-[#161821] border border-white/[0.06] rounded-2xl p-4 xl:sticky xl:top-6 xl:self-start">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-[#f0f1f6]">🔔 Próximas Escalas</span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
            {upcomingShifts.length}
          </span>
        </div>

        {upcomingShifts.length === 0 ? (
          <p className="text-xs text-[#5a5f75] text-center py-8">Sem escalas nos próximos 7 dias.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingShifts.map((shift) => {
              const meta = getShiftMeta(shift.type);
              const d = parseDate(shift.date);
              const shiftMembers = shift.memberIds
                .map((id) => members.find((m) => m.id === id))
                .filter(Boolean) as Member[];
              return (
                <div key={shift.id} className="bg-[#111219] border border-white/[0.06] rounded-xl p-3 hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{ color: meta.color, background: `${meta.color}20`, borderColor: `${meta.color}40` }}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-[#5a5f75] font-mono capitalize">
                      {d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-[#f0f1f6] mb-1">{shift.title}</div>
                  {shift.startTime && (
                    <div className="text-[11px] text-[#5a5f75] font-mono mb-2">
                      🕐 {shift.startTime}{shift.endTime ? ` — ${shift.endTime}` : ''}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {shiftMembers.length === 0
                      ? <span className="text-[11px] text-[#5a5f75] italic">Sem membros</span>
                      : shiftMembers.map((m) => (
                        <span key={m.id} className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                          style={{ color: m.color, borderColor: `${m.color}44`, background: `${m.color}12` }}>
                          {m.name.split(' ')[0]}
                        </span>
                      ))
                    }
                  </div>
                  <button
                    id={`send-upcoming-${shift.id}`}
                    onClick={() => handleSendReminder(shift)}
                    disabled={sendingId === shift.id}
                    className="w-full py-1.5 rounded-lg text-xs font-bold bg-[#229ED9] text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                    {sendingId === shift.id ? '⏳ Enviando...' : '📨 Enviar Lembrete'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedDate && (
        <AddShiftModal
          date={selectedDate}
          members={members}
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            onAddShift({ ...data, date: selectedDate });
            setShowModal(false);
            toast.success('Escala adicionada! ✅');
          }}
        />
      )}
    </div>
  );
}

// ─── ShiftCard ───────────────────────────────────────────
interface ShiftCardProps {
  shift: Shift;
  members: Member[];
  onDelete: () => void;
  onSendReminder: () => void;
  isSending: boolean;
}

function ShiftCard({ shift, members, onDelete, onSendReminder, isSending }: ShiftCardProps) {
  const meta = getShiftMeta(shift.type);
  const assigned = shift.memberIds
    .map((id) => members.find((m) => m.id === id))
    .filter(Boolean) as Member[];

  return (
    <div className="bg-[#111219] border border-white/[0.06] rounded-xl p-4 border-l-4 hover:border-white/10 transition-all"
      style={{ borderLeftColor: meta.color }}>
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
          <span className="text-sm font-bold text-[#f0f1f6]">{shift.title}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: meta.color, background: `${meta.color}20`, borderColor: `${meta.color}40` }}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button id={`send-${shift.id}`} onClick={onSendReminder} disabled={isSending}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#229ED9] text-white hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1">
            {isSending ? '⏳' : '📨'} {isSending ? 'Enviando...' : 'Lembrar'}
          </button>
          <button onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center text-sm">
            🗑️
          </button>
        </div>
      </div>

      {shift.startTime && (
        <div className="text-xs text-[#5a5f75] font-mono mb-2">
          🕐 {shift.startTime}{shift.endTime ? ` — ${shift.endTime}` : ''}
        </div>
      )}
      {shift.notes && <p className="text-xs text-[#9296ab] italic mb-3">{shift.notes}</p>}

      <div className="flex flex-wrap gap-2 mt-2">
        {assigned.length === 0
          ? <span className="text-xs text-[#5a5f75] italic">Nenhum membro atribuído</span>
          : assigned.map((m) => (
            <span key={m.id} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ color: m.color, borderColor: `${m.color}55`, background: `${m.color}12` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
              {m.name}
            </span>
          ))
        }
      </div>
    </div>
  );
}

// ─── AddShiftModal ───────────────────────────────────────
interface AddShiftModalProps {
  date: string;
  members: Member[];
  onClose: () => void;
  onSave: (data: Omit<Shift, 'id' | 'createdAt' | 'date'>) => void;
}

function AddShiftModal({ date, members, onClose, onSave }: AddShiftModalProps) {
  const [form, setForm] = useState({
    title: '', type: 'culto' as ShiftType,
    startTime: '', endTime: '', memberIds: [] as string[], notes: '',
  });
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleMember = (id: string) => setForm((f) => ({
    ...f,
    memberIds: f.memberIds.includes(id) ? f.memberIds.filter((x) => x !== id) : [...f.memberIds, id],
  }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}>
      <div className="bg-[#161821] border border-white/10 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#f0f1f6]">➕ Nova Escala</h3>
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
