'use client';

import { useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useAppStore } from '@/components/Providers';
import { usePermissions } from '@/store/authStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useAppStore();
  
  const pathname = usePathname();
  const { canManageSystem, canCreateShifts } = usePermissions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDenied = mounted && (
    (pathname === '/gerar-escalas' && !canCreateShifts) ||
    (['/equipe', '/automacao', '/configuracoes'].includes(pathname) && !canManageSystem)
  );

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
      <main className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-72 transition-all">
        <Topbar 
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 relative z-10 w-full">
          <div className="max-w-[1600px] mx-auto w-full min-w-0">
            {isDenied ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4 opacity-80">block</span>
                <h2 className="text-2xl font-bold theme-text-primary mb-2">Acesso Restrito</h2>
                <p className="theme-text-secondary max-w-md">Seu perfil não possui as permissões necessárias para acessar esta página.</p>
              </div>
            ) : (
              children
            )}
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
