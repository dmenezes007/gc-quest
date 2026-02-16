export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Gestão do Conhecimento</h1>
        <p className="mt-3 text-slate-600">
          Aplicação de gamificação de conhecimento com XP, badges, níveis e leaderboard.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            href="/dashboard"
          >
            Ir para dashboard
          </a>
          <a
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            href="/profile"
          >
            Ver perfil
          </a>
        </div>
      </div>
      </main>

  );
}
