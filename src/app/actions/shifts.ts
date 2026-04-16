'use server';

import fs from 'fs';
import path from 'path';
import type { Shift } from '@/types';

const SHIFTS_PATH = path.join(process.cwd(), 'src/data/shifts.json');

export async function getShiftsAction(): Promise<Shift[]> {
  try {
    const data = fs.readFileSync(SHIFTS_PATH, 'utf8');
    return JSON.parse(data) as Shift[];
  } catch (error) {
    console.error('Error reading shifts:', error);
    return [];
  }
}

export async function saveShiftsAction(shifts: Shift[]): Promise<{ success: boolean; error?: string }> {
  try {
    fs.writeFileSync(SHIFTS_PATH, JSON.stringify(shifts, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving shifts:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function addShiftsAction(newShifts: Shift[]): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getShiftsAction();
    const updated = [...current, ...newShifts];
    return await saveShiftsAction(updated);
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
