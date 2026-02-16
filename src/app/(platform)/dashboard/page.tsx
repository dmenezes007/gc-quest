import { Leaderboard } from '@/components/dashboard/Leaderboard';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 p-8 shadow-lg shadow-cyan-950/20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Agent ready</p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-slate-100">Welcome back, Alex</h1>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">Rank position</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">#04 / 450</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">Level progress</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">74%</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-xs uppercase text-slate-400">Knowledge assets</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">28</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold text-slate-100">Active missions</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <article className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
                <p className="text-xs uppercase text-fuchsia-300">Daily</p>
                <h3 className="mt-2 font-semibold text-slate-100">Explorador Diário</h3>
                <p className="mt-1 text-sm text-slate-400">Registre 1 conhecimento hoje.</p>
              </article>
              <article className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
                <p className="text-xs uppercase text-cyan-300">Weekly</p>
                <h3 className="mt-2 font-semibold text-slate-100">Guardião da Qualidade</h3>
                <p className="mt-1 text-sm text-slate-400">Valide 3 conhecimentos de outros usuários.</p>
              </article>
            </div>
          </div>

          <Leaderboard />
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-sm uppercase tracking-wide text-slate-400">Profile snapshot</h2>
            <p className="mt-3 text-xl font-bold text-slate-100">Alex Sterling</p>
            <p className="text-sm text-slate-400">Technology Unit</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                <p className="text-xs uppercase text-slate-500">Validations</p>
                <p className="mt-1 font-semibold text-cyan-300">42</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                <p className="text-xs uppercase text-slate-500">XP streak</p>
                <p className="mt-1 font-semibold text-fuchsia-300">12</p>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
