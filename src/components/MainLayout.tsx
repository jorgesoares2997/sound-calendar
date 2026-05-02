'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useAppStore } from '@/components/Providers';
import { getEnvConfigStatusAction } from '@/app/actions/telegram';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [envStatus, setEnvStatus] = useState<{ hasToken: boolean; hasChatId: boolean } | null>(null);
  const { settings } = useAppStore();

  useEffect(() => {
    getEnvConfigStatusAction().then(setEnvStatus);
  }, []);

  return (
    <div className="flex min-h-screen bg-bg-base relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent-primary/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 left-40 w-[400px] h-[400px] rounded-full bg-accent-secondary/5 blur-[100px]" />

      <Sidebar
        teamName={settings.teamName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen lg:pl-72 transition-all">
        <Topbar 
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 relative z-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  );
}
