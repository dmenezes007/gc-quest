export default function BadgesPage() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h1 className="text-2xl font-bold text-slate-100">Badge Case</h1>
      <p className="mt-2 text-sm text-slate-400">Conquistas desbloqueadas por XP, validações e impacto setorial.</p>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-emerald-600/40 bg-emerald-900/10 p-4">
          <h2 className="font-semibold text-emerald-300">Primeiro Conhecimento</h2>
          <p className="mt-1 text-sm text-slate-300">Publicou o primeiro item na K-Base.</p>
        </article>
        <article className="rounded-lg border border-cyan-600/40 bg-cyan-900/10 p-4">
          <h2 className="font-semibold text-cyan-300">Validador Pro</h2>
          <p className="mt-1 text-sm text-slate-300">Validações aprovadas com consistência.</p>
        </article>
        <article className="rounded-lg border border-fuchsia-600/40 bg-fuchsia-900/10 p-4">
          <h2 className="font-semibold text-fuchsia-300">Guardião Crítico</h2>
          <p className="mt-1 text-sm text-slate-300">Contribuição em conteúdos críticos.</p>
        </article>
      </div>
    </section>
  );
}
