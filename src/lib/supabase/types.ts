export type AppRole = 'USER' | 'MANAGER' | 'ADMIN';

export const roleRank: Record<AppRole, number> = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3,
};
