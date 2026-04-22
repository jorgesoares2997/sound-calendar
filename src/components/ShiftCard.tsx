'use client';

import type { Shift, Member, ShiftType } from '@/types';
import { SHIFT_TYPES } from './Calendar';
import { Trash2, Settings2, SendHorizontal } from 'lucide-react';

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
    <div className="studio-card rounded border-t-2 overflow-hidden" style={{ borderTopColor: meta.color }}>
      {/* Top Console Strip */}
      <div className="px-4 py-2 bg-black/40 border-b border-white/[0.03] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="signal-led signal-led-active" style={{ backgroundColor: meta.color, boxShadow: `0 0 5px ${meta.color}` }} />
          <span className="mono-label text-[9px] text-text-muted uppercase tracking-widest">{meta.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button onClick={onEdit} className="px-2 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white transition-all gap-1.5">
              <Settings2 size={10} />
              <span className="mono-label text-[8px] font-black uppercase">AJUSTE</span>
            </button>
          )}
          <button onClick={onDelete} className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-accent-red transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Main Content Module */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="mono-label text-[8px] text-text-muted mb-1 uppercase tracking-widest">TÍTULO_MÓDULO</div>
          <h4 className="text-sm font-black text-white uppercase tracking-tight truncate">{shift.title}</h4>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="mono-label text-[8px] text-text-muted mb-1 uppercase tracking-widest">SYNC_HORÁRIO</div>
            <div className="text-xs font-black text-white mono-label">
              {shift.startTime || '--:--'} <span className="opacity-20 mx-1">&gt;&gt;</span> {shift.endTime || '--:--'}
            </div>
          </div>
          {onSendReminder && (
            <button 
              onClick={onSendReminder} 
              disabled={isSending}
              className={`
                px-3 py-1.5 rounded mono-label text-[9px] font-black transition-all uppercase tracking-widest flex items-center gap-2
                ${isSending ? 'bg-white/10 text-text-muted' : 'bg-telegram text-white shadow-lg hover:brightness-110 active:scale-95'}
              `}
            >
              {isSending ? 'TX_...' : (
                <>
                  <SendHorizontal size={10} />
                  ENVIAR_TX
                </>
              )}
            </button>
          )}
        </div>

        {shift.notes && (
          <div className="p-2 bg-black/20 border border-white/5 rounded">
            <span className="mono-label text-[7px] text-text-muted block mb-1 uppercase tracking-widest">NOTAS_MÓDULO</span>
            <p className="text-[10px] text-text-secondary leading-tight italic">{shift.notes}</p>
          </div>
        )}

        <div className="pt-2 border-t border-white/[0.03]">
          <div className="mono-label text-[8px] text-text-muted mb-2 uppercase tracking-widest">OPERADORES_ATRIBUÍDOS</div>
          <div className="flex flex-wrap gap-1.5">
            {assigned.length === 0 ? (
              <span className="mono-label text-[8px] text-accent-red/60 uppercase font-black">Nenhum_Operador_Vinculado</span>
            ) : (
              assigned.map((m) => (
                <div key={m.id} className="flex items-center gap-2 px-2 py-1 rounded bg-black/40 border border-white/5">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: m.color, boxShadow: `0 0 3px ${m.color}` }} />
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{m.name.split(' ')[0]}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Decorative Bottom Meter */}
      <div className="h-1 w-full bg-black/60 flex gap-[1px] px-1">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="h-full flex-1 bg-white/[0.02]" />
        ))}
      </div>
    </div>
  );
}


