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

export function buildReminderMessage(template: string, member: Member, shift: Shift): string {
  return template
    .replace('{member}', `*${member.name}*`)
    .replace('{date}', formatShiftDate(shift.date))
    .replace('{shift}', shift.title || 'Escala')
    .replace('{time}', shift.startTime || '');
}

function formatShiftDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}
