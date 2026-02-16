import type { AppRole } from './roles';

export type PermissionAction =
  | 'knowledge:create'
  | 'knowledge:validate'
  | 'dashboard:sector:view'
  | 'admin:configuration:manage';

export const ROLE_PERMISSIONS: Record<AppRole, PermissionAction[]> = {
  USER: ['knowledge:create'],
  MANAGER: ['knowledge:create', 'knowledge:validate', 'dashboard:sector:view'],
  ADMIN: [
    'knowledge:create',
    'knowledge:validate',
    'dashboard:sector:view',
    'admin:configuration:manage',
  ],
};

export function getPermissionsForRole(role: AppRole): PermissionAction[] {
  return ROLE_PERMISSIONS[role];
}
