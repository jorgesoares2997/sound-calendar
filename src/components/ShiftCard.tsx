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
    <div className="bg-[#111219] border border-white/[0.06] rounded-xl p-4 border-l-4 hover:border-white/10 transition-all"
      style={{ borderLeftColor: meta.color }}>
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap text-left">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#f0f1f6]">{shift.title}</span>
            <span className="text-[10px] text-[#5a5f75]">{shift.date}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: meta.color, background: `${meta.color}20`, borderColor: `${meta.color}40` }}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onSendReminder && (
            <button 
              onClick={onSendReminder} 
              disabled={isSending}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#229ED9] text-white hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1"
            >
              {isSending ? '⏳' : '📨'} {isSending ? 'Enviando...' : 'Lembrar'}
            </button>
          )}
          {onEdit && (
            <button 
              onClick={onEdit}
              className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-purple-400 hover:bg-violet-500/20 transition-all flex items-center justify-center text-sm"
              title="Editar"
            >
              ✏️
            </button>
          )}
          <button 
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center text-sm"
            title="Excluir"
          >
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
