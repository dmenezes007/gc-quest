export default function OrgPulsePage() {
  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Org-Pulse</h1>
        <p className="mt-1 text-sm text-slate-400">Panorama estratégico da organização, indicadores e tendências.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="kq-panel p-4 lg:col-span-2">
          <h2 className="kq-heading text-xl text-slate-100">Operational Highlights</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>• Cobertura crítica subiu para 92% no último ciclo.</li>
            <li>• Quests semanais aumentaram validações cruzadas entre setores.</li>
            <li>• Top 10 colaboradores concentram 38% da geração de conhecimento.</li>
          </ul>
        </article>

        <article className="kq-panel p-4">
          <h2 className="kq-heading text-xl text-cyan-300">Pulse Score</h2>
          <p className="mt-3 text-5xl font-black text-slate-100">87</p>
          <p className="mt-1 text-sm text-slate-400">Saúde geral da base organizacional.</p>
        </article>
      </div>
    </section>
  );
}
