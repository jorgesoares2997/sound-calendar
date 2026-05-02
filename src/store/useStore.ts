'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Member, Shift, AppSettings } from '@/types';
import { getShiftsAction, saveShiftsAction, syncMonthShiftsAction } from '@/app/actions/shifts';
import { getMembersAction, saveMembersAction } from '@/app/actions/members';
import { getSettingsAction, saveSettingsAction } from '@/app/actions/settings';
import { logger } from '@/utils/logger';

const DEFAULT_MEMBERS: Member[] = [];

const DEFAULT_SETTINGS: AppSettings = {
  botToken: '',
  groupChatId: '',
  teamName: process.env.NEXT_PUBLIC_TEAM_NAME || 'Sound Team',
  reminderMessage:
    '🎛️ Lembrete de escala!\n\n{member} você está na escala de *{date}* ({shift}).\n\nFique atento ao horário! 🙏',
  defaultReminderHours: 24,
  dailyReminder: true,
  weeklyReminder: true,
};

type PersistStatus = {
  state: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
  updatedAt: number;
};

export function useStore() {
  const [members, setMembersState] = useState<Member[]>(DEFAULT_MEMBERS);
  const [shifts, setShiftsState] = useState<Shift[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [shiftPersistStatus, setShiftPersistStatus] = useState<PersistStatus>({
    state: 'idle',
    updatedAt: 0,
  });
  const membersHydrationSkippedRef = useRef(false);
  const settingsHydrationSkippedRef = useRef(false);

  // Sync with server on mount
  useEffect(() => {
    let mounted = true;
    Promise.all([getMembersAction(), getShiftsAction(), getSettingsAction()])
      .then(([loadedMembers, loadedShifts, loadedSettings]) => {
        if (!mounted) return;
        setMembersState(loadedMembers);
        setShiftsState(loadedShifts);
        setSettingsState(loadedSettings);
        setHydrated(true);
      })
      .catch((error) => {
        logger.error('useStore: erro ao carregar dados iniciais', error);
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Shifts persistence
  useEffect(() => {
    if (!hydrated) return;
    setShiftPersistStatus({
      state: 'saving',
      message: 'Sincronizando escalas...',
      updatedAt: Date.now(),
    });

    saveShiftsAction(shifts)
      .then((result) => {
        if (result.success) {
          logger.info(`useStore: escalas persistidas com sucesso (${shifts.length} registros).`);
          setShiftPersistStatus({
            state: 'success',
            message: `${shifts.length} escala(s) salva(s) com sucesso.`,
            updatedAt: Date.now(),
          });
          return;
        }

        logger.error('useStore: falha ao persistir escalas', result.error);
        setShiftPersistStatus({
          state: 'error',
          message: result.error || 'Não foi possível salvar as escalas.',
          updatedAt: Date.now(),
        });
      })
      .catch((error) => {
        logger.error('useStore: Erro ao persistir escalas', error);
        setShiftPersistStatus({
          state: 'error',
          message: (error as Error).message || 'Erro inesperado ao salvar escalas.',
          updatedAt: Date.now(),
        });
      });
  }, [hydrated, shifts]);

  // Members persistence
  useEffect(() => {
    if (!hydrated) return;
    if (!membersHydrationSkippedRef.current) {
      membersHydrationSkippedRef.current = true;
      return;
    }
    saveMembersAction(members).catch((e) => logger.error('useStore: Erro ao persistir membros', e));
  }, [hydrated, members]);

  // Settings persistence
  useEffect(() => {
    if (!hydrated) return;
    if (!settingsHydrationSkippedRef.current) {
      settingsHydrationSkippedRef.current = true;
      return;
    }
    saveSettingsAction(settings).catch((e) => logger.error('useStore: Erro ao persistir configurações', e));
  }, [hydrated, settings]);

  const setMembers = useCallback((update: Member[] | ((prev: Member[]) => Member[])) => {
    setMembersState(update);
  }, []);

  const setShifts = useCallback((update: Shift[] | ((prev: Shift[]) => Shift[])) => {
    setShiftsState((prev) => {
      const next = typeof update === 'function' ? update(prev) : update;
      return next;
    });
  }, []);

  const setSettings = useCallback((update: AppSettings | ((prev: AppSettings) => AppSettings)) => {
    setSettingsState((prev) => {
      return typeof update === 'function' ? update(prev) : update;
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
      setShifts((prev) => {
        // De-duplicate: Remove existing shift with same date, time, and type
        const filtered = prev.filter(s => 
          !(s.date === newShift.date && s.startTime === newShift.startTime && s.type === newShift.type)
        );
        return [...filtered, newShift];
      });
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
      setShifts((prev) => {
        // De-duplicate: filter current against incoming
        const filtered = prev.filter(curr => 
          !shiftsWithIds.some(next => 
            next.date === curr.date && next.startTime === curr.startTime && next.type === curr.type
          )
        );
        return [...filtered, ...shiftsWithIds];
      });
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

      syncMonthShiftsAction(targetYear, targetMonth, shiftsWithIds).catch((error) => {
        logger.error('Erro ao sincronizar mês no servidor', error);
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

  const clearAllShifts = useCallback(() => {
    if (confirm('Tem certeza que deseja apagar TODAS as escalas? Esta ação não pode ser desfeita.')) {
      setShifts([]);
    }
  }, [setShifts]);

  return {
    members,
    shifts,
    settings,
    shiftPersistStatus,
    setSettings,
    addMember,
    updateMember,
    deleteMember,
    addShift,
    addShifts,
    syncMonthShifts,
    clearAllShifts,
    updateShift,
    deleteShift,
  };
}
