'use client';

import { useAppStore } from '@/components/Providers';
import { ScaleCreator } from '@/components/ScaleCreator';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

export default function ScaleCreatorPage() {
  const { members, addShifts } = useAppStore();
  const { toast } = useToast();
  const router = useRouter();

  return (
    <ScaleCreator 
      members={members} 
      onSave={(newShifts) => {
        addShifts(newShifts);
        toast.success('Escalas geradas e salvas com sucesso!');
        router.push('/');
      }} 
    />
  );
}
