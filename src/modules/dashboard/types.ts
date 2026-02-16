export interface DashboardKpi {
  id: string;
  label: string;
  value: number;
}

export interface DashboardLevelInfo {
  id: string;
  code: string;
  name: string;
  minXp: number;
  maxXp: number | null;
}

export interface DashboardKnowledgeMetrics {
  total: number;
  approved: number;
  criticalTotal: number;
  criticalApproved: number;
  criticalCoveragePct: number;
}

export interface DashboardMissionMetrics {
  total: number;
  active?: number;
  completed?: number;
  inProgress?: number;
}

export interface DashboardValidationMetrics {
  total: number;
  approved: number;
}

export interface DashboardLeaderboardPosition {
  overall: number;
  withinSector: number | null;
}

export interface UserDashboardAggregation {
  userId: string;
  sectorId: string | null;
  xp: {
    total: number;
    rank: DashboardLeaderboardPosition;
  };
  level: DashboardLevelInfo | null;
  badgesCount: number;
  missions: DashboardMissionMetrics;
  knowledge: DashboardKnowledgeMetrics;
  validations: DashboardValidationMetrics;
}

export interface SectorUserRankingItem {
  id: string;
  name: string;
  totalXp: number;
  levelCode: string | null;
}

export interface SectorDashboardAggregation {
  sectorId: string;
  sectorName: string;
  usersCount: number;
  activeUsersInWindow: number;
  xp: {
    total: number;
    averagePerUser: number;
    rankAmongSectors: number;
  };
  knowledge: DashboardKnowledgeMetrics;
  missions: DashboardMissionMetrics;
  topUsers: SectorUserRankingItem[];
}

export interface OrganizationUserRankingItem {
  id: string;
  name: string;
  totalXp: number;
  sectorName: string | null;
}

export interface OrganizationSectorRankingItem {
  sectorId: string;
  sectorName: string;
  totalXp: number;
  knowledgeCount: number;
}

export interface OrganizationDashboardAggregation {
  usersCount: number;
  sectorsCount: number;
  activeUsersInWindow: number;
  xp: {
    total: number;
    averagePerUser: number;
  };
  badgesGranted: number;
  knowledge: DashboardKnowledgeMetrics;
  missions: DashboardMissionMetrics;
  validations: DashboardValidationMetrics;
  rankings: {
    topUsers: OrganizationUserRankingItem[];
    topSectors: OrganizationSectorRankingItem[];
  };
}

export interface LeaderboardQueryOptions {
  sectorId?: string;
  limit?: number;
}

export interface LeaderboardSectorFilter {
  id: string;
  name: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  sectorId: string | null;
  sectorName: string | null;
  totalXp: number;
  createdAt: string;
}

export interface LeaderboardQueryResult {
  items: LeaderboardEntry[];
  filters: {
    sectors: LeaderboardSectorFilter[];
    selectedSectorId: string | null;
    tieBreakRule: string[];
  };
}
