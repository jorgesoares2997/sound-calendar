'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/components/Providers';
import {
  getNotificationDraftAction,
  sendDailySummaryAction,
  sendMonthlySummaryAction,
  sendWeeklySummaryAction,
  type SummaryType,
} from '@/app/actions/notifications';

interface AutomationProps {
  toast: { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void };
}

export function Automation({ toast }: AutomationProps) {
  const { settings, setSettings: updateSettings, shifts, deleteShift } = useAppStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ type: SummaryType; content: string } | null>(null);
  const [showDeleteShiftsModal, setShowDeleteShiftsModal] = useState(false);
  const [selectedShiftIdsToDelete, setSelectedShiftIdsToDelete] = useState<string[]>([]);

  const allShiftsSorted = useMemo(
    () => [...shifts].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)),
    [shifts],
  );

  const formatLong = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
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

    selectedShiftIdsToDelete.forEach((id) => deleteShift(id));
    toast.success(`${selectedShiftIdsToDelete.length} escala(s) apagada(s) com sucesso.`);
    setSelectedShiftIdsToDelete([]);
    setShowDeleteShiftsModal(false);
  };

  const handleDeleteAllShifts = () => {
    if (allShiftsSorted.length === 0) {
      toast.info('Nao ha escalas para apagar.');
      return;
    }

    allShiftsSorted.forEach((shift) => deleteShift(shift.id));
    toast.success('Todas as escalas foram apagadas.');
    setSelectedShiftIdsToDelete([]);
    setShowDeleteShiftsModal(false);
  };

  const handleManualSend = async (
    type: SummaryType,
    action: () => Promise<{ success?: boolean; error?: string; emailsSent?: number }>,
  ) => {
    setLoading(`send-${type}`);
    console.info('[Automation] Sending notification', { type });
    const result = await action();
    setLoading(null);

    if (result.success) {
      const total = typeof result.emailsSent === 'number' ? ` (${result.emailsSent} e-mails)` : '';
      toast.success(`Notificação enviada com sucesso${total}`);
      console.info('[Automation] Notification sent successfully', { type, result });
      return;
    }

    console.error('[Automation] Failed to send notification', { type, result });
    toast.error(result.error || 'Falha ao enviar notificação');
  };

  const handlePreview = async (type: SummaryType) => {
    setLoading(`preview-${type}`);
    console.info('[Automation] Generating telegram preview', { type });
    const result = await getNotificationDraftAction(type);
    setLoading(null);

    if (!result.success || !result.draft) {
      console.error('[Automation] Failed to generate preview', { type, result });
      toast.error(result.error || `Falha ao gerar prévia ${type}. Verifique logs e dados das escalas.`);
      return;
    }

    console.info('[Automation] Preview generated', { type, chars: result.draft.length });
    toast.success(`Prévia ${type} gerada com sucesso.`);
    setPreview({ type, content: result.draft });
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-16 animate-fade-in">
      {/* Header Section */}
      <section className="space-y-4">
        <h1 className="text-5xl font-light theme-text-primary tracking-tight">Central de Automação</h1>
        <p className="text-lg theme-text-secondary max-w-2xl font-medium">
          Gerencie o ritmo criativo através de sinais e sequências orquestradas. Eficiência silenciosa, tempo perfeito.
        </p>
      </section>

      {/* Grid: Core Signals */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Daily Signal */}
        <div className="glass-card p-8 rounded-[32px] shadow-ambient theme-border-strong space-y-6 hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 bg-accent-primary/10 rounded-2xl flex items-center justify-center text-accent-primary">
            <span className="material-symbols-outlined text-3xl">sunny</span>
          </div>
          <div>
            <h3 className="text-xl font-bold theme-text-primary mb-2">Escala de Hoje</h3>
            <p className="theme-text-secondary text-sm font-medium">Lembretes automáticos enviados todas as manhãs para a equipe do dia.</p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold tracking-widest text-accent-primary uppercase">08:00 AM</span>
            <button 
              onClick={() => {
                updateSettings((prev) => ({ ...prev, dailyReminder: !prev.dailyReminder }));
                toast.info(`Escala de hoje ${!settings.dailyReminder ? 'ativada' : 'desativada'}`);
              }}
              className={`w-12 h-6 rounded-full p-1 transition-all ${settings.dailyReminder ? 'bg-accent-primary' : 'bg-slate-200 dark:bg-slate-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.dailyReminder ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Weekly Sequence */}
        <div className="glass-card p-8 rounded-[32px] shadow-ambient theme-border-strong space-y-6 hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 bg-accent-secondary/10 rounded-2xl flex items-center justify-center text-accent-secondary">
            <span className="material-symbols-outlined text-3xl">date_range</span>
          </div>
          <div>
            <h3 className="text-xl font-bold theme-text-primary mb-2">Sequência Semanal</h3>
            <p className="theme-text-secondary text-sm font-medium">Resumo da escala da próxima semana enviado todos os domingos.</p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold tracking-widest text-accent-primary uppercase">DOM 20:00</span>
            <button className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full p-1 opacity-50 cursor-not-allowed">
              <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        {/* Sync Protocol */}
        <div className="glass-card p-8 rounded-[32px] shadow-ambient theme-border-strong space-y-6 hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 bg-accent-tertiary/10 rounded-2xl flex items-center justify-center text-accent-tertiary">
            <span className="material-symbols-outlined text-3xl">sync</span>
          </div>
          <div>
            <h3 className="text-xl font-bold theme-text-primary mb-2">Protocolo de Sync</h3>
            <p className="theme-text-secondary text-sm font-medium">Sincronização em tempo real com calendários externos (Google/iCal).</p>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold tracking-widest text-accent-primary uppercase">Real-time</span>
            <button className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-full p-1 opacity-50 cursor-not-allowed">
              <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>
        </div>
      </section>

      {/* Manual Triggers */}
      <section className="glass-card p-8 rounded-[32px] shadow-ambient theme-border-strong space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold theme-text-primary tracking-tight">Disparo Manual de Notificações</h2>
            <p className="text-sm theme-text-secondary font-medium mt-1">
              Execute o envio mensal, semanal ou diário imediatamente, com prévia antes do disparo.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteShiftsModal(true)}
            className="px-4 py-2 text-xs font-bold text-red-500 border border-red-200 dark:border-red-900/40 rounded-xl hover:bg-red-50/70 dark:hover:bg-red-900/20 transition-colors uppercase tracking-widest"
          >
            Apagar Escalas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ManualTriggerCard
            title="Resumo Mensal"
            subtitle="Escalas do mês atual"
            sending={loading === 'send-monthly'}
            previewing={loading === 'preview-monthly'}
            onPreview={() => handlePreview('monthly')}
            onSend={() => handleManualSend('monthly', sendMonthlySummaryAction)}
          />
          <ManualTriggerCard
            title="Sequência Semanal"
            subtitle="Janela da semana atual"
            sending={loading === 'send-weekly'}
            previewing={loading === 'preview-weekly'}
            onPreview={() => handlePreview('weekly')}
            onSend={() => handleManualSend('weekly', sendWeeklySummaryAction)}
          />
          <ManualTriggerCard
            title="Escala de Hoje"
            subtitle="Escala de hoje"
            sending={loading === 'send-daily'}
            previewing={loading === 'preview-daily'}
            onPreview={() => handlePreview('daily')}
            onSend={() => handleManualSend('daily', sendDailySummaryAction)}
          />
        </div>
      </section>

      {/* Loaded Sequences & Protocol Info */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 glass-card rounded-[32px] p-8 theme-border-strong shadow-ambient">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold theme-text-primary tracking-tight">Sequências Ativas</h2>
            <button className="text-xs font-bold text-accent-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
              Ver Todas <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 theme-card-solid rounded-2xl border theme-border">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-bold theme-text-primary uppercase tracking-tight text-sm">Telegram Signal Bot</p>
                  <p className="text-[10px] theme-text-secondary font-medium uppercase tracking-widest mt-0.5">Status: Conectado</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase rounded-full tracking-wider">Online</span>
            </div>
            <div className="flex items-center justify-between p-5 theme-card-solid rounded-2xl border theme-border opacity-50">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                <div>
                  <p className="font-bold theme-text-primary uppercase tracking-tight text-sm">Email Digest</p>
                  <p className="text-[10px] theme-text-secondary font-medium uppercase tracking-widest mt-0.5">Status: Standby</p>
                </div>
              </div>
              <span className="px-3 py-1 theme-surface theme-text-muted text-[10px] font-bold uppercase rounded-full tracking-wider">Idle</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-[32px] p-8 border border-white/50 shadow-ambient bg-accent-primary text-white">
          <h2 className="text-2xl font-bold mb-6 tracking-tight">Protocolo de Gatilho Externo</h2>
          <div className="bg-white/10 rounded-2xl p-6 space-y-4 text-xs font-medium leading-relaxed backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Endpoint de API</span>
              <p className="font-bold">secure-relay.sound-calendar.io/v1/trigger</p>
            </div>
            <div className="h-px bg-white/10 my-4" />
            <p className="opacity-80 italic">O motor de harmonia do estúdio permite que você acione lembretes via webhooks externos.</p>
            <div className="pt-4 flex justify-between items-center">
              <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Ver. 2.4.0-Stable</span>
              <button className="px-4 py-2 bg-white text-accent-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">
                Regerar Chave
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Visualization */}
      <section className="h-48 rounded-[40px] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-end gap-1.5 h-12">
              {[0.4, 0.7, 0.3, 0.9, 0.5, 0.8, 0.4].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-accent-primary rounded-full animate-wave" 
                  style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }} 
                />
              ))}
            </div>
            <p className="text-[10px] font-bold theme-text-muted tracking-[0.3em] uppercase">Perfil de Som: Foco Calmo</p>
          </div>
        </div>
      </section>

      {preview && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5000] flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-2xl theme-surface rounded-3xl border theme-border shadow-xl p-6 md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent-primary">Prévia</p>
                <h3 className="text-xl font-bold theme-text-primary capitalize">
                  Notificação {preview.type}
                </h3>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider"
              >
                Fechar
              </button>
            </div>

            <pre className="theme-card-solid border theme-border rounded-2xl p-4 text-xs whitespace-pre-wrap max-h-[55vh] overflow-auto theme-text-secondary">
              {preview.content}
            </pre>
          </div>
        </div>
      )}

      {showDeleteShiftsModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5100] flex items-center justify-center p-4"
          onClick={() => setShowDeleteShiftsModal(false)}
        >
          <div
            className="w-full max-w-3xl theme-surface rounded-3xl border theme-border shadow-xl p-6 md:p-8 max-h-[85vh] overflow-y-auto"
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
                className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider"
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

interface ManualTriggerCardProps {
  title: string;
  subtitle: string;
  sending: boolean;
  previewing: boolean;
  onPreview: () => void;
  onSend: () => void;
}

function ManualTriggerCard({ title, subtitle, sending, previewing, onPreview, onSend }: ManualTriggerCardProps) {
  const busy = sending || previewing;

  return (
    <div className="p-5 rounded-2xl border theme-border theme-card-solid space-y-4">
      <div>
        <h3 className="text-base font-bold theme-text-primary">{title}</h3>
        <p className="text-xs theme-text-secondary mt-1">{subtitle}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onPreview}
          disabled={busy}
          className="flex-1 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-50"
        >
          {previewing ? 'Gerando...' : 'Prévia'}
        </button>
        <button
          onClick={onSend}
          disabled={busy}
          className="flex-1 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-accent-primary text-white disabled:opacity-50"
        >
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
