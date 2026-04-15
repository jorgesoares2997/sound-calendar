'use client';

import { useState, useEffect } from 'react';
import type { AppSettings } from '@/types';
import { validateBotToken, sendTelegramMessage } from '@/utils/telegram';
import { getEnvConfigStatusAction } from '@/app/actions/telegram';

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
  const [testMessage, setTestMessage] = useState('🧪 Mensagem de teste do Sound Calendar!');
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
    if (res.ok) { setBotName(`${res.botName} (@${res.username})`); toast.success(`Bot validado: @${res.username} ✅`); }
    else toast.error(`Token inválido: ${res.error}`);
  };

  const handleSave = () => { onSave(form); toast.success('Configurações salvas! ✅'); };
  const handleReset = () => { setForm({ ...settings }); setBotName(null); };

  const handleSendTest = async () => {
    if (!testMessage.trim()) return;
    setSendingTest(true);
    
    // Correct way:
    const result = await sendTelegramMessage(form.botToken, form.groupChatId, testMessage);
    setSendingTest(false);
    
    if (result.ok) toast.success('Mensagem de teste enviada! ✅');
    else toast.error(`Erro ao enviar teste: ${result.error}`);
  };

  const previewMsg = form.reminderMessage
    .replace('{member}', '*Jorge Soares*')
    .replace('{date}', 'domingo, 20 de abril de 2025')
    .replace('{shift}', 'Culto da Manhã')
    .replace('{time}', '08:00');

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent leading-tight">
          ⚙️ Configurações
        </h1>
        <p className="text-sm text-[#5a5f75] mt-1">Configure o bot e personalize a aplicação</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ─── Telegram Bot ─── */}
        <div className="bg-[#161821] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3.5 px-6 py-4 bg-white/[0.02] border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/25 flex items-center justify-center text-xl">✈️</div>
            <div>
              <div className="text-sm font-bold text-[#f0f1f6]">Telegram Bot</div>
              <div className="text-xs text-[#5a5f75]">Configure o bot para enviar lembretes</div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* How-to */}
            <div className="bg-[#111219] border border-white/[0.06] rounded-xl p-4 text-sm text-[#9296ab]">
              <strong className="block text-[#f0f1f6] mb-2">Como criar um bot:</strong>
              <ol className="list-decimal list-inside flex flex-col gap-1.5 text-xs">
                <li>Abra o Telegram e busque por <code className="font-mono bg-white/[0.07] px-1.5 py-0.5 rounded text-cyan-400">@BotFather</code></li>
                <li>Envie <code className="font-mono bg-white/[0.07] px-1.5 py-0.5 rounded text-cyan-400">/newbot</code> e siga as instruções</li>
                <li>Copie o token gerado e cole abaixo</li>
                <li>Adicione o bot ao seu grupo e obtenha o Chat ID</li>
              </ol>
            </div>

            <Field label="Token do Bot">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="bot-token"
                    type={showToken ? 'text' : 'password'}
                    className={inputCls + ' font-mono text-xs pr-10'}
                    placeholder="123456789:AAF..."
                    value={form.botToken}
                    onChange={(e) => { set('botToken', e.target.value); setBotName(null); }}
                  />
                  <button type="button" onClick={() => setShowToken((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5f75] hover:text-white transition-colors text-xs">
                    {showToken ? '🙈' : '👁️'}
                  </button>
                </div>
                <button id="btn-validate-token" onClick={handleValidate} disabled={!form.botToken || validating}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/[0.04] border border-white/[0.08] text-[#9296ab] hover:text-white hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0">
                  {validating ? '⏳' : '🔍'} {validating ? '' : 'Validar'}
                </button>
              </div>
              {botName && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-green-500/10 border border-green-500/25 rounded-xl text-xs text-[#22c55e] font-semibold">
                  ✅ Conectado: {botName}
                </div>
              )}
            </Field>

            <Field label="Chat ID do Grupo / Canal">
              <input id="group-chat-id" className={inputCls + ' font-mono'} placeholder="-100123456789"
                value={form.groupChatId} onChange={(e) => set('groupChatId', e.target.value)} />
              <p className="text-xs text-[#5a5f75] mt-1.5">
                Grupos geralmente começam com -100. O bot deve ser membro do grupo.{' '}
                <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors">Como obter? ↗</a>
              </p>
            </Field>
          </div>
        </div>

        {/* ─── App Config ─── */}
        <div className="bg-[#161821] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3.5 px-6 py-4 bg-white/[0.02] border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-xl">🎛️</div>
            <div>
              <div className="text-sm font-bold text-[#f0f1f6]">Equipe &amp; Aplicação</div>
              <div className="text-xs text-[#5a5f75]">Personalize o nome e as notificações</div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <Field label="Nome da Equipe">
              <input id="team-name" className={inputCls} placeholder="Sound Team" value={form.teamName}
                onChange={(e) => set('teamName', e.target.value)} />
            </Field>

            {/* Status summary */}
            <div className="bg-[#111219] border border-white/[0.06] rounded-xl p-4">
              <div className="text-xs font-bold text-[#5a5f75] uppercase tracking-widest mb-3">Status da Integração</div>
              <div className="flex flex-col gap-2">
                <StatusRow label="Bot Token" ok={!!form.botToken || !!envStatus?.hasToken} isEnv={!!envStatus?.hasToken && !form.botToken} />
                <StatusRow label="Chat ID" ok={!!form.groupChatId || !!envStatus?.hasChatId} isEnv={!!envStatus?.hasChatId && !form.groupChatId} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Message Template ─── */}
        <div className="bg-[#161821] border border-white/[0.06] rounded-2xl overflow-hidden lg:col-span-2">
          <div className="flex items-center gap-3.5 px-6 py-4 bg-white/[0.02] border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center text-xl">💬</div>
            <div>
              <div className="text-sm font-bold text-[#f0f1f6]">Modelo de Mensagem</div>
              <div className="text-xs text-[#5a5f75]">Personalize a mensagem enviada via Telegram</div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Variables */}
            <div className="bg-[#111219] border border-white/[0.06] rounded-xl p-4">
              <div className="text-xs font-bold text-[#5a5f75] uppercase tracking-widest mb-3">Variáveis disponíveis</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {['{member}', '{date}', '{shift}', '{time}'].map((v) => (
                  <span key={v} className="font-mono px-2 py-1 rounded-lg bg-violet-600/15 border border-violet-500/25 text-purple-300">{v}</span>
                ))}
                <span className="text-[#5a5f75] self-center">• Use *texto* para negrito</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Mensagem">
                <textarea id="reminder-message" className={`${inputCls} resize-y min-h-[140px] font-mono text-xs leading-relaxed`}
                  value={form.reminderMessage} onChange={(e) => set('reminderMessage', e.target.value)} />
              </Field>

              <Field label="Pré-visualização (como aparece no Telegram)">
                <div className="flex flex-col gap-2">
                  <div className="bg-[#229ED9] text-white text-xs leading-relaxed p-4 rounded-[4px_18px_18px_18px] shadow-lg max-w-xs"
                    style={{ boxShadow: '0 4px 20px rgba(34,158,217,0.25)' }}>
                    {previewMsg}
                  </div>
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* ─── Test Sending ─── */}
        <div className="bg-[#161821] border border-white/[0.06] rounded-2xl overflow-hidden lg:col-span-2">
          <div className="flex items-center gap-3.5 px-6 py-4 bg-white/[0.02] border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-xl">🧪</div>
            <div>
              <div className="text-sm font-bold text-[#f0f1f6]">Testar Envio</div>
              <div className="text-xs text-[#5a5f75]">Envie uma mensagem manual para verificar a conexão</div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
              <Field label="Mensagem de Teste">
                <input 
                  id="test-message-input"
                  className={inputCls} 
                  placeholder="Digite algo para testar..." 
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </Field>
              <button 
                id="btn-send-test"
                onClick={handleSendTest}
                disabled={sendingTest || !testMessage.trim()}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#229ED9] text-white shadow-lg shadow-[#229ED9]/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 h-[42px]"
              >
                {sendingTest ? '⏳ Enviando...' : '✈️ Enviar Teste'}
              </button>
            </div>
            {(!form.botToken && !envStatus?.hasToken) && (
              <p className="text-[11px] text-amber-500 font-medium">
                ⚠️ O bot não está configurado. O envio irá falhar.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#161821] border border-white/[0.06] rounded-2xl sticky bottom-0">
        <button onClick={handleReset}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-[#9296ab] bg-white/[0.04] border border-white/[0.08] hover:text-white hover:bg-white/[0.08] transition-all">
          ↩️ Descartar
        </button>
        <button id="btn-save-settings" onClick={handleSave}
          className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/30 hover:brightness-110 active:scale-95 transition-all">
          💾 Salvar Configurações
        </button>
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

function StatusRow({ label, ok, isEnv }: { label: string; ok: boolean; isEnv?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#9296ab]">{label}</span>
      <span className={`text-xs font-bold flex items-center gap-1 ${ok ? 'text-[#22c55e]' : 'text-[#5a5f75]'}`}>
        {ok ? (isEnv ? '✅ via .env' : '✅ Configurado') : '⚠️ Não configurado'}
      </span>
    </div>
  );
}
