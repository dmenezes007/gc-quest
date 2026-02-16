import type { Session, User } from '@supabase/supabase-js';
import type { AppRole } from './types';
import { roleRank } from './types';

const ROLE_ALIASES: Record<string, AppRole> = {
  user: 'USER',
  gestor: 'GESTOR',
  manager: 'GESTOR',
  admin: 'ADMIN',
};

function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== 'string') {
    return null;
  }

  const role = value.trim().toLowerCase();
  return ROLE_ALIASES[role] ?? null;
}

export function getRoleFromUser(user: User | null | undefined): AppRole {
  if (!user) {
    return 'USER';
  }

  const roleFromAppMetadata = normalizeRole(user.app_metadata?.role);
  if (roleFromAppMetadata) {
    return roleFromAppMetadata;
  }

  const roleFromUserMetadata = normalizeRole(user.user_metadata?.role);
  if (roleFromUserMetadata) {
    return roleFromUserMetadata;
  }

  const appRoles = user.app_metadata?.roles;
  if (Array.isArray(appRoles)) {
    const normalizedRoles = appRoles
      .map((entry) => normalizeRole(entry))
      .filter((entry): entry is AppRole => Boolean(entry));

    if (normalizedRoles.length > 0) {
      return normalizedRoles.sort((a, b) => roleRank[b] - roleRank[a])[0];
    }
  }

  return 'USER';
}

export function getRoleFromSession(session: Session | null | undefined): AppRole {
  return getRoleFromUser(session?.user);
}

export function hasRequiredRole(currentRole: AppRole, minimumRole: AppRole): boolean {
  return roleRank[currentRole] >= roleRank[minimumRole];
}
