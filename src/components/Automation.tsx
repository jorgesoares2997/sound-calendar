'use client';

import { useState } from 'react';
import { 
  sendMonthlySummaryAction, 
  sendWeeklySummaryAction, 
  sendDailySummaryAction,
  getNotificationDraftAction,
  type SummaryType
} from '@/app/actions/notifications';
import { useAppStore } from '@/components/Providers';
import { ShiftCard } from './ShiftCard';
import { AddShiftModal } from './AddShiftModal';
import type { Shift } from '@/types';
import { 
  Calendar, 
  Clock, 
  Zap, 
  Search, 
  Bot, 
  Trash2,
  Terminal,
  Activity
} from 'lucide-react';

interface AutomationProps {
  toast: { success: (m: string) => void; error: (m: string) => void };
}

export function Automation({ toast }: AutomationProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ type: string; content: string } | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const { shifts, members, deleteShift, clearAllShifts, updateShift } = useAppStore();

  const handleNotify = async (type: SummaryType, action: () => Promise<any>) => {
    setLoading(type);
    const res = await action();
    setLoading(null);
    if (res.success) {
      toast.success(`Notificação enviada! (${res.emailsSent} e-mails)`);
    } else {
      toast.error(`Erro ao enviar: ${res.error}`);
    }
  };

  const handlePreview = async (type: SummaryType) => {
    setLoading(`preview-${type}`);
    const res = await getNotificationDraftAction(type);
    setLoading(null);
    if (res.success && res.draft) {
      setPreview({ type, content: res.draft });
    } else {
      toast.error(`Erro ao gerar prévia: ${res.error}`);
    }
  };

  const sortedShifts = [...shifts].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-10 w-full max-w-5xl mx-auto pb-20">
      {/* Module Header */}
      <div className="px-1 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Bot size={10} className="text-accent-primary animate-pulse" />
            <span className="mono-label text-[10px] text-accent-primary uppercase tracking-widest">ROBÔ_DE_ROTEAMENTO_SINAL // v3.0</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
            Núcleo_de_Automação
          </h1>
        </div>
        <button 
          onClick={clearAllShifts}
          className="px-6 py-2 rounded mono-label text-[10px] font-black bg-accent-red/5 border border-accent-red/20 text-accent-red hover:bg-accent-red/10 transition-all flex items-center gap-2 uppercase tracking-widest"
        >
          <Trash2 size={12} />
          LIMPEZA_FORÇADA_DE_BUFFERS
        </button>
      </div>

      {/* Main Control Rack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AutomationCard 
          title="Resumo Mensal" 
          desc="Roteia todos os módulos de sequência mensal para Telegram/Email."
          code="[MES]"
          icon={Calendar}
          type="monthly"
          loading={loading === 'monthly'}
          isPreviewLoading={loading === 'preview-monthly'}
          onSend={() => handleNotify('monthly', sendMonthlySummaryAction)}
          onPreview={() => handlePreview('monthly')}
        />
        <AutomationCard 
          title="Sequência Semanal" 
          desc="Filtra a janela Seg-Dom e aciona a transmissão."
          code="[SEM]"
          icon={Clock}
          type="weekly"
          loading={loading === 'weekly'}
          isPreviewLoading={loading === 'preview-weekly'}
          onSend={() => handleNotify('weekly', sendWeeklySummaryAction)}
          onPreview={() => handlePreview('weekly')}
        />
        <AutomationCard 
          title="Sinal Diário" 
          desc="Módulo de lembrete individual instantâneo para as tarefas de hoje."
          code="[DIA]"
          icon={Zap}
          type="daily"
          loading={loading === 'daily'}
          isPreviewLoading={loading === 'preview-daily'}
          onSend={() => handleNotify('daily', sendDailySummaryAction)}
          onPreview={() => handlePreview('daily')}
        />
      </div>

      {/* Module Monitor */}
      <div className="studio-panel rounded-lg flex flex-col">
        <div className="px-6 py-4 border-b border-white/[0.03] bg-black/20 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Activity size={10} className="text-text-muted animate-pulse" />
              <span className="mono-label text-[9px] text-text-muted uppercase tracking-widest">MONITOR_DE_MÓDULO_ATIVO</span>
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider">Sequências Carregadas</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="vu-meter h-3 w-12">
               {[...Array(4)].map((_, i) => <div key={i} className="vu-bar" style={{ animationDelay: `${i*0.2}s`, height: `${40 + i*15}%` }} />)}
             </div>
             <span className="mono-label text-[10px] text-accent-primary uppercase font-black">{shifts.length}_UNIDADES</span>
          </div>
        </div>

        <div className="p-6">
          {shifts.length === 0 ? (
            <div className="py-20 border border-dashed border-white/5 rounded flex flex-col items-center justify-center opacity-40">
              <span className="mono-label text-[10px] uppercase tracking-[0.2em]">NENHUM_SINAL_DETECTADO_NO_BUFFER</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedShifts.map(shift => (
                <ShiftCard 
                  key={shift.id}
                  shift={shift}
                  members={members}
                  onDelete={() => deleteShift(shift.id)}
                  onEdit={() => setEditingShift(shift)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Technical Documentation Module */}
      <div className="studio-panel rounded-lg p-8 border-l-4 border-accent-primary">
        <h3 className="mono-label text-xs text-white font-black flex items-center gap-3 mb-6 uppercase tracking-[0.2em]">
          <div className="w-8 h-8 rounded bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
            <Terminal size={14} className="text-accent-primary" />
          </div>
          PROTOCOLO_DE_ACIONAMENTO_CRON_EXTERNO
        </h3>
        <div className="space-y-6">
          <p className="text-xs text-text-secondary leading-relaxed uppercase tracking-tight">
            Os sinais são processados e roteados via endpoints REST. Para transmissões recorrentes automatizadas,
            interfira com a API interna usando o seguinte protocolo:
          </p>
          <div className="bg-black/60 border border-white/10 p-5 rounded-lg font-mono text-accent-cyan overflow-x-auto whitespace-pre text-[11px] leading-relaxed relative">
            <div className="absolute top-2 right-3 mono-label text-[8px] text-text-muted">SHELL_STDOUT</div>
{`# ACIONAR_SEQUÊNCIA_SEMANAL (SEG 08:00)
curl -X POST https://sound-calendar.io/api/notify/weekly

# ACIONAR_SINAL_DIÁRIO (DIARIAMENTE 07:00)
curl -X POST https://sound-calendar.io/api/notify/daily`}
          </div>
        </div>
      </div>

      {/* Modals remain functionally the same but benefit from global studio styles */}
      {editingShift && (
        <AddShiftModal 
          date={editingShift.date}
          members={members}
          onClose={() => setEditingShift(null)}
          onSave={(data) => {
            updateShift(editingShift.id, data);
            setEditingShift(null);
            toast.success('Escala atualizada!');
          }}
          initialData={editingShift}
        />
      )}

      {preview && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[5000] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setPreview(null)}
        >
          <div 
            className="studio-panel rounded-lg p-8 w-full max-w-xl shadow-2xl animate-slide-up relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="mono-label text-[9px] text-accent-primary uppercase tracking-widest">VISUALIZAÇÃO_PRÉVIA</span>
                <span className="text-xs font-black text-white uppercase tracking-widest">Rascunho de Carga Útil de Sinal</span>
              </div>
              <button onClick={() => setPreview(null)} className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center mono-label text-[10px] font-black text-text-muted hover:text-white transition-all uppercase">DEL</button>
            </div>
            
            <div className="bg-black/60 p-6 rounded border border-white/10 font-mono text-[12px] text-accent-primary/90 whitespace-pre-wrap max-h-[50vh] overflow-y-auto leading-relaxed shadow-inner">
              {preview.content}
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.03] flex flex-col gap-4">
              <span className="mono-label text-[8px] text-text-muted text-center italic uppercase tracking-widest">PROTOCOLO_TRANSMISSÃO: TELEGRAM_HTML + SMTP_RELAY</span>
              <button 
                onClick={() => setPreview(null)}
                className="w-full py-4 rounded mono-label text-xs font-black bg-white/5 text-text-secondary border border-white/10 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                FECHAR_JANELA_DE_VISUALIZAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AutomationCard({ title, desc, code, icon: Icon, loading, isPreviewLoading, onSend, onPreview }: any) {
  return (
    <div className="studio-card rounded-lg p-6 flex flex-col gap-6 group hover:border-accent-primary/50">
      <div className="flex items-center justify-between">
        <div className="w-14 h-14 rounded bg-black/40 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform text-accent-primary">
          <Icon size={24} />
        </div>
        <button 
          onClick={onPreview}
          disabled={loading || isPreviewLoading}
          className="px-2 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:bg-accent-primary/20 hover:text-accent-primary transition-all disabled:opacity-30"
          title="PRÉVIA_SINAL"
        >
          {isPreviewLoading ? '...' : <Search size={16} />}
        </button>
      </div>
      <div>
        <h4 className="text-sm font-black text-white uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] text-text-muted mt-2 leading-relaxed h-8 line-clamp-2 uppercase">{desc}</p>
      </div>
      <button 
        onClick={onSend}
        disabled={loading || isPreviewLoading}
        className={`
          w-full py-3 rounded mono-label text-[10px] font-black transition-all border uppercase tracking-widest
          ${loading ? 'bg-white/5 border-white/10 text-text-muted cursor-wait' : 'bg-accent-primary/5 border-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-white shadow-neon'}
        `}
      >
        {loading ? 'STATUS_TX_OCUPADO...' : 'EXECUTAR_SINAL_DE_TRANSMISSÃO'}
      </button>
    </div>
  );
}


