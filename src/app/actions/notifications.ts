'use server';

import { getShiftsAction } from './shifts';
import { getMembersAction } from './members';
import { sendTelegramMessageAction } from './telegram';
import { sendEmailAction } from './email';
import { format, parseISO, isSameDay, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Member, Shift } from '@/types';
import { logger } from '@/utils/logger';
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

function escapeHTML(str: string): string {
  return str.replace(/[&<>]/g, (tag) => ESCAPE_MAP[tag] || tag);
}

function getMemberInfo(ids: string[], members: Member[], useTags = false) {
  if (ids.length === 0) return 'Ninguém escalado';
  
  return ids.map(id => {
    const m = members.find(m => m.id === id);
    if (!m) return 'Desconhecido';
    
    // Always escape names and telegram IDs for HTML safety
    const safeName = escapeHTML(m.name);
    if (useTags && m.telegramId) {
      return `<code>@${escapeHTML(m.telegramId.replace('@', ''))}</code>`;
    }
    return safeName;
  }).join(', ');
}

function getMemberEmails(shifts: Shift[], members: Member[]) {
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
    const [shifts, members] = await Promise.all([getShiftsAction(), getMembersAction()]);
    logger.debug(`[notifications] Base data loaded. shifts=${shifts.length}, members=${members.length}, type=${type}`);
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
      logger.debug(`[notifications] Monthly target count=${targetShifts.length}`);

      message = '📅 <b>ESCALA MENSAL - ' + escapeHTML(format(now, 'MMMM/yyyy', { locale: ptBR }).toUpperCase()) + '</b>\n\n';
      targetShifts.forEach(s => {
        const date = format(parseISO(s.date), "dd/MM ' ('eee')'", { locale: ptBR });
        message += '• ' + date + ': ' + s.startTime + ' - <b>' + getMemberInfo(s.memberIds, members, true) + '</b> (' + escapeHTML(s.title) + ')\n';
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
      logger.debug(`[notifications] Weekly target count=${targetShifts.length}, start=${start.toISOString()}, end=${end.toISOString()}`);

      message = '🗓️ <b>ESCALA DA SEMANA (' + format(start, 'dd/MM') + ' a ' + format(end, 'dd/MM') + ')</b>\n\n';
      targetShifts.forEach(s => {
        const date = format(parseISO(s.date), "dd/MM ' ('eee')'", { locale: ptBR });
        message += '• ' + date + ': ' + s.startTime + ' - <b>' + getMemberInfo(s.memberIds, members, true) + '</b>\n';
      });
    } 
    else if (type === 'daily') {
      targetShifts = shifts.filter(s => isSameDay(parseISO(s.date), now));
      if (targetShifts.length === 0) {
        logger.warn('No shifts found for daily summary.');
        return { success: false, error: 'Hoje não há escalas programadas.' };
      }
      logger.debug(`[notifications] Daily target count=${targetShifts.length}, date=${now.toISOString()}`);

      message = '🔔 <b>ESCALA DE HOJE (' + format(now, 'dd/MM', { locale: ptBR }) + ')</b>\n\n';
      targetShifts.forEach(s => {
        message += '⏰ ' + s.startTime + '\n';
        message += '📍 ' + escapeHTML(s.title) + '\n';
        message += '👤 Técnico: <b>' + getMemberInfo(s.memberIds, members, true) + '</b>\n\n';
      });
    }

    logger.info(`Successfully generated draft for ${type}. shifts=${targetShifts.length}`);
    return { 
      success: true, 
      draft: message,
      emails: getMemberEmails(targetShifts, members)
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
        text: draft.replace(/<[^>]*>/g, ''), // Strip all HTML tags for plain text email
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
