'use client';

import { createElement, type ReactNode } from 'react';
import { toast as toastify } from 'react-toastify';

type ToastApi = {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  loading: (msg: string) => void;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  return createElement('div', null, children);
}

export function useToast() {
  const toast: ToastApi = {
    success: (msg: string) => toastify.success(msg, { autoClose: 3500 }),
    error: (msg: string) => toastify.error(msg, { autoClose: 6000 }),
    info: (msg: string) => toastify.info(msg, { autoClose: 4000 }),
    loading: (msg: string) => {
      toastify.loading(msg, { autoClose: 8000 });
    },
  };

  return { toast };
}
