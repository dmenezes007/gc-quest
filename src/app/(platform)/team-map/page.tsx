"use client";

import { useEffect, useMemo, useState } from 'react';

interface TeamMapData {
  organization: {
    usersCount: number;
    activeUsersInWindow: number;
    xp: {
      total: number;
    };
    knowledge: {
      criticalCoveragePct: number;
    };
    validations: {
      total: number;
      approved: number;
    };
    rankings: {
      topSectors: Array<{
        sectorId: string;
        sectorName: string;
        totalXp: number;
        knowledgeCount: number;
      }>;
    };
  };
  sector: {
    sectorName: string;
    usersCount: number;
    xp: {
      total: number;
      averagePerUser: number;
      rankAmongSectors: number;
    };
    knowledge: {
      criticalCoveragePct: number;
    };
  } | null;
}

export default function TeamMapPage() {
  const [data, setData] = useState<TeamMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/dashboard/team-map');
        if (!response.ok) {
          throw new Error('Falha ao carregar Team Intelligence.');
        }

        const body = (await response.json()) as { data?: TeamMapData };
        if (active && body.data) {
          setData(body.data);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os dados de Team Intelligence.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const validationRate = useMemo(() => {
    if (!data || data.organization.validations.total <= 0) {
      return 0;
    }

    return Math.round((data.organization.validations.approved / data.organization.validations.total) * 100);
  }, [data]);

  const xpVelocity = useMemo(() => {
    if (!data) {
      return 0;
    }

    return Math.round(data.organization.xp.total / 30);
  }, [data]);

  const sectorBars = data?.organization.rankings.topSectors.slice(0, 5) ?? [];
  const maxSectorXp = Math.max(...sectorBars.map((item) => item.totalXp), 1);

  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Team Intelligence</h1>
        <p className="mt-1 text-sm text-slate-400">Real-time analysis of team knowledge distribution and gaps.</p>
      </header>

      {loading ? <div className="kq-panel p-6 text-sm text-slate-300">Carregando analytics do time...</div> : null}
      {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div> : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[
          {
            title: 'Total members',
            value: String(data?.sector?.usersCount ?? data?.organization.usersCount ?? 0),
            note: data?.sector ? `Setor ${data.sector.sectorName}` : 'Active players',
          },
          {
            title: 'Critical gap',
            value: `${Math.max(0, 100 - Math.round(data?.organization.knowledge.criticalCoveragePct ?? 0))}%`,
            note: 'Cobertura crítica pendente',
          },
          {
            title: 'Validation rate',
            value: `${validationRate}%`,
            note: 'Aprovação de validações',
          },
          {
            title: 'XP velocity',
            value: `${xpVelocity}`,
            note: 'XP médio diário (último ciclo)',
          },
        ].map((item) => (
          <article key={item.title} className="kq-panel p-4">
            <p className="kq-heading text-[10px] text-slate-500">{item.title}</p>
            <p className="mt-2 text-4xl font-bold text-slate-100">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.note}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="kq-panel p-5">
          <h2 className="kq-heading text-xl text-cyan-300">Knowledge Coverage %</h2>
          <div className="mt-4 grid h-56 grid-cols-5 items-end gap-4">
            {sectorBars.length > 0 ? (
              sectorBars.map((item) => {
                const height = Math.max(12, Math.round((item.totalXp / maxSectorXp) * 100));

                return (
                  <div key={item.sectorId} className="space-y-2 text-center text-[10px] text-slate-500">
                    <div className="mx-auto w-8 rounded-t bg-cyan-400/80" style={{ height: `${height}%` }} />
                    <p>{item.sectorName}</p>
                  </div>
                );
              })
            ) : (
              <div className="col-span-5 flex items-center justify-center text-sm text-slate-400">Sem dados setoriais disponíveis.</div>
            )}
          </div>
        </section>

        <section className="kq-panel p-5">
          <h2 className="kq-heading text-xl text-fuchsia-300">Skill Overlay</h2>
          <div className="mt-4 h-56 rounded-xl border border-slate-700 bg-[#0a122b] p-4">
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Setor no ranking XP</span>
                <span className="font-semibold text-fuchsia-300">#{data?.sector?.xp.rankAmongSectors ?? '-'}</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span>XP médio por usuário</span>
                <span className="font-semibold text-cyan-300">{Math.round(data?.sector?.xp.averagePerUser ?? 0)}</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Cobertura crítica do setor</span>
                <span className="font-semibold text-emerald-300">{Math.round(data?.sector?.knowledge.criticalCoveragePct ?? 0)}%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Usuários ativos no ciclo</span>
                <span className="font-semibold text-slate-100">{data?.organization.activeUsersInWindow ?? 0}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </section>
  );
}
