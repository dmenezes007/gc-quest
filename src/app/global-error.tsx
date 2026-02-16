'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0">
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Falha crítica da aplicação</h1>
          <p className="mt-2 text-sm text-slate-600">
            Não foi possível renderizar a aplicação no momento.
          </p>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-4 max-h-56 w-full overflow-auto rounded-md bg-slate-100 p-3 text-left text-xs text-slate-700">
              {error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Recarregar aplicação
          </button>
        </div>
      </body>
    </html>
  );
}
