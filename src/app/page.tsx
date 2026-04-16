'use client';

import { useAppStore } from '@/components/Providers';
import { Calendar } from '@/components/Calendar';
import { useToast } from '@/hooks/useToast';

export default function CalendarPage() {
  const { shifts, members, settings, addShift, deleteShift } = useAppStore();
  const { toast } = useToast();

  return (
    <Calendar
      shifts={shifts}
      members={members}
      settings={settings}
      onAddShift={addShift}
      onDeleteShift={deleteShift}
      toast={toast}
    />
  );
}
