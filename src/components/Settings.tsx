'use client';

import { useAppStore } from '@/components/Providers';
import type { AppSettings } from '@/types';

interface SettingsProps {
  settings: AppSettings;
  onSave: (update: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
  toast: { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void };
}

export function Settings({ settings, onSave, toast }: SettingsProps) {
  const handleUpdate = (key: keyof AppSettings, val: any) => {
    onSave((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto animate-fade-in pb-32">
      <header className="mb-12">
        <h2 className="text-5xl font-light text-slate-900 dark:text-white tracking-tight">Ajustes do Sistema</h2>
        <p className="text-lg text-slate-500 mt-3 font-medium">Gerencie a identidade do seu espaço de trabalho e as credenciais de integração.</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Team Identity Section */}
        <section className="col-span-12 lg:col-span-7 glass-card rounded-[40px] p-10 shadow-ambient border border-white/50 space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
              <span className="material-symbols-outlined">badge</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Identidade da Equipe</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nome do Espaço de Trabalho</label>
              <input 
                className="organic-input w-full" 
                value={settings.teamName} 
                onChange={(e) => handleUpdate('teamName', e.target.value)} 
                placeholder="Ex: Sound Collective"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">ID do Workspace</label>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Data de Criação</label>
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
        <section className="col-span-12 lg:col-span-5 glass-card rounded-[40px] p-10 shadow-ambient border border-white/50 space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
              <span className="material-symbols-outlined">send</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Integração Telegram</h3>
          </div>
          
          <div className="space-y-6">
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Conecte o Sound Calendar ao Telegram para alertas de escala em tempo real.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Bot API Token</label>
                <input 
                  type="password" 
                  className="organic-input w-full" 
                  value={settings.botToken} 
                  onChange={(e) => handleUpdate('botToken', e.target.value)} 
                  placeholder="••••••••••••••••••••"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Chat ID do Grupo</label>
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
        <section className="col-span-12 glass-card rounded-[40px] p-10 shadow-ambient border border-white/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-accent-tertiary/10 flex items-center justify-center text-accent-tertiary">
                  <span className="material-symbols-outlined">subject</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Template de Mensagem</h3>
              </div>
              <p className="text-slate-500 font-medium">Personalize a estrutura das notificações automáticas usando suporte a Markdown.</p>
              
              <div className="space-y-4">
                <textarea 
                  className="organic-input w-full min-h-[160px] py-6 resize-none" 
                  value={settings.reminderMessage} 
                  onChange={(e) => handleUpdate('reminderMessage', e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {['{member_name}', '{shift_title}', '{shift_time}', '{shift_date}'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-accent-primary hover:text-white transition-all">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-4">Pré-visualização</label>
              <div className="flex-1 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lift">
                      <span className="material-symbols-outlined text-sm">send</span>
                    </div>
                    <span className="font-bold text-sm tracking-tight">SoundBot</span>
                    <span className="text-slate-400 text-[10px] font-medium ml-auto">10:24</span>
                  </div>
                  <div className="space-y-3 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm shadow-inner">
                    <p className="text-sm">🔔 <span className="font-bold">Sessão:</span> Master Mix Phase A</p>
                    <p className="text-sm">👤 <span className="font-bold">Membro:</span> Julian Thorne</p>
                    <p className="text-sm">🕒 <span className="font-bold">Horário:</span> 14:00 - 16:30</p>
                    <p className="text-[10px] italic text-slate-400 mt-6 border-t border-white/10 pt-4">Gerado por Sound Calendar Studio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Health Section */}
        <section className="col-span-12 glass-card rounded-[40px] p-10 shadow-ambient border border-white/50 mb-12">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                <span className="material-symbols-outlined">monitor_heart</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Status do Sistema</h3>
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
              <div key={item.label} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{item.val}</p>
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
