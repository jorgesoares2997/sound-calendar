'use client';

import { Members } from '@/components/Members';
import { useAppStore } from '@/components/Providers';

export default function MembersPage() {
  const { members, updateMember } = useAppStore();

  return (
    <Members
      members={members}
      onUpdate={updateMember}
    />
  );
}
