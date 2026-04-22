'use client';

import type { Shift, Member, ShiftType } from '@/types';
import { SHIFT_TYPES } from './Calendar';

interface ShiftCardProps {
  shift: Shift;
  members: Member[];
  onDelete: () => void;
  onEdit?: () => void;
  onSendReminder?: () => void;
  isSending?: boolean;
}

export function getShiftMeta(type: ShiftType) {
  return SHIFT_TYPES.find((s) => s.value === type) ?? SHIFT_TYPES[0];
}

export function ShiftCard({ shift, members, onDelete, onEdit, onSendReminder, isSending }: ShiftCardProps) {
  const meta = getShiftMeta(shift.type);
  const assigned = shift.memberIds
    .map((id) => members.find((m) => m.id === id))
    .filter(Boolean) as Member[];

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 group hover:shadow-lift transition-all border-l-4" style={{ borderLeftColor: meta.color }}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-accent-primary uppercase tracking-widest mb-1">{meta.label}</span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">{shift.title}</h4>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button onClick={onEdit} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          )}
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all">
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 py-3 border-y border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{shift.startTime} - {shift.endTime || '--:--'}</span>
        </div>
        <div className="flex -space-x-2">
          {assigned.map((m) => (
            <div 
              key={m.id} 
              className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              style={{ backgroundColor: m.color }}
              title={m.name}
            >
              {m.name[0]}
            </div>
          ))}
          {assigned.length === 0 && <span className="text-[10px] text-slate-400 italic">Sem operadores</span>}
        </div>
      </div>

      {shift.notes && (
        <p className="text-xs text-slate-500 italic line-clamp-2">{shift.notes}</p>
      )}

      {onSendReminder && (
        <button 
          onClick={onSendReminder} 
          disabled={isSending}
          className={`
            w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
            ${isSending ? 'bg-slate-100 text-slate-400' : 'bg-accent-primary text-white hover:opacity-90 shadow-sm'}
          `}
        >
          <span className="material-symbols-outlined text-sm">{isSending ? 'sync' : 'send'}</span>
          {isSending ? 'Enviando...' : 'Enviar Sinal'}
        </button>
      )}
    </div>
  );
}


