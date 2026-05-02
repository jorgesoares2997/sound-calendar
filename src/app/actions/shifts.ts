'use server';

import type { Shift } from '@/types';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { logger } from '@/utils/logger';

type ShiftRow = {
  id: string;
  date: string;
  title: string;
  type: Shift['type'];
  start_time: string;
  end_time: string;
  member_ids: string[];
  notes: string;
  created_at: string;
};

function toShift(row: ShiftRow): Shift {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    type: row.type,
    startTime: row.start_time,
    endTime: row.end_time,
    memberIds: row.member_ids || [],
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}

function toRow(shift: Shift): ShiftRow {
  return {
    id: shift.id,
    date: shift.date,
    title: shift.title,
    type: shift.type,
    start_time: shift.startTime,
    end_time: shift.endTime,
    member_ids: shift.memberIds,
    notes: shift.notes,
    created_at: shift.createdAt,
  };
}

export async function getShiftsAction(): Promise<Shift[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.from('shifts').select('*').order('date', { ascending: true });
    if (error) {
      logger.error('Error reading shifts', error);
      return [];
    }
    const shifts = (data as ShiftRow[]).map(toShift);
    logger.debug(`Loaded ${shifts.length} shifts from DB.`);
    return shifts;
  } catch (error) {
    logger.error('Error reading shifts', error);
    return [];
  }
}

export async function saveShiftsAction(shifts: Shift[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdminClient();
    logger.debug(`saveShiftsAction called with ${shifts.length} shift(s).`);
    // Final deduplication for safety: Ensure no two shifts have the same date, time and type
    const uniqueShifts = shifts.filter((shift, index, self) =>
      index === self.findIndex((s) => (
        s.date === shift.date && s.startTime === shift.startTime && s.type === shift.type
      ))
    );
    const removedDuplicates = shifts.length - uniqueShifts.length;
    if (removedDuplicates > 0) {
      logger.warn(`saveShiftsAction deduplicated ${removedDuplicates} duplicated shift(s).`);
    }

    const rows = uniqueShifts.map(toRow);
    if (rows.length > 0) {
      const { error: upsertError } = await supabase.from('shifts').upsert(rows, { onConflict: 'id' });
      if (upsertError) {
        logger.error('Erro ao fazer upsert de escalas', upsertError);
        return { success: false, error: upsertError.message };
      }

      const ids = rows.map((row) => `"${row.id}"`).join(',');
      const { error: cleanupError } = await supabase.from('shifts').delete().not('id', 'in', `(${ids})`);
      if (cleanupError) {
        logger.error('Erro ao limpar escalas removidas', cleanupError);
        return { success: false, error: cleanupError.message };
      }
      logger.debug(`saveShiftsAction cleanup complete. kept=${rows.length}`);
    } else {
      const { error: clearError } = await supabase.from('shifts').delete().neq('id', '');
      if (clearError) {
        logger.error('Erro ao remover todas as escalas', clearError);
        return { success: false, error: clearError.message };
      }
      logger.debug('saveShiftsAction removed all shifts because input was empty.');
    }

    logger.info(`Salvas com sucesso ${uniqueShifts.length} escalas.`);
    return { success: true };
  } catch (error) {
    logger.error('Erro ao salvar escalas', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function addShiftsAction(newShifts: Shift[]): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getShiftsAction();
    
    // De-duplicate: When adding new shifts, remove any existing shifts that overlap in date, time, and type
    const filteredCurrent = current.filter(curr => 
      !newShifts.some(next => 
        next.date === curr.date && 
        next.startTime === curr.startTime && 
        next.type === curr.type
      )
    );

    const updated = [...filteredCurrent, ...newShifts];
    logger.info(`Adicionando ${newShifts.length} novas escalas. Limpando ${current.length - filteredCurrent.length} duplicadas.`);
    return await saveShiftsAction(updated);
  } catch (error) {
    logger.error('Erro em addShiftsAction', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Specifically for the 'Monthly' generation mode.
 * Replaces all shifts for a given month/year with the new set.
 */
export async function syncMonthShiftsAction(year: number, month: number, newShifts: Shift[]): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getShiftsAction();
    const otherShifts = current.filter(s => {
      const [y, m] = s.date.split('-').map(Number);
      return !(y === year && m === (month + 1));
    });

    const updated = [...otherShifts, ...newShifts];
    logger.info(`Sincronizando mês ${month + 1}/${year}. Substituindo entradas antigas.`);
    return await saveShiftsAction(updated);
  } catch (error) {
    logger.error('Erro em syncMonthShiftsAction', error);
    return { success: false, error: (error as Error).message };
  }
}
