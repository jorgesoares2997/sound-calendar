'use server';

import type { AppSettings } from '@/types';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { logger } from '@/utils/logger';

type SettingsRow = {
  id: number;
  bot_token: string;
  group_chat_id: string;
  team_name: string;
  reminder_message: string;
  default_reminder_hours: number;
};

const DEFAULT_SETTINGS: AppSettings = {
  botToken: '',
  groupChatId: '',
  teamName: process.env.NEXT_PUBLIC_TEAM_NAME || 'Sound Team',
  reminderMessage:
    '🎛️ Lembrete de escala!\n\n{member} você está na escala de *{date}* ({shift}).\n\nFique atento ao horário! 🙏',
  defaultReminderHours: 24,
  dailyReminder: true,
  weeklyReminder: true,
};

function toAppSettings(row: SettingsRow): AppSettings {
  return {
    botToken: row.bot_token,
    groupChatId: row.group_chat_id,
    teamName: row.team_name,
    reminderMessage: row.reminder_message,
    defaultReminderHours: row.default_reminder_hours,
    dailyReminder: true,
    weeklyReminder: true,
  };
}

export async function getSettingsAction(): Promise<AppSettings> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();

    if (error) {
      logger.error('Erro ao carregar settings', error);
      return DEFAULT_SETTINGS;
    }

    if (!data) {
      return DEFAULT_SETTINGS;
    }

    return toAppSettings(data as SettingsRow);
  } catch (error) {
    logger.error('Erro inesperado em getSettingsAction', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettingsAction(settings: AppSettings): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from('settings').upsert(
      {
        id: 1,
        bot_token: settings.botToken,
        group_chat_id: settings.groupChatId,
        team_name: settings.teamName,
        reminder_message: settings.reminderMessage,
        default_reminder_hours: settings.defaultReminderHours,
      },
      { onConflict: 'id' },
    );

    if (error) {
      logger.error('Erro ao salvar settings', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    logger.error('Erro inesperado em saveSettingsAction', error);
    return { success: false, error: (error as Error).message };
  }
}
