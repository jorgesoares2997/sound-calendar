'use server';

import { getShiftsAction } from './shifts';
import { sendTelegramMessageAction } from './telegram';
import { sendEmailAction } from './email';
import initialMembers from '@/data/members.json';
import { format, parseISO, isSameDay, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Member, Shift } from '@/types';
import { logger } from '@/utils/logger';

const members = initialMembers as Member[];

function getMemberInfo(ids: string[], useTags = false) {
  if (ids.length === 0) return 'Ninguém escalado';
  
  return ids.map(id => {
    const m = members.find(m => m.id === id);
    if (!m) return 'Desconhecido';
    
    if (useTags && m.telegramId) {
      return m.telegramId;
    }
    return m.name;
  }).join(', ');
}

function getMemberEmails(shifts: Shift[]) {
  const memberIds = new Set<string>();
  shifts.forEach(s => s.memberIds.forEach(id => memberIds.add(id)));
  
  return Array.from(memberIds)
    .map(id => members.find(m => m.id === id)?.email)
    .filter((email): email is string => !!email);
}

export type SummaryType = 'monthly' | 'weekly' | 'daily';

export async function getNotificationDraftAction(type: SummaryType): Promise<{ success: boolean; draft?: string; error?: string; emails?: string[] }> {
  try {
    logger.info(`Generating notification draft for type: ${type}`);
    const shifts = await getShiftsAction();
    const now = new Date();
    let message = '';
    let targetShifts: Shift[] = [];

    if (type === 'monthly') {
      targetShifts = shifts.filter(s => {
        const d = parseISO(s.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).sort((a, b) => a.date.localeCompare(b.date));

      if (targetShifts.length === 0) {
        logger.warn('No shifts found for monthly summary.');
        return { success: false, error: 'Nenhuma escala encontrada para este mês.' };
      }

      message = '📅 *ESCALA MENSAL - ' + format(now, 'MMMM/yyyy', { locale: ptBR }).toUpperCase() + '*\n\n';
      targetShifts.forEach(s => {
        const date = format(parseISO(s.date), "dd/MM ' ('eee')'", { locale: ptBR });
        message += '• ' + date + ': ' + s.startTime + ' - *' + getMemberInfo(s.memberIds, true) + '* (' + s.title + ')\n';
      });
    } 
    else if (type === 'weekly') {
      const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

      targetShifts = shifts.filter(s => {
        const d = parseISO(s.date);
        return isWithinInterval(d, { start, end });
      }).sort((a, b) => a.date.localeCompare(b.date));

      if (targetShifts.length === 0) {
        logger.warn('No shifts found for weekly summary.');
        return { success: false, error: 'Nenhuma escala encontrada para esta semana.' };
      }

      message = '🗓️ *ESCALA DA SEMANA (' + format(start, 'dd/MM') + ' a ' + format(end, 'dd/MM') + ')*\n\n';
      targetShifts.forEach(s => {
        const date = format(parseISO(s.date), "dd/MM ' ('eee')'", { locale: ptBR });
        message += '• ' + date + ': ' + s.startTime + ' - *' + getMemberInfo(s.memberIds, true) + '*\n';
      });
    } 
    else if (type === 'daily') {
      targetShifts = shifts.filter(s => isSameDay(parseISO(s.date), now));
      if (targetShifts.length === 0) {
        logger.warn('No shifts found for daily summary.');
        return { success: false, error: 'Hoje não há escalas programadas.' };
      }

      message = '🔔 *ESCALA DE HOJE (' + format(now, 'dd/MM', { locale: ptBR }) + ')*\n\n';
      targetShifts.forEach(s => {
        message += '⏰ ' + s.startTime + '\n';
        message += '📍 ' + s.title + '\n';
        message += '👤 Técnico: *' + getMemberInfo(s.memberIds, true) + '*\n\n';
      });
    }

    logger.info(`Successfully generated draft for ${type}.`);
    return { 
      success: true, 
      draft: message,
      emails: getMemberEmails(targetShifts)
    };
  } catch (error) {
    logger.error(`Error in getNotificationDraftAction (${type})`, error);
    return { success: false, error: (error as Error).message };
  }
}

async function sendToAll(draft: string, emails: string[], subject: string) {
  try {
    logger.info(`Starting broadcast to Telegram and ${emails.length} emails. Subject: ${subject}`);
    
    // 1. Send to Telegram
    const telRes = await sendTelegramMessageAction(draft);
    if (!telRes.ok) {
      logger.error('Telegram broadcast failed', telRes.error);
    } else {
      logger.info('Telegram broadcast successful.');
    }
    
    // 2. Send to Emails
    let emailSuccess = 0;
    for (const email of emails) {
      const res = await sendEmailAction({
        to: email,
        subject,
        text: draft.replace(/\*/g, ''), // Strip markdown bold for plain text email
      });
      if (res.success) emailSuccess++;
      else logger.error(`Email delivery failed to ${email}`, res.error);
    }

    logger.info(`Broadcast finished. Telegram: ${telRes.ok ? 'OK' : 'FAIL'}, Emails: ${emailSuccess}/${emails.length}`);

    return { 
      success: telRes.ok, 
      telegram: telRes.ok,
      emailsSent: emailSuccess,
      totalEmails: emails.length,
      error: telRes.error 
    };
  } catch (error) {
    logger.error('Error in sendToAll broadcast', error);
    throw error;
  }
}

export async function sendMonthlySummaryAction() {
  const res = await getNotificationDraftAction('monthly');
  if (!res.success || !res.draft || !res.emails) return res;
  return await sendToAll(res.draft, res.emails, '📅 Escala Mensal de Som');
}

export async function sendWeeklySummaryAction() {
  const res = await getNotificationDraftAction('weekly');
  if (!res.success || !res.draft || !res.emails) return res;
  return await sendToAll(res.draft, res.emails, '🗓️ Escala da Semana (Som)');
}

export async function sendDailySummaryAction() {
  const res = await getNotificationDraftAction('daily');
  if (!res.success || !res.draft || !res.emails) return res;
  return await sendToAll(res.draft, res.emails, '🔔 Lembrete: Sua Escala de Som HOJE');
}
