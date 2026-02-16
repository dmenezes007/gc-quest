"use client";

import { useEffect, useMemo, useState } from 'react';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { subscribeToCurrentUserDataChanges } from '@/lib/supabase/realtime';

interface DashboardAggregateData {
  user: {
    name: string;
  };
  xp: {
    total: number;
  };
  level: {
    current: {
      code: string;
    } | null;
    next: {
      minXp: number;
    } | null;
    xpToNextLevel: number | null;
  };
  badges: {
    total: number;
  };
  knowledge: {
    total: number;
  };
  validations: {
    total: number;
  };
  leaderboard: {
    position: number;
    totalUsers: number;
  };
}

export default function DashboardPage() {
  const [aggregate, setAggregate] = useState<DashboardAggregateData | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch('/api/dashboard/aggregate');
        if (!response.ok) {
          return;
        }

        const body = (await response.json()) as { data?: DashboardAggregateData };
        if (active && body.data) {
          setAggregate(body.data);
        }
      } catch {
      }
    }

    void load();

    const unsubscribe = subscribeToCurrentUserDataChanges(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const userName = aggregate?.user?.name ?? 'Guest';
  const rankPosition = aggregate?.leaderboard?.position ?? 0;
  const rankTotalUsers = aggregate?.leaderboard?.totalUsers ?? 0;
  const knowledgeTotal = aggregate?.knowledge?.total ?? 0;
  const xpTotal = aggregate?.xp?.total ?? 0;
  const nextLevelMinXp = aggregate?.level?.next?.minXp ?? Math.max(100, xpTotal + 100);
  const progressPercent = useMemo(() => {
    if (nextLevelMinXp <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round((xpTotal / nextLevelMinXp) * 100)));
  }, [nextLevelMinXp, xpTotal]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-900/35 bg-[linear-gradient(120deg,#121739_0%,#0e1a3a_55%,#0b4f63_100%)] p-8 shadow-lg shadow-cyan-950/10">
        <p className="kq-heading text-xs font-semibold tracking-[0.12em] text-cyan-300">Agent ready</p>
        <h1 className="kq-heading mt-2 text-5xl font-extrabold leading-[0.95] text-slate-100">Welcome back, {userName}</h1>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#2b365d] bg-[#1a2343]/80 p-4">
            <p className="kq-heading text-[10px] uppercase text-slate-400">Rank position</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">#{rankPosition} / {rankTotalUsers}</p>
          </div>
          <div className="rounded-xl border border-[#2b365d] bg-[#1a2343]/80 p-4">
            <p className="kq-heading text-[10px] uppercase text-slate-400">Level progress</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{progressPercent}%</p>
          </div>
          <div className="rounded-xl border border-[#2b365d] bg-[#1a2343]/80 p-4">
            <p className="kq-heading text-[10px] uppercase text-slate-400">Knowledge assets</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{knowledgeTotal}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="kq-panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="kq-heading text-xl font-bold text-slate-100">Active Missions</h2>
              <span className="kq-heading text-xs text-slate-400">View all quests</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <article className="rounded-xl border border-slate-700 bg-[#0b142d] p-4">
                <p className="kq-heading inline rounded bg-fuchsia-500/15 px-2 py-0.5 text-[10px] uppercase text-fuchsia-300">Daily</p>
                <h3 className="mt-2 font-semibold text-slate-100">Explorador Diário</h3>
                <p className="mt-1 text-sm text-slate-400">Registre 1 conhecimento hoje.</p>
                <p className="mt-3 text-right text-xs font-semibold text-cyan-300">+150 XP</p>
              </article>
              <article className="rounded-xl border border-slate-700 bg-[#0b142d] p-4">
                <p className="kq-heading inline rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] uppercase text-cyan-300">Weekly</p>
                <h3 className="mt-2 font-semibold text-slate-100">Guardião da Qualidade</h3>
                <p className="mt-1 text-sm text-slate-400">Valide 3 conhecimentos de outros usuários.</p>
                <p className="mt-3 text-right text-xs font-semibold text-cyan-300">+450 XP</p>
              </article>
            </div>
          </div>

          <Leaderboard />

          <div className="kq-panel p-5">
            <h2 className="kq-heading text-xl font-bold text-slate-100">Recent Knowledge</h2>
            <div className="mt-4 space-y-2">
              <div className="rounded-xl border border-slate-700 bg-[#0b142d] px-4 py-3">
                <p className="font-medium text-slate-100">Customer Success Onboarding Flow v2</p>
                <p className="text-xs text-slate-500">Processos • Sarah J.</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-[#0b142d] px-4 py-3">
                <p className="font-medium text-slate-100">Kubernetes Autoscaling Best Practices</p>
                <p className="text-xs text-slate-500">Tecnologia • Alex Sterling</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="kq-panel p-5 text-center">
            <div className="mx-auto h-16 w-16 rounded-full border-2 border-cyan-400 bg-[radial-gradient(circle_at_35%_35%,#22d3ee,#1f2937)]" />
            <p className="kq-heading mt-4 text-2xl font-bold text-slate-100">{userName}</p>
            <p className="text-sm text-slate-400">Technology Unit</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                <p className="text-xs uppercase text-slate-500">Validations</p>
                <p className="mt-1 font-semibold text-cyan-300">{aggregate?.validations?.total ?? 0}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                <p className="text-xs uppercase text-slate-500">XP streak</p>
                <p className="mt-1 font-semibold text-fuchsia-300">{aggregate?.badges?.total ?? 0}</p>
              </div>
            </div>
          </section>

          <section className="kq-panel p-5">
            <h3 className="kq-heading text-lg text-fuchsia-300">Badge Case</h3>
            <div className="mt-3 grid grid-cols-4 gap-2">
              <div className="h-10 rounded-lg border border-cyan-500/40 bg-cyan-500/10" />
              <div className="h-10 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10" />
              <div className="h-10 rounded-lg border border-emerald-500/40 bg-emerald-500/10" />
              <div className="h-10 rounded-lg border border-slate-700 bg-slate-900" />
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
