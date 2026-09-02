'use server';

import type { Member } from '@/types';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { logger } from '@/utils/logger';

type MemberRow = {
  id: string;
  name: string;
  role: string;
  telegram_id: string;
  email: string;
  phone: string;
  color: string;
  active: boolean;
};

function toMember(row: MemberRow): Member {
  const rawRole = row.role || '';
  const platformAccess = !rawRole.includes('[NO_ACCESS]');
  const cleanRole = rawRole.replace('[NO_ACCESS]', '').trim();
  
  const roleLower = cleanRole.toLowerCase();
  let level: 'admin' | 'senior' | 'basic' = 'basic';
  if (roleLower.includes('líder') || roleLower.includes('lider')) {
    level = 'admin';
  } else if (roleLower.includes('senior')) {
    level = 'senior';
  }

  return {
    id: row.id,
    name: row.name,
    role: cleanRole,
    telegramId: row.telegram_id,
    email: row.email,
    phone: row.phone,
    color: row.color,
    active: row.active,
    platformAccess,
    accessLevel: level,
  };
}

function toMemberRow(member: Member): Partial<MemberRow> {
  const roleSuffix = member.platformAccess === false ? ' [NO_ACCESS]' : '';
  const finalRole = `${member.role || ''}${roleSuffix}`.trim();

  return {
    id: member.id,
    name: member.name,
    role: finalRole,
    telegram_id: member.telegramId,
    email: member.email,
    phone: member.phone,
    color: member.color,
    active: member.active,
  };
}

export async function getMembersAction(): Promise<Member[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('members').select('*').order('name', { ascending: true });

    if (error) {
      logger.error('Erro ao carregar membros', error);
      return [];
    }

    return (data as MemberRow[]).map(toMember);
  } catch (error) {
    logger.error('Erro inesperado em getMembersAction', error);
    return [];
  }
}

export async function saveMembersAction(members: Member[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdminClient();
    const uniqueMembers = Array.from(new Map(members.map((member) => [member.id, member])).values());
    const rows = uniqueMembers.map(toMemberRow);

    if (rows.length > 0) {
      const { error } = await supabase.from('members').upsert(rows, { onConflict: 'id' });
      if (error) {
        logger.error('Erro ao fazer upsert de membros', error);
        return { success: false, error: error.message };
      }

      const ids = rows.map((row) => `"${row.id}"`).join(',');
      const { error: cleanupError } = await supabase.from('members').delete().not('id', 'in', `(${ids})`);
      if (cleanupError) {
        logger.error('Erro ao limpar membros removidos', cleanupError);
        return { success: false, error: cleanupError.message };
      }
    } else {
      const { error } = await supabase.from('members').delete().neq('id', '');
      if (error) {
        logger.error('Erro ao remover todos os membros', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (error) {
    logger.error('Erro inesperado em saveMembersAction', error);
    return { success: false, error: (error as Error).message };
  }
}
