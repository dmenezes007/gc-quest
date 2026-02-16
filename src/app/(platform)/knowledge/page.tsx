export default function KnowledgePage() {
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Knowledge Base</h1>
          <p className="mt-1 text-sm text-slate-400">Map, share and evolve organizational wisdom.</p>
        </div>
        <button
          type="button"
          className="kq-heading rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-5 py-2 text-sm font-bold text-cyan-200"
        >
          + Register Knowledge
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="kq-panel p-4">
          <div className="flex items-center justify-between text-[10px] uppercase">
            <span className="rounded bg-rose-500/20 px-2 py-0.5 text-rose-300">Critical</span>
            <span className="text-slate-500">Processos</span>
          </div>
          <h2 className="mt-3 text-3xl leading-tight font-semibold text-slate-100">Customer Success Onboarding Flow v2</h2>
          <p className="mt-2 text-sm text-slate-400">Updated steps for new enterprise clients after the 2024 CRM migration.</p>
          <p className="mt-4 text-xs font-semibold text-cyan-300">+400 XP • Validated</p>
        </article>

        <article className="kq-panel p-4">
          <div className="flex items-center justify-between text-[10px] uppercase">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300">Essential</span>
            <span className="text-slate-500">Tecnologia</span>
          </div>
          <h2 className="mt-3 text-3xl leading-tight font-semibold text-slate-100">Kubernetes Autoscaling Best Practices</h2>
          <p className="mt-2 text-sm text-slate-400">Guidelines for setting up HPA and VPA in production clusters.</p>
          <p className="mt-4 text-xs font-semibold text-cyan-300">+200 XP • Validate</p>
        </article>

        <article className="kq-panel p-4">
          <div className="flex items-center justify-between text-[10px] uppercase">
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-cyan-300">Normal</span>
            <span className="text-slate-500">Soft Skills</span>
          </div>
          <h2 className="mt-3 text-3xl leading-tight font-semibold text-slate-100">Remote Feedback Framework</h2>
          <p className="mt-2 text-sm text-slate-400">A set of soft skills for giving empathetic and direct feedback.</p>
          <p className="mt-4 text-xs font-semibold text-cyan-300">+100 XP • Validate</p>
        </article>
      </div>
    </section>
  );
}
