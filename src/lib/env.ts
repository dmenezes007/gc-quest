import { z } from 'zod';

const runtimeEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  E2E_MOCK_AUTH: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

type RuntimeEnv = z.infer<typeof runtimeEnvSchema>;

let cachedEnv: RuntimeEnv | null = null;

export function getRuntimeEnv(): RuntimeEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = runtimeEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join('.') || 'env';
    throw new Error(`Environment parsing failed: ${path} ${issue?.message ?? 'Invalid value'}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

interface ValidationOptions {
  requireDatabase?: boolean;
  requireSupabase?: boolean;
}

export function validateRuntimeEnv(options: ValidationOptions = {}): RuntimeEnv {
  const env = getRuntimeEnv();
  const missing: string[] = [];

  if (options.requireDatabase && !env.DATABASE_URL) {
    missing.push('DATABASE_URL');
  }

  if (options.requireSupabase) {
    if (!env.NEXT_PUBLIC_SUPABASE_URL) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }

    if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return env;
}
