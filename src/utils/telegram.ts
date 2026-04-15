// telegram.ts — Telegram Bot API integration
import type { Member, Shift } from '@/types';

const TELEGRAM_API = 'https://api.telegram.org/bot';

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
  if (!botToken || !chatId) {
    return { ok: false, error: 'Token do bot ou Chat ID não configurados. Acesse Configurações.' };
  }
  try {
    const res = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, error: data.description ?? 'Erro desconhecido' };
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: `Erro de rede: ${(err as Error).message}` };
  }
}

export async function validateBotToken(botToken: string): Promise<BotInfo> {
  if (!botToken) return { ok: false, error: 'Token vazio' };
  try {
    const res = await fetch(`${TELEGRAM_API}${botToken}/getMe`);
    const data = await res.json();
    if (data.ok) return { ok: true, botName: data.result.first_name, username: data.result.username };
    return { ok: false, error: data.description };
  } catch (err: unknown) {
    return { ok: false, error: (err as Error).message };
  }
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
