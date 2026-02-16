'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route segment error boundary triggered', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-slate-900">Algo deu errado</h2>
      <p className="mt-2 text-sm text-slate-600">
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
