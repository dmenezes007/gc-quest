"use client";

import { useEffect, useMemo, useState } from 'react';
import { subscribeToCurrentUserDataChanges } from '@/lib/supabase/realtime';

interface MissionItem {
  id: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  progress: number;
  mission: {
    id: string;
    title: string;
    description: string | null;
    xpReward: number;
    criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    active: boolean;
  };
}

interface MissionsAggregateResponse {
  missions: {
    total: number;
    completed: number;
    items: MissionItem[];
  };
}

function resolveTag(status: MissionItem['status']) {
  switch (status) {
    case 'COMPLETED':
      return {
        label: 'Completed',
        className: 'bg-emerald-500/15 text-emerald-300',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        className: 'bg-cyan-500/15 text-cyan-300',
      };
    case 'EXPIRED':
      return {
        label: 'Expired',
        className: 'bg-rose-500/15 text-rose-300',
      };
    default:
      return {
        label: 'Not Started',
        className: 'bg-fuchsia-500/15 text-fuchsia-300',
      };
  }
}

export default function MissionsPage() {
  const [aggregate, setAggregate] = useState<MissionsAggregateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadMissions() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/dashboard/aggregate');
        if (!response.ok) {
          throw new Error('Falha ao carregar missões.');
        }

        const body = (await response.json()) as { data?: MissionsAggregateResponse };
        if (active && body.data) {
          setAggregate(body.data);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar missões no momento.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMissions();

    const unsubscribe = subscribeToCurrentUserDataChanges(() => {
      void loadMissions();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const missions = aggregate?.missions?.items ?? [];
  const completed = aggregate?.missions?.completed ?? 0;
  const total = aggregate?.missions?.total ?? 0;
  const completionPct = useMemo(() => {
    if (total <= 0) {
      return 0;
    }

    return Math.round((completed / total) * 100);
  }, [completed, total]);

  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Quests</h1>
        <p className="mt-1 text-sm text-slate-400">Missões diárias e semanais com progressão gamificada.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Total quests</p>
          <p className="mt-2 text-4xl font-bold text-slate-100">{total}</p>
        </article>
        <article className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Completed</p>
          <p className="mt-2 text-4xl font-bold text-emerald-300">{completed}</p>
        </article>
        <article className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Completion rate</p>
          <p className="mt-2 text-4xl font-bold text-cyan-300">{completionPct}%</p>
        </article>
      </div>

      {loading ? (
        <div className="kq-panel p-6 text-sm text-slate-300">Carregando missões...</div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {missions.length > 0 ? (
            missions.map((item) => {
              const tag = resolveTag(item.status);
              const progress = Math.max(0, Math.min(100, item.progress));

              return (
                <article key={item.id} className="kq-panel p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`kq-heading rounded px-2 py-0.5 text-[10px] ${tag.className}`}>{tag.label}</span>
                    <span className="text-xs font-semibold text-cyan-300">+{item.mission.xpReward} XP</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-slate-100">{item.mission.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{item.mission.description ?? 'Missão sem descrição.'}</p>
                  <div className="mt-4 h-2 rounded bg-[#152343]">
                    <div className="h-full rounded bg-cyan-400" style={{ width: `${progress}%` }} />
                  </div>
                </article>
              );
            })
          ) : (
            <div className="kq-panel p-6 text-sm text-slate-300 lg:col-span-2">Nenhuma missão atribuída ainda.</div>
          )}
        </div>
      ) : null}
    </section>
  );
}
