import type { ReactNode } from 'react';
import { KQuestShell } from '@/components/layout/KQuestShell';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return <KQuestShell>{children}</KQuestShell>;
}
