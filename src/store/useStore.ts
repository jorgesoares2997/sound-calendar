'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Member, Shift, AppSettings } from '@/types';
import initialMembers from '@/data/members.json';
import { getShiftsAction, saveShiftsAction } from '@/app/actions/shifts';

const KEYS = { MEMBERS: 'sc_members', SHIFTS: 'sc_shifts', SETTINGS: 'sc_settings' };

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Static members from JSON
const DEFAULT_MEMBERS: Member[] = initialMembers as Member[];

const DEFAULT_SETTINGS: AppSettings = {
  botToken: '',
  groupChatId: '',
  teamName: process.env.NEXT_PUBLIC_TEAM_NAME || 'Sound Team',
  reminderMessage:
    '🎛️ Lembrete de escala!\n\n{member} você está na escala de *{date}* ({shift}).\n\nFique atento ao horário! 🙏',
  defaultReminderHours: 24,
};

export function useStore() {
  const [members, setMembersState] = useState<Member[]>(DEFAULT_MEMBERS);
  const [shifts, setShiftsState] = useState<Shift[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(() =>
    load(KEYS.SETTINGS, DEFAULT_SETTINGS),
  );

  // Sync with server on mount
  useEffect(() => {
    getShiftsAction().then(setShiftsState);
  }, []);

  // Member management is now static/JSON-based
  const setMembers = useCallback((update: Member[] | ((prev: Member[]) => Member[])) => {
    setMembersState(update);
  }, []);

  const setShifts = useCallback((update: Shift[] | ((prev: Shift[]) => Shift[])) => {
    setShiftsState((prev) => {
      const next = typeof update === 'function' ? update(prev) : update;
      saveShiftsAction(next); // Persist to server
      return next;
    });
  }, []);

  const setSettings = useCallback((update: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    setSettingsState((prev) => {
      const next = typeof update === 'function' ? update(prev) : update;
      save(KEYS.SETTINGS, next);
      return next;
    });
  }, []);

  const addMember = useCallback(
    (member: Omit<Member, 'id'>) => {
      const newMember: Member = { ...member, id: crypto.randomUUID() };
      setMembers((prev) => [...prev, newMember]);
      return newMember;
    },
    [setMembers],
  );

  const updateMember = useCallback(
    (id: string, changes: Partial<Member>) => {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));
    },
    [setMembers],
  );

  const deleteMember = useCallback(
    (id: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setShifts((prev) =>
        prev.map((s) => ({ ...s, memberIds: s.memberIds.filter((mid) => mid !== id) })),
      );
    },
    [setMembers, setShifts],
  );

  const addShift = useCallback(
    (shift: Omit<Shift, 'id' | 'createdAt'>) => {
      const newShift: Shift = { ...shift, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setShifts((prev) => [...prev, newShift]);
      return newShift;
    },
    [setShifts],
  );

  const updateShift = useCallback(
    (id: string, changes: Partial<Shift>) => {
      setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));
    },
    [setShifts],
  );

  const addShifts = useCallback(
    (newShifts: Omit<Shift, 'id' | 'createdAt'>[]) => {
      const shiftsWithIds: Shift[] = newShifts.map((s) => ({
        ...s,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }));
      setShifts((prev) => [...prev, ...shiftsWithIds]);
      return shiftsWithIds;
    },
    [setShifts],
  );

  const syncMonthShifts = useCallback(
    (targetYear: number, targetMonth: number, newShifts: Omit<Shift, 'id' | 'createdAt'>[]) => {
      const shiftsWithIds: Shift[] = newShifts.map((s) => ({
        ...s,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }));

      setShifts((prev) => {
        // Remove existing shifts for that month/year
        const filtered = prev.filter((s) => {
          const [y, m] = s.date.split('-').map(Number);
          return !(y === targetYear && m === (targetMonth + 1));
        });
        return [...filtered, ...shiftsWithIds];
      });

      return shiftsWithIds;
    },
    [setShifts],
  );

  const deleteShift = useCallback(
    (id: string) => {
      setShifts((prev) => prev.filter((s) => s.id !== id));
    },
    [setShifts],
  );

  return {
    members,
    shifts,
    settings,
    setSettings,
    addMember,
    updateMember,
    deleteMember,
    addShift,
    addShifts,
    syncMonthShifts,
    updateShift,
    deleteShift,
  };
}
