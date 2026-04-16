'use server';

import fs from 'fs';
import path from 'path';
import type { Shift } from '@/types';
import { logger } from '@/utils/logger';

const SHIFTS_PATH = path.join(process.cwd(), 'src/data/shifts.json');

export async function getShiftsAction(): Promise<Shift[]> {
  try {
    if (!fs.existsSync(SHIFTS_PATH)) {
      logger.warn('Shifts database file not found, returning empty array.');
      return [];
    }
    const data = fs.readFileSync(SHIFTS_PATH, 'utf8');
    const shifts = JSON.parse(data) as Shift[];
    logger.debug(`Loaded ${shifts.length} shifts from DB.`);
    return shifts;
  } catch (error) {
    logger.error('Error reading shifts', error);
    return [];
  }
}

export async function saveShiftsAction(shifts: Shift[]): Promise<{ success: boolean; error?: string }> {
  try {
    // Final deduplication for safety: Ensure no two shifts have the same date, time and type
    const uniqueShifts = shifts.filter((shift, index, self) =>
      index === self.findIndex((s) => (
        s.date === shift.date && s.startTime === shift.startTime && s.type === shift.type
      ))
    );

    fs.writeFileSync(SHIFTS_PATH, JSON.stringify(uniqueShifts, null, 2));
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
