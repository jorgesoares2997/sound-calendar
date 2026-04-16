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
    fs.writeFileSync(SHIFTS_PATH, JSON.stringify(shifts, null, 2));
    logger.info(`Successfully saved ${shifts.length} shifts to database.`);
    return { success: true };
  } catch (error) {
    logger.error('Error saving shifts', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function addShiftsAction(newShifts: Shift[]): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getShiftsAction();
    const updated = [...current, ...newShifts];
    logger.info(`Adding ${newShifts.length} new shifts to existing ${current.length} shifts.`);
    return await saveShiftsAction(updated);
  } catch (error) {
    logger.error('Error in addShiftsAction', error);
    return { success: false, error: (error as Error).message };
  }
}
