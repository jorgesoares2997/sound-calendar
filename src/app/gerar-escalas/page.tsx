'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/components/Providers';
import { ScaleCreator } from '@/components/ScaleCreator';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

export default function ScaleCreatorPage() {
  const { members, addShifts, shiftPersistStatus } = useAppStore();
  const { toast } = useToast();
  const router = useRouter();
  const lastNotifiedAtRef = useRef(0);

  useEffect(() => {
    if (!shiftPersistStatus.updatedAt || shiftPersistStatus.updatedAt === lastNotifiedAtRef.current) return;
    lastNotifiedAtRef.current = shiftPersistStatus.updatedAt;

    if (shiftPersistStatus.state === 'success' && shiftPersistStatus.message) {
      toast.success(shiftPersistStatus.message);
      return;
    }

    if (shiftPersistStatus.state === 'error' && shiftPersistStatus.message) {
      toast.error(`Falha ao gravar lote de escalas: ${shiftPersistStatus.message}`);
    }
  }, [shiftPersistStatus, toast]);

  return (
    <ScaleCreator 
      members={members} 
      onSave={(newShifts) => {
        console.info('[ScaleCreatorPage] Salvando escalas geradas', { total: newShifts.length });
        addShifts(newShifts);
        toast.info('Escalas enviadas para gravação. Aguarde confirmação...');
        router.push('/');
      }} 
    />
  );
}
