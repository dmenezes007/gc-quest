"use client";

import { useEffect, useState } from 'react';
import { subscribeToCurrentUserDataChanges } from '@/lib/supabase/realtime';

interface ProfileAggregateData {
  user: {
    name: string;
    role: string;
  };
  xp: {
    total: number;
  };
  level: {
    current: {
      code: string;
      name: string;
    } | null;
  };
  badges: {
    total: number;
  };
}

export default function ProfilePage() {
  const [aggregate, setAggregate] = useState<ProfileAggregateData | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch('/api/dashboard/aggregate');
        if (!response.ok) {
          return;
        }

        const body = (await response.json()) as { data?: ProfileAggregateData };
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

  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Painel pessoal com evolução, badges e histórico de impacto.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Current level</p>
          <p className="mt-2 text-xl font-bold text-cyan-300">
            {aggregate?.level?.current?.code ?? 'L1'} • {aggregate?.level?.current?.name ?? 'Iniciante'}
          </p>
        </div>
        <div className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Total XP</p>
          <p className="mt-2 text-xl font-bold text-slate-100">{aggregate?.xp?.total ?? 0}</p>
        </div>
        <div className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Unlocked badges</p>
          <p className="mt-2 text-xl font-bold text-fuchsia-300">{aggregate?.badges?.total ?? 0}</p>
        </div>
      </div>

      <section className="kq-panel p-5">
        <h2 className="kq-heading text-xl text-slate-100">Recent Activity</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>• Validou “Template de Resposta a Incidentes” (+70 XP)</li>
          <li>• Completou missão “Guardião da Qualidade” (+140 XP)</li>
          <li>• Desbloqueou badge “Validador Pro”</li>
        </ul>
      </section>
    </section>
  );
}
