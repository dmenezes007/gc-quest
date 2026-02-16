export default function KnowledgePage() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h1 className="text-2xl font-bold text-slate-100">K-Base</h1>
      <p className="mt-2 text-sm text-slate-400">Base de conhecimento com foco em contribuição, validação e reuso.</p>

      <div className="mt-6 space-y-3">
        <article className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <h2 className="font-semibold text-slate-100">Guia de Classificação de Dados Pessoais</h2>
          <p className="mt-1 text-sm text-slate-400">Publicado por Ana Souza • +130 XP</p>
        </article>
        <article className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <h2 className="font-semibold text-slate-100">Template de Resposta a Incidentes</h2>
          <p className="mt-1 text-sm text-slate-400">Publicado por Bruno Lima • +140 XP</p>
        </article>
      </div>
    </section>
  );
}
