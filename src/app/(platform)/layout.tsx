import type { ReactNode } from 'react';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}
