export default function MissionsPage() {
  return (
    <section className="space-y-5">
      <header>
        <h1 className="kq-heading text-4xl font-extrabold text-slate-100">Quests</h1>
        <p className="mt-1 text-sm text-slate-400">Missões diárias e semanais com progressão gamificada.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="kq-panel p-4">
          <div className="flex items-center justify-between">
            <span className="kq-heading rounded bg-fuchsia-500/15 px-2 py-0.5 text-[10px] text-fuchsia-300">Daily</span>
            <span className="text-xs font-semibold text-cyan-300">+150 XP</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-slate-100">Explorador Diário</h2>
          <p className="mt-1 text-sm text-slate-400">Registre 1 conhecimento hoje.</p>
          <div className="mt-4 h-2 rounded bg-[#152343]">
            <div className="h-full w-[8%] rounded bg-fuchsia-400" />
          </div>
        </article>

        <article className="kq-panel p-4">
          <div className="flex items-center justify-between">
            <span className="kq-heading rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-300">Weekly</span>
            <span className="text-xs font-semibold text-cyan-300">+450 XP</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-slate-100">Guardião da Qualidade</h2>
          <p className="mt-1 text-sm text-slate-400">Valide 3 conhecimentos de outros usuários.</p>
          <div className="mt-4 h-2 rounded bg-[#152343]">
            <div className="h-full w-1/3 rounded bg-cyan-400" />
          </div>
        </article>
      </div>
    </section>
  );
}
