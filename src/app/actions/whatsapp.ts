'use server';

import { logger } from '@/utils/logger';

const API_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

export interface WhatsAppResult {
  ok: boolean;
  error?: string;
}

/**
 * Server Action para enviar uma mensagem via WhatsApp (Evolution API).
 */
export async function sendWhatsAppMessageAction(
  phoneNumber: string, 
  text: string
): Promise<WhatsAppResult> {
  logger.debug(`[whatsapp] sendWhatsAppMessageAction called. to=${phoneNumber}`);

  if (!API_URL || !API_KEY || !INSTANCE_NAME) {
    logger.warn('[whatsapp] Variáveis da Evolution API não configuradas.');
    return { ok: false, error: 'Configurações do WhatsApp ausentes no servidor.' };
  }

  // Se for um JID de grupo (contém @g.us), não removemos as letras/caracteres.
  // Se for um número de celular normal, deixamos só os números.
  const isGroup = phoneNumber.includes('@g.us');
  const formattedNumber = isGroup ? phoneNumber : phoneNumber.replace(/\D/g, '');

  try {
    const res = await fetch(`${API_URL}/message/sendText/${INSTANCE_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY, // Cabeçalho de autenticação da Evolution
      },
      body: JSON.stringify({
        number: formattedNumber,
        options: {
          delay: 1200, // Um pequeno delay para evitar flag de spam
          presence: 'composing', // Mostra "escrevendo..." antes de enviar
        },
        text: text
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      logger.error('[whatsapp] Evolution API Error', data);
      return { ok: false, error: `WhatsApp: ${data.message || 'Erro desconhecido'}` };
    }

    logger.info('[whatsapp] Mensagem enviada com sucesso.');
    return { ok: true };
  } catch (err: unknown) {
    logger.error('[whatsapp] Erro inesperado ao enviar mensagem', err);
    return { ok: false, error: `Erro no servidor: ${(err as Error).message}` };
  }
}
