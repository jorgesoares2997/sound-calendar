'use client';

import { useState } from 'react';
import type { Member } from '@/types';
import { useAppStore } from '@/components/Providers';

export function Members() {
  const { members, addMember, updateMember, deleteMember } = useAppStore();
  const active = members.filter((m) => m.active);
  const inactive = members.filter((m) => !m.active);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const openAddModal = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Member) => {
    setEditingMember(m);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="mb-12">
        <h2 className="text-5xl font-light theme-text-primary tracking-tight">Diretório de Equipe</h2>
        <p className="text-lg theme-text-secondary mt-3 max-w-2xl font-medium">
          Conecte-se com os criadores, arquitetos e diretores por trás do ecossistema Sound Calendar.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div>
            <p className="text-[10px] font-bold theme-text-secondary uppercase tracking-widest">Total no Estúdio</p>
            <p className="text-xl font-bold theme-text-primary">{members.length} Membros</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
            <span className="material-symbols-outlined">pulse_alert</span>
          </div>
          <div>
            <p className="text-[10px] font-bold theme-text-secondary uppercase tracking-widest">Ativos Agora</p>
            <p className="text-xl font-bold theme-text-primary">{active.length} Online</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-tertiary/10 flex items-center justify-center text-accent-tertiary">
            <span className="material-symbols-outlined">hub</span>
          </div>
          <div>
            <p className="text-[10px] font-bold theme-text-secondary uppercase tracking-widest">Em Standby</p>
            <p className="text-xl font-bold theme-text-primary">{inactive.length} Unidades</p>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 snap-x snap-mandatory pb-8 pt-2 custom-scrollbar w-full min-w-0">
        {members.map((m) => (
          <MemberCard 
            key={m.id} 
            member={m} 
            className="flex-shrink-0 w-[80vw] max-w-[320px] md:w-auto snap-center"
            onToggle={(id, changes) => updateMember(id, changes)}
            onEdit={() => openEditModal(m)}
          />
        ))}
        
        {/* Add Member Placeholder */}
        <div 
          onClick={openAddModal}
          className="border-2 border-dashed theme-border p-8 rounded-[32px] flex flex-col items-center justify-center text-center group hover:border-accent-primary/40 transition-all cursor-pointer min-h-[320px] flex-shrink-0 w-[80vw] max-w-[320px] md:w-auto snap-center"
        >
          <div className="w-16 h-16 rounded-full theme-surface flex items-center justify-center mb-4 group-hover:bg-accent-primary/5 transition-colors">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-accent-primary transition-colors">person_add</span>
          </div>
          <h3 className="text-lg font-bold theme-text-primary">Adicionar Membro</h3>
          <p className="text-xs theme-text-muted font-medium mt-2">Convide novos talentos para o estúdio</p>
        </div>
      </div>

      {isModalOpen && (
        <MemberModal 
          member={editingMember} 
          onClose={handleClose} 
          onSave={(data) => {
            if (editingMember) {
              updateMember(editingMember.id, data);
            } else {
              addMember(data);
            }
            handleClose();
          }}
          onDelete={editingMember ? () => {
            if (confirm('Tem certeza que deseja apagar este membro?')) {
              deleteMember(editingMember.id);
              handleClose();
            }
          } : undefined}
        />
      )}
    </div>
  );
}

function MemberCard({ 
  member: m, 
  className = '',
  onToggle,
  onEdit 
}: {
  member: Member;
  className?: string;
  onToggle: (id: string, changes: Partial<Member>) => void;
  onEdit: () => void;
}) {
  const initials = m.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return (
    <div className={`glass-card p-8 rounded-[32px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lift group flex flex-col ${!m.active ? 'opacity-60 grayscale' : ''} ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="relative">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lift uppercase"
            style={{ backgroundColor: m.color || '#3e5e82' }}
          >
            {initials}
          </div>
          {m.active && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />}
        </div>
        <button 
          onClick={() => onToggle(m.id, { active: !m.active })}
          className={`p-2 rounded-xl transition-all ${m.active ? 'text-accent-primary hover:bg-accent-primary/5' : 'text-slate-400 hover:bg-slate-100'}`}
        >
          <span className="material-symbols-outlined">{m.active ? 'person_check' : 'person_off'}</span>
        </button>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold theme-text-primary mb-1 tracking-tight">{m.name}</h3>
        <p className="text-accent-primary font-bold text-xs uppercase tracking-widest mb-4">{m.role || 'Membro'}</p>
        
        <div className="space-y-3">
          {m.phone && (
            <div className="flex items-center gap-2 theme-text-muted">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span className="text-xs font-semibold tracking-tight">{m.phone}</span>
            </div>
          )}
          {m.email && (
            <div className="flex items-center gap-2 theme-text-muted">
              <span className="material-symbols-outlined text-[18px]">alternate_email</span>
              <span className="text-xs font-semibold tracking-tight lowercase">{m.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button 
          onClick={onEdit}
          className="flex-1 py-2.5 rounded-xl theme-surface theme-text-secondary text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-colors"
        >
          Editar Perfil
        </button>
        <a 
          href={m.phone ? `https://wa.me/${m.phone.replace(/\D/g, '')}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </a>
      </div>
    </div>
  );
}

function MemberModal({ 
  member, 
  onClose, 
  onSave,
  onDelete
}: { 
  member: Member | null;
  onClose: () => void;
  onSave: (data: Omit<Member, 'id'>) => void;
  onDelete?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    role: member?.role || '',
    phone: member?.phone || '',
    email: member?.email || '',
    telegramId: member?.telegramId || '',
    color: member?.color || '#3e5e82',
    active: member?.active ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Member, 'id'>);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="w-full max-w-xl theme-surface rounded-3xl border theme-border shadow-xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent-primary">Diretório</p>
            <h3 className="text-2xl font-bold theme-text-primary">{member ? 'Editar Membro' : 'Novo Membro'}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1 block mb-1">Nome Completo</label>
            <input 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-white/5 border theme-border rounded-xl px-4 py-3 text-sm font-medium theme-text-primary outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all"
              placeholder="Ex: João Silva"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1 block mb-1">Papel / Função</label>
            <input 
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-white/5 border theme-border rounded-xl px-4 py-3 text-sm font-medium theme-text-primary outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all"
              placeholder="Ex: Baterista"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1 block mb-1">WhatsApp (Número)</label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-white/5 border theme-border rounded-xl px-4 py-3 text-sm font-medium theme-text-primary outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all"
                placeholder="Ex: 5511999999999"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1 block mb-1">E-mail</label>
              <input 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-white/5 border theme-border rounded-xl px-4 py-3 text-sm font-medium theme-text-primary outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all"
                placeholder="Ex: joao@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1 block mb-1">Cor do Avatar</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0"
                />
                <span className="text-xs font-mono theme-text-secondary">{formData.color}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-1 block mb-1 flex items-center h-[18px]">Status</label>
              <label className="flex items-center gap-3 p-3 rounded-xl border theme-border bg-slate-50 dark:bg-white/5 cursor-pointer mt-1">
                <input 
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-4 h-4 accent-green-500 rounded"
                />
                <span className="text-sm font-bold theme-text-primary">Ativo</span>
              </label>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            {onDelete && (
              <button 
                type="button"
                onClick={onDelete}
                className="px-6 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                Apagar
              </button>
            )}
            <button 
              type="submit"
              className="flex-1 py-3 rounded-xl bg-accent-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20"
            >
              Salvar Membro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
