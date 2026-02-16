export default function AdminPage() {
  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Admin Console</h1>
        <p className="mt-1 text-sm text-slate-400">Gestão de métricas, regras de gamificação e auditoria operacional.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Users</p>
          <p className="mt-2 text-xl font-bold text-slate-100">450</p>
        </div>
        <div className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Knowledge items</p>
          <p className="mt-2 text-xl font-bold text-slate-100">1.280</p>
        </div>
        <div className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Critical coverage</p>
          <p className="mt-2 text-xl font-bold text-cyan-300">92%</p>
        </div>
      </div>

      <section className="kq-panel p-5">
        <h2 className="kq-heading text-xl text-slate-100">Governance Notes</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>• Revisar limiares de badges por setor até o próximo ciclo.</li>
          <li>• Monitorar quedas de validação em áreas críticas.</li>
          <li>• Publicar nova missão transversal de compliance.</li>
        </ul>
      </section>
    </section>
  );
}
