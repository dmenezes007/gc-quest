import type { AppRole } from './roles';
import { roleRank } from './roles';
import type { PermissionAction } from './rules';
import { getPermissionsForRole } from './rules';

export function canAccess(role: AppRole, required: AppRole): boolean {
  return roleRank[role] >= roleRank[required];
}

export function can(role: AppRole, permission: PermissionAction): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function canAny(role: AppRole, permissions: PermissionAction[]): boolean {
  return permissions.some((permission) => can(role, permission));
}

export function canAll(role: AppRole, permissions: PermissionAction[]): boolean {
  return permissions.every((permission) => can(role, permission));
}

export function assertPermission(role: AppRole, permission: PermissionAction): void {
  if (!can(role, permission)) {
    throw new Error(`Access denied for permission: ${permission}`);
  }
}
