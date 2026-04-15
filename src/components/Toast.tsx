'use client';

import type { Toast } from '@/types';

const ICONS: Record<Toast['type'], string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  loading: '⏳',
};

const BORDERS: Record<Toast['type'], string> = {
  success: 'border-l-[#22c55e]',
  error: 'border-l-[#ef4444]',
  info: 'border-l-[#06b6d4]',
  loading: 'border-l-violet-500',
};

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 flex flex-col gap-2 z-[9999] max-w-[90vw]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-3 px-4 py-3.5
            bg-[#161821] border border-white/10 border-l-[3px] ${BORDERS[t.type]}
            rounded-2xl shadow-2xl min-w-[260px] max-w-sm text-sm font-medium
            ${t.exiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
          `}
        >
          <span className="text-lg flex-shrink-0">{ICONS[t.type]}</span>
          <span className="text-[#f0f1f6] flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
