export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Perfil</h1>
        <p className="mt-2 text-sm text-slate-600">
          Visão geral do usuário e atalhos para acompanhar sua evolução na plataforma.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nível atual</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Iniciante</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">XP total</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">0</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Badges</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">0 desbloqueadas</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Ver dashboard
          </a>
          <a
            href="/knowledge"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Explorar conhecimento
          </a>
        </div>
      </section>
    </main>
  );
}
