import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from './env';
import { getRoleFromUser, hasRequiredRole } from './roles';
import type { AppRole } from './types';

export interface AuthGuardOptions {
  signInPath?: string;
  roleRules?: Record<string, AppRole>;
}

function pathMatches(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function resolveRequiredRole(pathname: string, roleRules?: Record<string, AppRole>): AppRole | null {
  if (!roleRules) {
    return null;
  }

  for (const [pathPrefix, requiredRole] of Object.entries(roleRules)) {
    if (pathMatches(pathname, pathPrefix)) {
      return requiredRole;
    }
  }

  return null;
}

function redirectTo(request: NextRequest, targetPath: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  url.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { url, anonKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookieList) {
        cookieList.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookieList.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getSession();
  return response;
}

export async function guardWithRoleMetadata(
  request: NextRequest,
  options: AuthGuardOptions,
): Promise<NextResponse> {
  const { url, anonKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookieList) {
        cookieList.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookieList.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user
    ? session.user
    : (
      await supabase.auth.getUser()
    ).data.user;

  const requiredRole = resolveRequiredRole(request.nextUrl.pathname, options.roleRules);
  const signInPath = options.signInPath ?? '/login';

  if ((!session || !user) && requiredRole) {
    return redirectTo(request, signInPath);
  }

  if (requiredRole && user) {
    const currentRole = getRoleFromUser(user as User);
    if (!hasRequiredRole(currentRole, requiredRole)) {
      return redirectTo(request, '/');
    }
  }

  return response;
}
