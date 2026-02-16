'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface KQuestShellProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◫' },
  { href: '/knowledge', label: 'K-Base', icon: '⌂' },
  { href: '/missions', label: 'Quests', icon: '⟐' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '◌' },
  { href: '/profile', label: 'Profile', icon: '◔' },
  { href: '/team-map', label: 'Team Map', icon: '◉' },
  { href: '/org-pulse', label: 'Org-Pulse', icon: '◎' },
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function KQuestShell({ children }: KQuestShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-[#192545] bg-[#050d22] px-4 py-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 font-bold text-white">K</div>
          <div>
            <p className="kq-heading text-lg font-bold text-slate-100">K-Quest</p>
          </div>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1.5">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/35'
                    : 'text-slate-300 hover:bg-[#0d1733] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-xs opacity-80">{item.icon}</span>
                  {item.label}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-cyan-300' : 'bg-transparent group-hover:bg-slate-500'}`} />
              </Link>
            );
          })}
        </nav>

        <Link
          href="/"
          className="mt-3 rounded-xl border border-[#22345c] bg-[#0a1430] px-3 py-2.5 text-sm text-slate-300 hover:bg-[#0f1d43]"
        >
          Logout
        </Link>
      </aside>

      <div className="pl-64">
        <div className="sticky top-0 z-20 border-b border-[#17233f] bg-[#060f27]">
          <div className="h-8 border-b border-[#17233f] text-center text-xs leading-8 text-slate-400">
            K-Quest: Gamified Knowledge Management
          </div>
          <header className="px-8 py-3 backdrop-blur lg:px-12">
            <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3">
              <div className="w-full max-w-md rounded-xl border border-[#23365f] bg-[#0a1633] px-3 py-2 text-sm text-slate-400">
                Search knowledge base...
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="kq-pill rounded-full px-3 py-1 font-semibold">🔥 12d</div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="kq-muted">LVL</span>
                  <span className="font-semibold text-cyan-300">4</span>
                  <span className="h-1.5 w-28 rounded-full bg-[#13203f]">
                    <span className="block h-full w-2/3 rounded-full bg-cyan-400" />
                  </span>
                  <span className="kq-muted">1240 / 1687 XP</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-200">Alex Sterling</p>
                  <p className="text-xs text-slate-400">ADMIN</p>
                </div>
                <div className="h-7 w-7 rounded-full border border-cyan-500/60 bg-[radial-gradient(circle_at_30%_30%,#38bdf8,#0f172a)]" />
              </div>
            </div>
          </header>
        </div>

        <main className="px-8 py-6 lg:px-12">
          <div className="mx-auto w-full max-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
