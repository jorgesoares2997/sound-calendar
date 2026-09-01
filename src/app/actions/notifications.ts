'use server';

import { getShiftsAction } from './shifts';
import { getMembersAction } from './members';
import { sendEmailAction } from './email';
import { sendWhatsAppMessageAction } from './whatsapp';
import { format, parseISO, isSameDay, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Member, Shift } from '@/types';
import { logger } from '@/utils/logger';
// Removing HTML escaping as it's not needed for WhatsApp

function getMemberInfo(ids: string[], members: Member[], useTags = false) {
  if (ids.length === 0) return 'Ninguém escalado';
  
  return ids.map(id => {
    const m = members.find(m => m.id === id);
    if (!m) return 'Desconhecido';
    
    // For WhatsApp, we don't need HTML escaping
    const safeName = m.name;
    if (useTags && m.telegramId) {
      return `@${m.telegramId.replace('@', '')}`;
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

      message = '📅 *ESCALA MENSAL - ' + format(now, 'MMMM/yyyy', { locale: ptBR }).toUpperCase() + '*\n\n';
      targetShifts.forEach(s => {
        const date = format(parseISO(s.date), "dd/MM ' ('eee')'", { locale: ptBR });
        message += '• ' + date + ': ' + s.startTime + ' - *' + getMemberInfo(s.memberIds, members, true) + '* (' + s.title + ')\n';
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

      message = '🗓️ *ESCALA DA SEMANA (' + format(start, 'dd/MM') + ' a ' + format(end, 'dd/MM') + ')*\n\n';
      targetShifts.forEach(s => {
        const date = format(parseISO(s.date), "dd/MM ' ('eee')'", { locale: ptBR });
        message += '• ' + date + ': ' + s.startTime + ' - *' + getMemberInfo(s.memberIds, members, true) + '*\n';
      });
    } 
    else if (type === 'daily') {
      targetShifts = shifts.filter(s => isSameDay(parseISO(s.date), now));
      if (targetShifts.length === 0) {
        logger.warn('No shifts found for daily summary.');
        return { success: false, error: 'Hoje não há escalas programadas.' };
      }
      logger.debug(`[notifications] Daily target count=${targetShifts.length}, date=${now.toISOString()}`);

      message = '🔔 *ESCALA DE HOJE (' + format(now, 'dd/MM', { locale: ptBR }) + ')*\n\n';
      targetShifts.forEach(s => {
        message += '⏰ ' + s.startTime + '\n';
        message += '📍 ' + s.title + '\n';
        message += '👤 Técnico: *' + getMemberInfo(s.memberIds, members, true) + '*\n\n';
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
    logger.info(`Starting broadcast to WhatsApp and ${emails.length} emails. Subject: ${subject}`);
    
    const groupId = process.env.WHATSAPP_GROUP_ID;
    let whatsRes: { ok: boolean; error?: string } = { ok: false, error: 'WHATSAPP_GROUP_ID não configurado' };

    // 1. Send to WhatsApp
    if (groupId) {
      whatsRes = await sendWhatsAppMessageAction(groupId, draft);
      if (!whatsRes.ok) {
        logger.error('WhatsApp broadcast failed', whatsRes.error);
      } else {
        logger.info('WhatsApp broadcast successful.');
      }
    } else {
      logger.warn('Skipping WhatsApp broadcast. WHATSAPP_GROUP_ID not set.');
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

    logger.info(`Broadcast finished. WhatsApp: ${whatsRes.ok ? 'OK' : 'FAIL'}, Emails: ${emailSuccess}/${emails.length}`);

    return { 
      success: whatsRes.ok, 
      whatsapp: whatsRes.ok,
      emailsSent: emailSuccess,
      totalEmails: emails.length,
      error: whatsRes.error 
    };
  } catch (error) {
    logger.error('Error in sendToAll broadcast', error);
    throw error;
  }
}

export async function sendMonthlySummaryAction(customMessage?: string) {
  const res = await getNotificationDraftAction('monthly');
  if (!res.success || !res.draft || !res.emails) return res;
  return await sendToAll(customMessage || res.draft, res.emails, '📅 Escala Mensal de Som');
}

export async function sendWeeklySummaryAction(customMessage?: string) {
  const res = await getNotificationDraftAction('weekly');
  if (!res.success || !res.draft || !res.emails) return res;
  return await sendToAll(customMessage || res.draft, res.emails, '🗓️ Escala da Semana (Som)');
}

export async function sendDailySummaryAction(customMessage?: string) {
  const res = await getNotificationDraftAction('daily');
  if (!res.success || !res.draft || !res.emails) return res;
  return await sendToAll(customMessage || res.draft, res.emails, '🔔 Lembrete: Sua Escala de Som HOJE');
}
