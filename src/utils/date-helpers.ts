import { 
  startOfMonth, endOfMonth, eachDayOfInterval, 
  format, isSunday, isWednesday 
} from 'date-fns';
import type { Shift } from '@/types';

export function getMonthDays(year: number, month: number) {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
}

export function generateSuggestedScales(year: number, month: number) {
  const days = getMonthDays(year, month);
  const suggestions: Omit<Shift, 'createdAt'>[] = [];

  days.forEach((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (isSunday(day)) {
      suggestions.push({
        id: crypto.randomUUID(),
        date: dateStr,
        title: 'Culto de Domingo (Manhã)',
        type: 'culto',
        startTime: '09:30',
        endTime: '11:30',
        memberIds: [],
        notes: '',
      });
      suggestions.push({
        id: crypto.randomUUID(),
        date: dateStr,
        title: 'Culto de Domingo (Noite)',
        type: 'culto',
        startTime: '18:30',
        endTime: '20:30',
        memberIds: [],
        notes: '',
      });
    } else if (isWednesday(day)) {
      suggestions.push({
        id: crypto.randomUUID(),
        date: dateStr,
        title: 'Culto de Quarta',
        type: 'culto',
        startTime: '19:30',
        endTime: '21:30',
        memberIds: [],
        notes: '',
      });
    }
  });

  return suggestions;
}
