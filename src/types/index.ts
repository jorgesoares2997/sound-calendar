export type ShiftType = 'manha' | 'tarde' | 'noite' | 'culto' | 'ensaio' | 'evento';

export interface Member {
  id: string;
  name: string;
  role: string;
  telegramId: string;
  email: string;
  phone: string;
  color: string;
  active: boolean;
}

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  memberIds: string[];
  notes: string;
  createdAt: string;
}

export interface AppSettings {
  botToken: string;
  groupChatId: string;
  teamName: string;
  reminderMessage: string;
  defaultReminderHours: number;
}

export type Page = 'calendar' | 'members' | 'settings' | 'scale-creator' | 'automation';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}
