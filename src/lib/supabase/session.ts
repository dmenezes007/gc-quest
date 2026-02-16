import type { Session, User } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from './server';
import { getRoleFromSession } from './roles';
import type { AppRole } from './types';

async function getMockUserFromHeaders(): Promise<User | null> {
  if (process.env.E2E_MOCK_AUTH !== 'true') {
    return null;
  }

  const headerStore = await headers();
  const userId = headerStore.get('x-e2e-user-id')?.trim();

  if (!userId) {
    return null;
  }

  const email = headerStore.get('x-e2e-user-email')?.trim() || `${userId}@e2e.local`;
  const role = headerStore.get('x-e2e-user-role')?.trim() || 'USER';
  const name = headerStore.get('x-e2e-user-name')?.trim() || 'E2E User';

  return {
    id: userId,
    app_metadata: {
      provider: 'e2e',
      providers: ['e2e'],
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
    user_metadata: {
      role,
      app_role: role,
      name,
    },
  } as unknown as User;
}

export async function getServerSession(): Promise<Session | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getServerUser(): Promise<User | null> {
  const mockUser = await getMockUserFromHeaders();
  if (mockUser) {
    return mockUser;
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getServerRole(): Promise<AppRole> {
  const session = await getServerSession();
  return getRoleFromSession(session);
}
