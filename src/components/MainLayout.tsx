'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useAppStore } from '@/components/Providers';
import { getEnvConfigStatusAction } from '@/app/actions/telegram';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

export function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [envStatus, setEnvStatus] = useState<{ hasToken: boolean; hasChatId: boolean } | null>(null);
  const { settings } = useAppStore();
  const { toasts } = useToast();

  useEffect(() => {
    getEnvConfigStatusAction().then(setEnvStatus);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0b0f] relative overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-40 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />

      <Sidebar
        teamName={settings.teamName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-60">
        <Topbar 
          onOpenSidebar={() => setSidebarOpen(true)}
          envStatus={envStatus}
        />

        {/* Page content */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 relative z-10 transition-all">
          {children}
        </div>
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
