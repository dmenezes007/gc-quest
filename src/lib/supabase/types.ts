export type AppRole = 'USER' | 'GESTOR' | 'ADMIN';

export const roleRank: Record<AppRole, number> = {
  USER: 1,
  GESTOR: 2,
  ADMIN: 3,
};
