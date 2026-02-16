export default function ProfilePage() {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
      <p className="mt-2 text-sm text-slate-400">Painel pessoal com evolução, badges e atalhos operacionais.</p>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-500">Current level</p>
          <p className="mt-2 text-xl font-bold text-cyan-300">L2 • Colaborador</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-500">Total XP</p>
          <p className="mt-2 text-xl font-bold text-slate-100">1240</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-xs uppercase text-slate-500">Unlocked badges</p>
          <p className="mt-2 text-xl font-bold text-fuchsia-300">8</p>
        </div>
      </div>
    </section>
  );
}
