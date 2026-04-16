'use client';

import { useAppStore } from '@/components/Providers';
import { ScaleCreator } from '@/components/ScaleCreator';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';

export default function ScaleCreatorPage() {
  const { members, syncMonthShifts, addShift } = useAppStore();
  const { toast } = useToast();
  const router = useRouter();

  return (
    <ScaleCreator 
      members={members} 
      onSave={(newShifts, yr, mo) => syncMonthShifts(yr, mo, newShifts)} 
      onSaveSingle={addShift}
      onNavigate={(path) => {
        // Map old internal page IDs to new routes
        const routeMap: Record<string, string> = {
          'automation': '/automacao',
          'calendar': '/',
        };
        router.push(routeMap[path] || '/');
      }}
      toast={toast} 
    />
  );
}
