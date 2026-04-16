'use client';

import { Settings } from '@/components/Settings';
import { useAppStore } from '@/components/Providers';
import { useToast } from '@/hooks/useToast';

export default function SettingsPage() {
  const { settings, setSettings } = useAppStore();
  const { toast } = useToast();

  return (
    <Settings 
      settings={settings} 
      onSave={setSettings} 
      toast={toast} 
    />
  );
}
