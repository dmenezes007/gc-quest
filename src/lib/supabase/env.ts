import { validateRuntimeEnv } from '@/lib/env';

export function getSupabaseEnv() {
  const env = validateRuntimeEnv({ requireSupabase: true });

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}
