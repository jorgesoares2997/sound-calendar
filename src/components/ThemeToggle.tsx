'use client';

import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={toggleTheme}
      className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-800 p-1 flex items-center transition-all duration-300 shadow-inner"
      aria-label="Alternar tema"
    >
      <div
        className={`w-4 h-4 rounded-full bg-white dark:bg-accent-primary flex items-center justify-center transition-all duration-300 transform ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        <span className="material-symbols-outlined text-[10px] font-bold">
          {theme === 'dark' ? 'dark_mode' : 'light_mode'}
        </span>
      </div>
    </button>
  );
}
