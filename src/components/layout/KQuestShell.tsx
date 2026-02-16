'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface KQuestShellProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/knowledge', label: 'K-Base' },
  { href: '/missions', label: 'Quests' },
  { href: '/badges', label: 'Leaderboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/admin', label: 'Admin' },
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function KQuestShell({ children }: KQuestShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950/95 px-4 py-5">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold">K</div>
          <div>
            <p className="text-lg font-semibold tracking-wide">K-Quest</p>
            <p className="text-xs text-slate-400">Gestão do Conhecimento</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="mt-3 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
        >
          Voltar ao início
        </Link>
      </aside>

      <div className="pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400">
              Search knowledge base...
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 font-semibold text-indigo-300">
                120 XP
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-200">Alex Sterling</p>
                <p className="text-xs text-slate-400">ADMIN</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
