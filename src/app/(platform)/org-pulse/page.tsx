"use client";

import { useEffect, useMemo, useState } from 'react';

interface OrgPulseData {
  pulseScore: number;
  organization: {
    usersCount: number;
    activeUsersInWindow: number;
    badgesGranted: number;
    knowledge: {
      criticalCoveragePct: number;
    };
    missions: {
      total: number;
      active?: number;
    };
    validations: {
      total: number;
      approved: number;
    };
    rankings: {
      topUsers: Array<{
        id: string;
        name: string;
        totalXp: number;
      }>;
    };
  };
  indicators: {
    validationApprovalPct: number;
    activeUsersPct: number;
  };
}

export default function OrgPulsePage() {
  const [data, setData] = useState<OrgPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPulse() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/dashboard/org-pulse');
        if (!response.ok) {
          throw new Error('Falha ao carregar Org Pulse.');
        }

        const body = (await response.json()) as { data?: OrgPulseData };
        if (active && body.data) {
          setData(body.data);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os indicadores organizacionais.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPulse();

    return () => {
      active = false;
    };
  }, []);

  const concentrationPct = useMemo(() => {
    if (!data || data.organization.rankings.topUsers.length === 0) {
      return 0;
    }

    const totalXp = data.organization.rankings.topUsers.reduce((sum, item) => sum + item.totalXp, 0);
    if (totalXp <= 0) {
      return 0;
    }

    const topThreeXp = data.organization.rankings.topUsers.slice(0, 3).reduce((sum, item) => sum + item.totalXp, 0);
    return Math.round((topThreeXp / totalXp) * 100);
  }, [data]);

  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Org-Pulse</h1>
        <p className="mt-1 text-sm text-slate-400">Panorama estratégico da organização, indicadores e tendências.</p>
      </header>

      {loading ? <div className="kq-panel p-6 text-sm text-slate-300">Carregando panorama organizacional...</div> : null}
      {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="kq-panel p-4 lg:col-span-2">
          <h2 className="kq-heading text-xl text-slate-100">Operational Highlights</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>• Cobertura crítica atual: {Math.round(data?.organization.knowledge.criticalCoveragePct ?? 0)}%.</li>
            <li>• Taxa de aprovação das validações: {Math.round(data?.indicators.validationApprovalPct ?? 0)}%.</li>
            <li>• Usuários ativos no ciclo: {Math.round(data?.indicators.activeUsersPct ?? 0)}% da base.</li>
            <li>• Concentração de XP nos top 3 do leaderboard: {concentrationPct}%.</li>
            <li>• Missões ativas: {data?.organization.missions.active ?? 0} de {data?.organization.missions.total ?? 0}.</li>
          </ul>
        </article>

        <article className="kq-panel p-4">
          <h2 className="kq-heading text-xl text-cyan-300">Pulse Score</h2>
          <p className="mt-3 text-5xl font-black text-slate-100">{data?.pulseScore ?? 0}</p>
          <p className="mt-1 text-sm text-slate-400">Saúde geral da base organizacional.</p>
          <p className="mt-4 text-xs text-slate-500">Badges concedidos: {data?.organization.badgesGranted ?? 0}</p>
        </article>
      </div>
    </section>
  );
}
