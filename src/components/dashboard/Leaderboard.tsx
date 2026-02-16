'use client';

import { useEffect, useMemo, useState } from 'react';

interface LeaderboardSectorFilter {
  id: string;
  name: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  sectorId: string | null;
  sectorName: string | null;
  totalXp: number;
  createdAt: string;
}

interface LeaderboardResponse {
  data: {
    items: LeaderboardEntry[];
    filters: {
      sectors: LeaderboardSectorFilter[];
      selectedSectorId: string | null;
      tieBreakRule: string[];
    };
  };
}

async function fetchLeaderboard(sectorId: string): Promise<LeaderboardResponse['data']> {
  const search = new URLSearchParams();
  if (sectorId) {
    search.set('sectorId', sectorId);
  }

  const query = search.toString();
  const response = await fetch(`/api/dashboard/leaderboard${query ? `?${query}` : ''}`);
  const body = (await response.json()) as LeaderboardResponse & { error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  return body.data;
}

export function Leaderboard() {
  const [selectedSectorId, setSelectedSectorId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<LeaderboardEntry[]>([]);
  const [sectors, setSectors] = useState<LeaderboardSectorFilter[]>([]);
  const [tieBreakRule, setTieBreakRule] = useState<string[]>([]);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchLeaderboard(selectedSectorId);
        if (!isActive) {
          return;
        }

        setItems(data.items);
        setSectors(data.filters.sectors);
        setTieBreakRule(data.filters.tieBreakRule);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : 'Failed to load leaderboard';
        setError(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [selectedSectorId]);

  const tieBreakLabel = useMemo(() => tieBreakRule.join(' → '), [tieBreakRule]);

  return (
    <section className="w-full rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Leaderboard</h2>
          <p className="mt-1 text-sm text-slate-400">Ranking de usuários por XP com regra de desempate determinística.</p>
        </div>

        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Setor
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
            value={selectedSectorId}
            onChange={(event) => setSelectedSectorId(event.target.value)}
          >
            <option value="">Todos os setores</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-xs text-slate-500">Tie-break: {tieBreakLabel || 'totalXp:desc → createdAt:asc → id:asc'}</p>

      {isLoading && <p className="mt-4 text-sm text-slate-400">Carregando ranking...</p>}
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      {!isLoading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Usuário</th>
                <th className="px-2 py-2">Setor</th>
                <th className="px-2 py-2 text-right">XP</th>
                <th className="px-2 py-2">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.userId} className="border-b border-slate-800 text-sm text-slate-300">
                  <td className="px-2 py-2 font-semibold text-slate-100">{item.rank}</td>
                  <td className="px-2 py-2">{item.name}</td>
                  <td className="px-2 py-2">{item.sectorName ?? 'Sem setor'}</td>
                  <td className="px-2 py-2 text-right font-semibold text-cyan-300">{item.totalXp}</td>
                  <td className="px-2 py-2">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && <p className="mt-3 text-sm text-slate-400">Nenhum usuário encontrado para este filtro.</p>}
        </div>
      )}
    </section>
  );
}
