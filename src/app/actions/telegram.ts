'use server';

import { BotInfo, TelegramResult } from '@/utils/telegram';
import { logger } from '@/utils/logger';

const TELEGRAM_API = 'https://api.telegram.org/bot';

/**
 * Server Action to send a Telegram message.
 * Reads the token and chat ID from environment variables if not provided.
 */
export async function sendTelegramMessageAction(
  text: string,
  overrides?: { botToken?: string; chatId?: string }
): Promise<TelegramResult> {
  const token = overrides?.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = overrides?.chatId || process.env.TELEGRAM_CHAT_ID;
  logger.debug(`[telegram] sendTelegramMessageAction called. hasToken=${Boolean(token)} hasChatId=${Boolean(chatId)}`);

  if (!token || !chatId) {
    logger.warn('[telegram] Missing token/chatId while sending telegram message.');
    return { ok: false, error: 'Token do bot ou Chat ID não configurados no servidor.' };
  }

  try {
    const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    const data = await res.json();
    if (!data.ok) {
      logger.error('[telegram] Telegram API Error', data);
      return { ok: false, error: `Telegram: ${data.description || 'Erro desconhecido'}` };
    }
    logger.info('[telegram] Message sent successfully.');
    return { ok: true };
  } catch (err: unknown) {
    logger.error('[telegram] Unexpected error while sending message', err);
    return { ok: false, error: `Erro no servidor: ${(err as Error).message}` };
  }
}

/**
 * Server Action to validate a bot token.
 */
export async function validateBotTokenAction(botToken: string): Promise<BotInfo> {
  if (!botToken) return { ok: false, error: 'Token vazio' };
  try {
    const res = await fetch(`${TELEGRAM_API}${botToken}/getMe`);
    const data = await res.json();
    if (data.ok) {
      return { 
        ok: true, 
        botName: data.result.first_name, 
        username: data.result.username 
      };
    }
    return { ok: false, error: data.description };
  } catch (err: unknown) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Server Action to check if environment variables are configured.
 */
export async function getEnvConfigStatusAction() {
  return {
    hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
    hasChatId: !!process.env.TELEGRAM_CHAT_ID,
    teamName: process.env.NEXT_PUBLIC_TEAM_NAME || null,
  };
}
