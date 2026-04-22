'use client';

import { useState, useEffect } from 'react';
import type { AppSettings } from '@/types';
import { validateBotToken, sendTelegramMessage } from '@/utils/telegram';
import { getEnvConfigStatusAction } from '@/app/actions/telegram';
import { 
  Send, 
  Cpu, 
  MessageSquare, 
  Check, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw,
  ShieldCheck,
  Settings2
} from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  toast: { success: (m: string) => void; error: (m: string) => void };
}

export function Settings({ settings, onSave, toast }: SettingsProps) {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [validating, setValidating] = useState(false);
  const [botName, setBotName] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [envStatus, setEnvStatus] = useState<{ hasToken: boolean; hasChatId: boolean; teamName: string | null } | null>(null);
  const [testMessage, setTestMessage] = useState('Sinal de teste do Sound Calendar!');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    getEnvConfigStatusAction().then(setEnvStatus);
  }, []);

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleValidate = async () => {
    setValidating(true); setBotName(null);
    const res = await validateBotToken(form.botToken);
    setValidating(false);
    if (res.ok) { setBotName(`${res.botName} (@${res.username})`); toast.success(`Bot validado: @${res.username}`); }
    else toast.error(`Token inválido: ${res.error}`);
  };

  const handleSave = () => { onSave(form); toast.success('Ajustes salvos!'); };
  const handleReset = () => { setForm({ ...settings }); setBotName(null); };

  const handleSendTest = async () => {
    if (!testMessage.trim()) return;
    setSendingTest(true);
    const result = await sendTelegramMessage(form.botToken, form.groupChatId, testMessage);
    setSendingTest(false);
    if (result.ok) toast.success('Mensagem de teste enviada!');
    else toast.error(`Erro ao enviar teste: ${result.error}`);
  };

  const previewMsg = form.reminderMessage
    .replace('{member}', '*Jorge Soares*')
    .replace('{date}', 'domingo, 20 de abril de 2025')
    .replace('{shift}', 'Culto da Manhã')
    .replace('{time}', '08:00');

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-20">
      {/* Module Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Settings2 size={12} className="text-accent-primary" />
          <span className="mono-label text-[10px] text-accent-primary uppercase tracking-widest">CONFIG_NÚCLEO_SISTEMA // v2.0</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
          Ajustes_Mestres
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Telegram Rack */}
        <div className="studio-panel rounded-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-black/20 border-b border-white/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-telegram/10 border border-telegram/20 flex items-center justify-center">
                <Send size={14} className="text-telegram" />
              </div>
              <span className="mono-label text-[10px] text-white font-black uppercase tracking-widest">Link_Sinal_Telegram</span>
            </div>
            <div className="signal-led signal-led-active" style={{ backgroundColor: 'var(--color-telegram)', boxShadow: '0 0 5px var(--color-telegram)' }} />
          </div>

          <div className="p-6 flex flex-col gap-6">
            <Field label="BUFFER_TOKEN_BOT">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showToken ? 'text' : 'password'}
                    className="studio-input font-mono text-[11px] pr-10"
                    placeholder="INSERIR_TOKEN..."
                    value={form.botToken}
                    onChange={(e) => { set('botToken', e.target.value); setBotName(null); }}
                  />
                  <button type="button" onClick={() => setShowToken((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button onClick={handleValidate} disabled={!form.botToken || validating}
                  className="px-4 py-2 rounded mono-label text-[10px] font-black bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all uppercase flex items-center gap-2">
                  {validating ? 'TX_...' : <Check size={14} />}
                  VALIDAR
                </button>
              </div>
              {botName && (
                <div className="mt-2 px-3 py-2 bg-accent-green/5 border border-accent-green/20 rounded mono-label text-[9px] text-accent-green uppercase tracking-widest">
                  LINK_ESTABELECIDO: {botName}
                </div>
              )}
            </Field>

            <Field label="ID_CHAT_DESTINO">
              <input className="studio-input font-mono text-[11px]" placeholder="-100123456789"
                value={form.groupChatId} onChange={(e) => set('groupChatId', e.target.value)} />
            </Field>
          </div>
        </div>

        {/* App Rack */}
        <div className="studio-panel rounded-lg overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-black/20 border-b border-white/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                <Cpu size={14} className="text-accent-primary" />
              </div>
              <span className="mono-label text-[10px] text-white font-black uppercase tracking-widest">Parâmetros_Aplicação</span>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <Field label="IDENTIDADE_EQUIPE">
              <input className="studio-input font-bold uppercase tracking-wider" placeholder="EQUIPE_SOM_ALFA" value={form.teamName}
                onChange={(e) => set('teamName', e.target.value)} />
            </Field>

            <div className="p-4 bg-black/40 border border-white/5 rounded-lg space-y-3">
              <div className="mono-label text-[9px] text-text-muted uppercase tracking-widest border-b border-white/5 pb-2">LEITURA_INTEGRAÇÃO</div>
              <StatusRow label="LINK_SINAL" ok={!!form.botToken || !!envStatus?.hasToken} isEnv={!!envStatus?.hasToken && !form.botToken} />
              <StatusRow label="ROTA_DESTINO" ok={!!form.groupChatId || !!envStatus?.hasChatId} isEnv={!!envStatus?.hasChatId && !form.groupChatId} />
            </div>
          </div>
        </div>

        {/* Template Rack */}
        <div className="studio-panel rounded-lg overflow-hidden flex flex-col lg:col-span-2">
          <div className="px-6 py-4 bg-black/20 border-b border-white/[0.03] flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <MessageSquare size={14} className="text-accent-green" />
            </div>
            <span className="mono-label text-[10px] text-white font-black uppercase tracking-widest">Síntese_Payload_Mensagem</span>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-6">
              <Field label="TEMPLATE_PAYLOAD">
                <textarea className="studio-input resize-y min-h-[160px] font-mono text-[11px] leading-relaxed"
                  value={form.reminderMessage} onChange={(e) => set('reminderMessage', e.target.value)} />
              </Field>
              <div className="flex flex-wrap gap-2">
                {['{member}', '{date}', '{shift}', '{time}'].map((v) => (
                  <span key={v} className="mono-label text-[9px] px-2 py-1 rounded bg-accent-primary/10 border border-accent-primary/20 text-accent-primary font-black uppercase tracking-widest">{v}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="mono-label text-[9px] text-text-muted uppercase tracking-widest">TELA_VIRTUAL_SIMULAÇÃO_REALTIME</span>
              <div className="flex-1 bg-[#121212] border border-white/5 rounded p-6 shadow-inner relative overflow-hidden flex items-center justify-center">
                 <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                 <div className="z-10 bg-telegram/90 text-white text-[11px] leading-relaxed p-4 rounded-lg shadow-2xl max-w-xs relative border border-white/10 uppercase tracking-tight">
                    {previewMsg}
                    <div className="absolute top-0 right-full mr-2 h-0 w-0 border-[6px] border-transparent border-r-telegram/90" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Master Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-black/80 backdrop-blur-2xl border-t border-white/10 p-4 flex items-center justify-end gap-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={handleReset}
          className="px-6 py-2.5 rounded mono-label text-[10px] font-black bg-white/5 border border-white/10 text-text-muted hover:text-white transition-all uppercase tracking-widest flex items-center gap-2">
          <RotateCcw size={12} />
          RESETAR_BUFFERS
        </button>
        <button onClick={handleSave}
          className="px-10 py-3 rounded mono-label text-xs font-black bg-accent-primary text-white shadow-neon hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center gap-3">
          <Save size={16} />
          COMMITAR_ALTERAÇÕES
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="mono-label text-[9px] text-text-muted uppercase tracking-[0.2em]">{label}</span>
      {children}
    </div>
  );
}

function StatusRow({ label, ok, isEnv }: { label: string; ok: boolean; isEnv?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {ok ? <ShieldCheck size={10} className="text-accent-green" /> : <ShieldCheck size={10} className="text-text-muted opacity-40" />}
        <span className="mono-label text-[8px] text-text-muted uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`mono-label text-[9px] font-black ${ok ? 'text-accent-green' : 'text-text-muted opacity-40'} uppercase`}>
          {ok ? (isEnv ? 'SYNC_ENV' : 'SYNC_OK') : 'OFFLINE'}
        </span>
        <div className={`signal-led ${ok ? 'signal-led-active' : ''}`} style={ok ? { backgroundColor: 'var(--color-accent-green)', boxShadow: '0 0 5px var(--color-accent-green)' } : { backgroundColor: '#333' }} />
      </div>
    </div>
  );
}
