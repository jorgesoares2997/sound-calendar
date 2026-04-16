'use client';

import { useState } from 'react';
import { 
  sendMonthlySummaryAction, 
  sendWeeklySummaryAction, 
  sendDailySummaryAction,
  getNotificationDraftAction,
  type SummaryType
} from '@/app/actions/notifications';

interface AutomationProps {
  toast: { success: (m: string) => void; error: (m: string) => void };
}

export function Automation({ toast }: AutomationProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ type: string; content: string } | null>(null);

  const handleNotify = async (type: SummaryType, action: () => Promise<any>) => {
    setLoading(type);
    const res = await action();
    setLoading(null);
    if (res.success) {
      toast.success(`Notificação enviada! ✈️ (${res.emailsSent} e-mails)`);
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

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent leading-tight">
          🤖 Automações de Notificação
        </h1>
        <p className="text-sm text-[#5a5f75] mt-1 pr-4">Resumos via Telegram e E-mail para toda a equipe</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AutomationCard 
          title="Resumo Mensal" 
          desc="Envia todas as escalas do mês por Telegram e E-mail."
          icon="🗓️"
          type="monthly"
          loading={loading === 'monthly'}
          isPreviewLoading={loading === 'preview-monthly'}
          onSend={() => handleNotify('monthly', sendMonthlySummaryAction)}
          onPreview={() => handlePreview('monthly')}
        />
        <AutomationCard 
          title="Resumo Semanal" 
          desc="Escalas de segunda a domingo para os escalados."
          icon="📅"
          type="weekly"
          loading={loading === 'weekly'}
          isPreviewLoading={loading === 'preview-weekly'}
          onSend={() => handleNotify('weekly', sendWeeklySummaryAction)}
          onPreview={() => handlePreview('weekly')}
        />
        <AutomationCard 
          title="Escala de Hoje" 
          desc="Lembrete individual direto para o e-mail e grupo."
          icon="🔔"
          type="daily"
          loading={loading === 'daily'}
          isPreviewLoading={loading === 'preview-daily'}
          onSend={() => handleNotify('daily', sendDailySummaryAction)}
          onPreview={() => handlePreview('daily')}
        />
      </div>

      {/* Info Box */}
      <div className="bg-[#161821] border border-white/[0.06] rounded-2xl p-5 sm:p-6 space-y-4 mx-1">
        <h3 className="text-sm font-bold text-[#f0f1f6] flex items-center gap-2">
          <span className="text-lg">⚙️</span> Como automatizar (via Cron)?
        </h3>
        <div className="text-xs text-[#9296ab] space-y-3 leading-relaxed">
          <p>
            As mensagens agora são enviadas tanto para o **Telegram** do grupo quanto para o **E-mail** individual de cada técnico escalado.
          </p>
          <div className="bg-[#0a0b0f] p-4 rounded-xl font-mono text-purple-300 overflow-x-auto whitespace-pre text-[10px] sm:text-xs">
{`# Exemplo de Cron (Segunda às 08:00)
curl -X POST https://seu-app.com/api/notify/weekly`}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[5000] flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setPreview(null)}
        >
          <div 
            className="bg-[#161821] border border-white/10 rounded-3xl p-5 sm:p-8 w-full max-w-lg shadow-2xl animate-slide-up relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">🔍</span>
                Prévia da Mensagem
              </h3>
              <button 
                onClick={() => setPreview(null)} 
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#5a5f75] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-[#0a0b0f] p-5 rounded-2xl border border-white/5 font-mono text-[12px] sm:text-[13px] text-purple-200/90 whitespace-pre-wrap max-h-[50vh] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
              {preview.content}
            </div>

            <div className="mt-6 sm:mt-8 pt-4 border-t border-white/5 flex flex-col gap-3">
              <div className="text-[10px] text-[#5a5f75] text-center italic">
                * Esta mensagem será enviada ao Telegram e replicada via E-mail.
              </div>
              <button 
                onClick={() => setPreview(null)}
                className="w-full py-3 rounded-xl text-xs font-bold bg-white/5 text-[#9296ab] border border-white/10 hover:text-white hover:bg-white/10 transition-all font-mono"
              >
                FECHAR VISUALIZAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AutomationCard({ title, desc, icon, loading, isPreviewLoading, onSend, onPreview }: any) {
  return (
    <div className="bg-[#161821] border border-white/[0.06] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 hover:border-white/10 hover:shadow-2xl hover:shadow-purple-500/5 transition-all group relative">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <button 
          onClick={onPreview}
          disabled={loading || isPreviewLoading}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm hover:bg-white/10 transition-all disabled:opacity-30 shadow-sm"
          title="Ver prévia"
        >
          {isPreviewLoading ? '...' : '🔍'}
        </button>
      </div>
      <div>
        <h4 className="text-base font-bold text-[#f0f1f6]">{title}</h4>
        <p className="text-xs text-[#5a5f75] mt-1.5 leading-relaxed">{desc}</p>
      </div>
      <button 
        onClick={onSend}
        disabled={loading || isPreviewLoading}
        className="mt-2 w-full py-3 rounded-xl text-xs font-bold bg-white/[0.04] border border-white/[0.1] text-white hover:bg-white/[0.08] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? '⏳ Enviando...' : '✈️ Enviar Agora'}
      </button>
    </div>
  );
}
