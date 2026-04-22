'use client';

import { useMemo, useRef } from 'react';
import type { AppSettings, Member, Shift } from '@/types';
import { expandReminderTemplate, formatReminderPreviewHtml } from '@/utils/telegram';

const PREVIEW_MEMBER: Member = {
  id: 'preview-member',
  name: 'Maria Silva',
  role: 'Técnico de Som',
  telegramId: 'mariasilva',
  email: 'maria@exemplo.com',
  phone: '',
  color: '#3e5e82',
  active: true,
};

const PREVIEW_SHIFT: Shift = {
  id: 'preview-shift',
  date: '2026-04-27',
  title: 'Culto da Manhã',
  type: 'culto',
  startTime: '09:30',
  endTime: '12:00',
  memberIds: [PREVIEW_MEMBER.id],
  notes: '',
  createdAt: new Date().toISOString(),
};

const TEMPLATE_TAGS = ['{member}', '{date}', '{shift}', '{time}', '{member_name}', '{shift_title}', '{shift_time}', '{shift_date}'] as const;

interface SettingsProps {
  settings: AppSettings;
  onSave: (update: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
  toast: { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void };
}

export function Settings({ settings, onSave, toast }: SettingsProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleUpdate = (key: keyof AppSettings, val: string | boolean | number) => {
    onSave((prev) => ({ ...prev, [key]: val }));
  };

  const previewPlain = useMemo(
    () => expandReminderTemplate(settings.reminderMessage || '', PREVIEW_MEMBER, PREVIEW_SHIFT),
    [settings.reminderMessage],
  );

  const previewHtml = useMemo(() => formatReminderPreviewHtml(previewPlain), [previewPlain]);

  const insertTag = (tag: string) => {
    const el = textareaRef.current;
    const current = settings.reminderMessage ?? '';
    if (!el) {
      handleUpdate('reminderMessage', current + tag);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = current.slice(0, start) + tag + current.slice(end);
    handleUpdate('reminderMessage', next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + tag.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto animate-fade-in pb-32">
      <header className="mb-12">
        <h2 className="text-5xl font-light theme-text-primary tracking-tight">Ajustes do Sistema</h2>
        <p className="text-lg theme-text-secondary mt-3 font-medium">Gerencie a identidade do seu espaço de trabalho e as credenciais de integração.</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Team Identity Section */}
        <section className="col-span-12 lg:col-span-7 glass-card rounded-[40px] p-10 shadow-ambient theme-border-strong space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
              <span className="material-symbols-outlined">badge</span>
            </div>
            <h3 className="text-2xl font-bold theme-text-primary tracking-tight">Identidade da Equipe</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Nome do Espaço de Trabalho</label>
              <input 
                className="organic-input w-full" 
                value={settings.teamName} 
                onChange={(e) => handleUpdate('teamName', e.target.value)} 
                placeholder="Ex: Sound Collective"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">ID do Workspace</label>
                <div className="relative">
                  <input 
                    className="organic-input w-full opacity-60 cursor-not-allowed pr-10" 
                    value="SC-9210-AUD" 
                    readOnly 
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-accent-primary text-lg">content_copy</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Data de Criação</label>
                <input 
                  className="organic-input w-full opacity-60 cursor-not-allowed" 
                  value="Outubro 2023" 
                  readOnly 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Telegram Integration Section */}
        <section className="col-span-12 lg:col-span-5 glass-card rounded-[40px] p-10 shadow-ambient theme-border-strong space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
              <span className="material-symbols-outlined">send</span>
            </div>
            <h3 className="text-2xl font-bold theme-text-primary tracking-tight">Integração Telegram</h3>
          </div>
          
          <div className="space-y-6">
            <p className="theme-text-secondary text-sm font-medium leading-relaxed">
              Conecte o Sound Calendar ao Telegram para alertas de escala em tempo real.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Bot API Token</label>
                <input 
                  type="password" 
                  className="organic-input w-full" 
                  value={settings.botToken} 
                  onChange={(e) => handleUpdate('botToken', e.target.value)} 
                  placeholder="••••••••••••••••••••"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Chat ID do Grupo</label>
                <input 
                  className="organic-input w-full" 
                  value={settings.groupChatId} 
                  onChange={(e) => handleUpdate('groupChatId', e.target.value)} 
                  placeholder="-100..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Message Template Section */}
        <section className="col-span-12 glass-card rounded-[40px] p-10 shadow-ambient theme-border-strong">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-accent-tertiary/10 flex items-center justify-center text-accent-tertiary">
                  <span className="material-symbols-outlined">subject</span>
                </div>
                <h3 className="text-2xl font-bold theme-text-primary tracking-tight">Template de Mensagem</h3>
              </div>
              <p className="theme-text-secondary font-medium">Personalize a estrutura das notificações automáticas usando suporte a Markdown.</p>
              
              <div className="space-y-4">
                <textarea 
                  ref={textareaRef}
                  className="organic-input w-full min-h-[160px] py-6 resize-none" 
                  value={settings.reminderMessage} 
                  onChange={(e) => handleUpdate('reminderMessage', e.target.value)}
                />
                <p className="text-[10px] theme-text-muted font-medium">Clique para inserir no cursor:</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="px-3 py-1 theme-surface rounded-full text-[10px] font-bold theme-text-secondary uppercase tracking-widest cursor-pointer border theme-border hover:border-accent-primary/40 hover:text-accent-primary transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1 mb-4">Pré-visualização (Telegram)</label>
              <div className="flex-1 rounded-[32px] p-6 md:p-8 relative overflow-hidden shadow-ambient border theme-border-strong theme-card-solid min-h-[280px]">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b theme-border">
                  <div className="w-9 h-9 rounded-full bg-[#0088cc] flex items-center justify-center text-white shadow-md shrink-0">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm theme-text-primary tracking-tight block truncate">
                      {settings.teamName || 'Sound Calendar'}
                    </span>
                    <span className="text-[10px] theme-text-muted font-medium">bot · exemplo</span>
                  </div>
                  <span className="text-[10px] theme-text-muted font-medium tabular-nums shrink-0">09:30</span>
                </div>
                <div
                  className="rounded-2xl border theme-border p-5 md:p-6 bg-[var(--color-bg-base)] text-sm theme-text-primary leading-relaxed shadow-inner"
                >
                  <div
                    className="[&_strong]:font-bold [&_strong]:text-accent-primary"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
                <p className="text-[10px] theme-text-muted mt-4 italic border-t theme-border pt-4">
                  Exemplo com {PREVIEW_MEMBER.name} e {PREVIEW_SHIFT.title} ({PREVIEW_SHIFT.date}, {PREVIEW_SHIFT.startTime}).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* System Health Section */}
        <section className="col-span-12 glass-card rounded-[40px] p-10 shadow-ambient theme-border-strong mb-12">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                <span className="material-symbols-outlined">monitor_heart</span>
              </div>
              <h3 className="text-2xl font-bold theme-text-primary tracking-tight">Status do Sistema</h3>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sistemas Operacionais</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Latência API', val: '24ms' },
              { label: 'Status Worker', val: 'Ativo' },
              { label: 'Taxa de Cache', val: '98.2%' },
              { label: 'Versão Sync', val: 'v4.2.0' },
            ].map(item => (
              <div key={item.label} className="p-6 theme-card-solid rounded-3xl text-center border theme-border">
                <p className="text-[10px] font-bold theme-text-muted uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-bold theme-text-primary tracking-tight">{item.val}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <footer className="fixed bottom-10 left-[320px] right-12 flex justify-end gap-4 z-40">
        <button 
          onClick={() => {
            toast.success('Configurações do workspace salvas com sucesso');
          }}
          className="px-12 py-4 bg-accent-primary text-white rounded-[20px] font-bold text-xs uppercase tracking-[0.2em] shadow-lift hover:opacity-90 active:scale-95 transition-all flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          Gravar Workspace
        </button>
      </footer>
    </div>
  );
}
