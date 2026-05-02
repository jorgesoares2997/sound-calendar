'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/components/Providers';
import { Calendar } from '@/components/Calendar';
import { useToast } from '@/hooks/useToast';

export default function CalendarPage() {
  const { shifts, members, settings, addShift, deleteShift, shiftPersistStatus } = useAppStore();
  const { toast } = useToast();
  const lastNotifiedAtRef = useRef(0);

  useEffect(() => {
    if (!shiftPersistStatus.updatedAt || shiftPersistStatus.updatedAt === lastNotifiedAtRef.current) return;
    lastNotifiedAtRef.current = shiftPersistStatus.updatedAt;

    if (shiftPersistStatus.state === 'success' && shiftPersistStatus.message) {
      toast.success(shiftPersistStatus.message);
      return;
    }

    if (shiftPersistStatus.state === 'error' && shiftPersistStatus.message) {
      toast.error(`Falha ao salvar escalas: ${shiftPersistStatus.message}`);
    }
  }, [shiftPersistStatus, toast]);

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
