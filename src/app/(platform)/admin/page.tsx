export default function AdminPage() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h1 className="text-2xl font-bold text-slate-100">Admin Console</h1>
      <p className="mt-2 text-sm text-slate-400">Gestão de métricas, regras de gamificação e auditoria operacional.</p>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-500">Users</p>
          <p className="mt-2 text-xl font-bold text-slate-100">450</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-500">Knowledge items</p>
          <p className="mt-2 text-xl font-bold text-slate-100">1.280</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-500">Critical coverage</p>
          <p className="mt-2 text-xl font-bold text-cyan-300">92%</p>
        </div>
      </div>
    </section>
  );
}
