import { Leaderboard } from '@/components/dashboard/Leaderboard';

export default function LeaderboardPage() {
  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Leaderboard</h1>
        <p className="mt-1 text-sm text-slate-400">Ranking global de contribuição com regra de desempate determinística.</p>
      </header>

      <Leaderboard />
    </section>
  );
}
