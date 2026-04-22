import type { Member, Shift } from '@/types';
import { sendTelegramMessageAction, validateBotTokenAction } from '@/app/actions/telegram';

export interface TelegramResult {
  ok: boolean;
  error?: string;
}

export interface BotInfo {
  ok: boolean;
  botName?: string;
  username?: string;
  error?: string;
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
): Promise<TelegramResult> {
  // Now calls the Server Action!
  // We pass the token/chatId as overrides if they are provided from the UI
  // If they are empty, the Server Action will automatically use .env values
  return await sendTelegramMessageAction(text, { 
    botToken: botToken || undefined, 
    chatId: chatId || undefined 
  });
}

export async function validateBotToken(botToken: string): Promise<BotInfo> {
  return await validateBotTokenAction(botToken);
}

function formatShiftDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

/**
 * Applies all supported placeholders (aliases included).
 * `{member}` wraps the name in * for Telegram bold; `{member_name}` is plain text.
 */
export function expandReminderTemplate(template: string, member: Member, shift: Shift): string {
  const dateLong = formatShiftDate(shift.date);
  const title = shift.title || 'Escala';
  const time = shift.startTime || '';

  return template
    .replace(/\{member_name\}/g, member.name)
    .replace(/\{shift_title\}/g, title)
    .replace(/\{shift_time\}/g, time)
    .replace(/\{shift_date\}/g, dateLong)
    .replace(/\{member\}/g, `*${member.name}*`)
    .replace(/\{date\}/g, dateLong)
    .replace(/\{shift\}/g, title)
    .replace(/\{time\}/g, time);
}

export function buildReminderMessage(template: string, member: Member, shift: Shift): string {
  return expandReminderTemplate(template, member, shift);
}

/** Escapes HTML and turns *Telegram bold* into <strong> for UI preview only. */
export function formatReminderPreviewHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}
