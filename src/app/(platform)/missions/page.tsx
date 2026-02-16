export default function MissionsPage() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h1 className="text-2xl font-bold text-slate-100">Quests</h1>
      <p className="mt-2 text-sm text-slate-400">Missões ativas para aumentar engajamento e pontuação da equipe.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-fuchsia-300">Daily</p>
          <h2 className="mt-2 font-semibold text-slate-100">Explorador Diário</h2>
          <p className="mt-1 text-sm text-slate-400">Registre 1 conhecimento hoje.</p>
        </article>
        <article className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-cyan-300">Weekly</p>
          <h2 className="mt-2 font-semibold text-slate-100">Guardião da Qualidade</h2>
          <p className="mt-1 text-sm text-slate-400">Valide 3 conteúdos da equipe.</p>
        </article>
      </div>
    </section>
  );
}
