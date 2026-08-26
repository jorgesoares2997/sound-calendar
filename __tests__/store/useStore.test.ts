import { renderHook, act, waitFor } from '@testing-library/react';
import { useStore } from '@/store/useStore';
import type { Member, Shift } from '@/types';

// Mock server actions to prevent real API calls during tests
jest.mock('@/app/actions/members', () => ({
  getMembersAction: jest.fn().mockResolvedValue([]),
  saveMembersAction: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/app/actions/shifts', () => ({
  getShiftsAction: jest.fn().mockResolvedValue([]),
  saveShiftsAction: jest.fn().mockResolvedValue({ success: true }),
  syncMonthShiftsAction: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/app/actions/settings', () => ({
  getSettingsAction: jest.fn().mockResolvedValue({}),
  saveSettingsAction: jest.fn().mockResolvedValue({ success: true }),
}));

describe('useStore hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', async () => {
    const { result } = renderHook(() => useStore());

    await waitFor(() => {
      expect(result.current.shiftPersistStatus.state).toBe('idle');
    });

    expect(result.current.members).toEqual([]);
    expect(result.current.shifts).toEqual([]);
    expect(typeof result.current.settings.teamName).toBe('string');
  });

  it('should add a new member and generate an ID', async () => {
    const { result } = renderHook(() => useStore());
    await waitFor(() => expect(result.current.settings).toBeDefined());

    const newMemberData: Omit<Member, 'id'> = {
      name: 'Carlos',
      role: 'Video',
      active: true,
    };

    let addedMember: Member;

    act(() => {
      addedMember = result.current.addMember(newMemberData);
    });

    expect(addedMember!.id).toBeDefined();
    expect(addedMember!.name).toBe('Carlos');
    expect(result.current.members).toHaveLength(1);
    expect(result.current.members[0]).toEqual(addedMember!);
  });

  it('should update an existing member', async () => {
    const { result } = renderHook(() => useStore());
    await waitFor(() => expect(result.current.settings).toBeDefined());

    let member: Member;
    act(() => {
      member = result.current.addMember({ name: 'Carlos', role: 'Video', active: true });
    });

    act(() => {
      result.current.updateMember(member.id, { role: 'Audio', active: false });
    });

    expect(result.current.members[0].role).toBe('Audio');
    expect(result.current.members[0].active).toBe(false);
  });

  it('should delete a member and remove them from any existing shifts', async () => {
    const { result } = renderHook(() => useStore());
    await waitFor(() => expect(result.current.settings).toBeDefined());

    let member: Member;
    let shift: Shift;

    act(() => {
      member = result.current.addMember({ name: 'Carlos', role: 'Video', active: true });
    });

    act(() => {
      shift = result.current.addShift({
        date: '2026-01-01',
        title: 'Culto',
        type: 'culto',
        startTime: '10:00',
        endTime: '12:00',
        memberIds: [member.id],
      });
    });

    expect(result.current.shifts[0].memberIds).toContain(member.id);

    act(() => {
      result.current.deleteMember(member.id);
    });

    expect(result.current.members).toHaveLength(0);
    expect(result.current.shifts[0].memberIds).not.toContain(member.id);
  });

  it('should add a shift and prevent exact duplicates (same date, time, and type)', async () => {
    const { result } = renderHook(() => useStore());
    await waitFor(() => expect(result.current.settings).toBeDefined());

    const shiftData = {
      date: '2026-05-10',
      title: 'Culto da Manhã',
      type: 'culto' as const,
      startTime: '09:00',
      endTime: '11:00',
      memberIds: [],
    };

    act(() => {
      result.current.addShift(shiftData);
    });

    expect(result.current.shifts).toHaveLength(1);

    // Attempting to add the exact same shift again should deduplicate by replacing it or ignoring it
    act(() => {
      result.current.addShift(shiftData);
    });

    expect(result.current.shifts).toHaveLength(1); // Still 1 because of deduplication
  });

  it('should clear all shifts', async () => {
    const { result } = renderHook(() => useStore());
    await waitFor(() => expect(result.current.settings).toBeDefined());
    
    // Mock window.confirm
    jest.spyOn(window, 'confirm').mockImplementation(() => true);

    act(() => {
      result.current.addShift({
        date: '2026-05-10',
        title: 'Culto',
        type: 'culto',
        startTime: '09:00',
        endTime: '11:00',
        memberIds: [],
      });
    });

    expect(result.current.shifts).toHaveLength(1);

    act(() => {
      result.current.clearAllShifts();
    });

    expect(result.current.shifts).toHaveLength(0);
  });
});
