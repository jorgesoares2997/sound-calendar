'use client';

import { Automation } from '@/components/Automation';
import { useToast } from '@/hooks/useToast';

export default function AutomationPage() {
  const { toast } = useToast();

  return (
    <Automation toast={toast} />
  );
}
