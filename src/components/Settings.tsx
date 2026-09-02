'use client';

import { useMemo, useRef } from 'react';
import type { AppSettings, Member, Shift } from '@/types';
import { expandReminderTemplate, formatReminderPreviewHtml } from '@/utils/telegram';
import { useAppStore } from '@/components/Providers';
import { useAuthStore } from '@/store/authStore';

const ROLES = ['Líder de Som', 'Técnico Senior', 'Técnico Pleno', 'Técnico Junior', 'Estagiário'];

const PREVIEW_MEMBER: Member = {
  id: 'preview-member',
  name: 'Maria Silva',
  role: 'Técnico de Som',
  telegramId: 'mariasilva',
  email: 'maria@exemplo.com',
  phone: '',
  color: '#3e5e82',
  active: true,
  platformAccess: true,
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
  const { members, updateMember } = useAppStore();
  const currentUser = useAuthStore(state => state.currentUser);
  const isAdmin = currentUser?.accessLevel === 'admin';

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
    <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto animate-fade-in pb-32 w-full min-w-0">
      <header className="mb-8 sm:mb-12">
        <h2 className="text-4xl sm:text-5xl font-light theme-text-primary tracking-tight">Ajustes do Sistema</h2>
        <p className="text-sm sm:text-lg theme-text-secondary mt-3 font-medium">Gerencie a identidade do seu espaço de trabalho e as credenciais de integração.</p>
      </header>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 w-full min-w-0">
        {/* Team Identity Section */}
        <section className="lg:col-span-7 glass-card rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-ambient theme-border-strong space-y-6 sm:space-y-8 w-full min-w-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
              <span className="material-symbols-outlined">badge</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold theme-text-primary tracking-tight">Identidade da Equipe</h3>
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
        <section className="lg:col-span-5 glass-card rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-ambient theme-border-strong space-y-6 sm:space-y-8 w-full min-w-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-secondary/10 flex items-center justify-center text-accent-secondary shrink-0">
              <span className="material-symbols-outlined">send</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold theme-text-primary tracking-tight">Integração Telegram</h3>
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
        <section className="lg:col-span-12 glass-card rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-ambient theme-border-strong w-full min-w-0">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-12 min-w-0">
            <div className="space-y-6 sm:space-y-8 min-w-0 w-full">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-accent-tertiary/10 flex items-center justify-center text-accent-tertiary shrink-0">
                  <span className="material-symbols-outlined">subject</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold theme-text-primary tracking-tight">Template de Mensagem</h3>
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

            <div className="flex flex-col min-w-0 w-full">
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1 mb-4">Pré-visualização (Telegram)</label>
              <div className="flex-1 rounded-[32px] p-5 md:p-8 relative overflow-hidden shadow-ambient border theme-border-strong theme-card-solid min-h-[280px] w-full min-w-0">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b theme-border min-w-0 w-full">
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
                  className="rounded-2xl border theme-border p-4 md:p-6 bg-[var(--color-bg-base)] text-sm theme-text-primary leading-relaxed shadow-inner min-w-0 break-words w-full"
                >
                  <div
                    className="[&_strong]:font-bold [&_strong]:text-accent-primary whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
                <p className="text-[10px] theme-text-muted mt-4 italic border-t theme-border pt-4 break-words">
                  Exemplo com {PREVIEW_MEMBER.name} e {PREVIEW_SHIFT.title} ({PREVIEW_SHIFT.date}, {PREVIEW_SHIFT.startTime}).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Management Section (Admin Only) */}
        {isAdmin && (
          <section className="lg:col-span-12 glass-card rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-ambient theme-border-strong w-full min-w-0">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold theme-text-primary tracking-tight">Gestão de Acessos</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {members.map(member => (
                <div key={member.id} className="p-4 theme-card-solid rounded-[24px] border theme-border flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: member.color }} />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-bold theme-text-primary truncate">{member.name}</span>
                      <span className="text-[10px] theme-text-muted font-medium truncate">{member.email || 'Sem e-mail'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1">Papel / Função</label>
                    <select
                      className="organic-input w-full text-sm appearance-none"
                      value={member.role}
                      onChange={(e) => updateMember(member.id, { role: e.target.value })}
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                      {!ROLES.includes(member.role) && (
                        <option value={member.role}>{member.role} (Atual)</option>
                      )}
                    </select>
                  </div>

                  <div className="flex items-center justify-between mt-1 px-1">
                    <span className="text-xs font-bold theme-text-secondary">Acesso à Plataforma</span>
                    <button
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${member.platformAccess !== false ? 'bg-accent-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                      onClick={() => updateMember(member.id, { platformAccess: member.platformAccess === false ? true : false })}
                    >
                      <span
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${member.platformAccess !== false ? 'translate-x-6' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* System Health Section */}
        <section className="lg:col-span-12 glass-card rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-ambient theme-border-strong mb-12 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 min-w-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary shrink-0">
                <span className="material-symbols-outlined">monitor_heart</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold theme-text-primary tracking-tight">Status do Sistema</h3>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20 w-fit">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sistemas Operacionais</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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
      <footer className="fixed bottom-6 lg:bottom-10 left-6 lg:left-[320px] right-6 lg:right-12 flex justify-center lg:justify-end gap-4 z-40 pointer-events-none">
        <button 
          onClick={() => {
            toast.success('Configurações do workspace salvas com sucesso');
          }}
          className="w-full sm:w-auto px-6 sm:px-12 py-4 bg-accent-primary text-white rounded-[20px] font-bold text-xs uppercase tracking-[0.2em] shadow-lift hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 pointer-events-auto"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          Gravar Workspace
        </button>
      </footer>
    </div>
  );
}
