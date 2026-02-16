import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { validateRuntimeEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { guardWithRoleMetadata } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  if (process.env.E2E_MOCK_AUTH === 'true' && request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  try {
    validateRuntimeEnv({
      requireSupabase: true,
    });
  } catch (error) {
    logger.error('Environment validation failed in middleware', error, {
      path: request.nextUrl.pathname,
    });

    return NextResponse.json(
      { error: 'Server environment is not configured correctly.' },
      { status: 500 },
    );
  }

  try {
    return guardWithRoleMetadata(request, {
      signInPath: '/',
      roleRules: {
        '/gestor': 'GESTOR',
        '/admin': 'ADMIN',
      },
    });
  } catch (error) {
    logger.error('Unhandled middleware error', error, {
      path: request.nextUrl.pathname,
    });

    return NextResponse.json({ error: 'Internal middleware error.' }, { status: 500 });
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
