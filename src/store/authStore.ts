import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Member } from '@/types';

interface AuthState {
  currentUser: Member | null;
  setCurrentUser: (user: Member | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

import { useState, useEffect } from 'react';

export const usePermissions = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const level = mounted && currentUser ? currentUser.accessLevel : 'basic';
  
  return {
    canManageSystem: level === 'admin' || level === 'senior',
    canCreateShifts: level === 'admin' || level === 'senior',
    canDeleteShifts: level === 'admin' || level === 'senior',
  };
};
