export default function ProfilePage() {
  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Painel pessoal com evolução, badges e histórico de impacto.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Current level</p>
          <p className="mt-2 text-xl font-bold text-cyan-300">L2 • Colaborador</p>
        </div>
        <div className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Total XP</p>
          <p className="mt-2 text-xl font-bold text-slate-100">1240</p>
        </div>
        <div className="kq-panel p-4">
          <p className="kq-heading text-[10px] text-slate-500">Unlocked badges</p>
          <p className="mt-2 text-xl font-bold text-fuchsia-300">8</p>
        </div>
      </div>

      <section className="kq-panel p-5">
        <h2 className="kq-heading text-xl text-slate-100">Recent Activity</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>• Validou “Template de Resposta a Incidentes” (+70 XP)</li>
          <li>• Completou missão “Guardião da Qualidade” (+140 XP)</li>
          <li>• Desbloqueou badge “Validador Pro”</li>
        </ul>
      </section>
    </section>
  );
}
