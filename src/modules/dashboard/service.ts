import { MissionStatus, ValidationStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type {
  DashboardKpi,
  LeaderboardEntry,
  LeaderboardQueryOptions,
  LeaderboardQueryResult,
  DashboardKnowledgeMetrics,
  DashboardLevelInfo,
  OrganizationDashboardAggregation,
  OrganizationSectorRankingItem,
  SectorDashboardAggregation,
  UserDashboardAggregation,
} from './types';

interface DashboardQueryOptions {
  windowDays?: number;
}

function safeDivide(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return numerator / denominator;
}

function percentage(numerator: number, denominator: number): number {
  return Number((safeDivide(numerator, denominator) * 100).toFixed(2));
}

function resolveWindowStart(windowDays: number): Date {
  const now = new Date();
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - windowDays);
  return start;
}

function mapLevel(level: {
  id: string;
  code: string;
  name: string;
  minXp: number;
  maxXp: number | null;
} | null): DashboardLevelInfo | null {
  if (!level) {
    return null;
  }

  return {
    id: level.id,
    code: level.code,
    name: level.name,
    minXp: level.minXp,
    maxXp: level.maxXp,
  };
}

function buildKnowledgeMetrics(
  total: number,
  approved: number,
  criticalTotal: number,
  criticalApproved: number,
): DashboardKnowledgeMetrics {
  return {
    total,
    approved,
    criticalTotal,
    criticalApproved,
    criticalCoveragePct: percentage(criticalApproved, criticalTotal),
  };
}

export async function getUserDashboardAggregation(
  userId: string,
): Promise<UserDashboardAggregation> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      sectorId: true,
      totalXp: true,
      createdAt: true,
      level: {
        select: {
          id: true,
          code: true,
          name: true,
          minXp: true,
          maxXp: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const [
    badgesCount,
    missionsGrouped,
    knowledgeTotal,
    knowledgeApproved,
    criticalKnowledgeTotal,
    criticalKnowledgeApproved,
    validationsTotal,
    validationsApproved,
    usersAboveInXp,
    usersAboveInSectorXp,
  ] = await Promise.all([
    prisma.userBadge.count({
      where: { userId },
    }),
    prisma.userMission.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        _all: true,
      },
    }),
    prisma.knowledgeItem.count({
      where: { authorId: userId },
    }),
    prisma.knowledgeItem.count({
      where: {
        authorId: userId,
        validations: {
          some: {
            status: ValidationStatus.APPROVED,
          },
        },
      },
    }),
    prisma.knowledgeItem.count({
      where: {
        authorId: userId,
        criticality: 'CRITICAL',
      },
    }),
    prisma.knowledgeItem.count({
      where: {
        authorId: userId,
        criticality: 'CRITICAL',
        validations: {
          some: {
            status: ValidationStatus.APPROVED,
          },
        },
      },
    }),
    prisma.validation.count({
      where: {
        validatorId: userId,
      },
    }),
    prisma.validation.count({
      where: {
        validatorId: userId,
        status: ValidationStatus.APPROVED,
      },
    }),
    prisma.user.count({
      where: {
        OR: [
          { totalXp: { gt: user.totalXp } },
          {
            totalXp: user.totalXp,
            createdAt: { lt: user.createdAt },
          },
        ],
      },
    }),
    user.sectorId
      ? prisma.user.count({
          where: {
            sectorId: user.sectorId,
            OR: [
              { totalXp: { gt: user.totalXp } },
              {
                totalXp: user.totalXp,
                createdAt: { lt: user.createdAt },
              },
            ],
          },
        })
      : Promise.resolve(0),
  ]);

  const missionCounts = missionsGrouped.reduce(
    (accumulator, item) => {
      accumulator.total += item._count._all;
      if (item.status === MissionStatus.COMPLETED) {
        accumulator.completed += item._count._all;
      }

      if (item.status === MissionStatus.IN_PROGRESS) {
        accumulator.inProgress += item._count._all;
      }

      return accumulator;
    },
    { total: 0, completed: 0, inProgress: 0 },
  );

  return {
    userId: user.id,
    sectorId: user.sectorId,
    xp: {
      total: user.totalXp,
      rank: {
        overall: usersAboveInXp + 1,
        withinSector: user.sectorId ? usersAboveInSectorXp + 1 : null,
      },
    },
    level: mapLevel(user.level),
    badgesCount,
    missions: {
      total: missionCounts.total,
      completed: missionCounts.completed,
      inProgress: missionCounts.inProgress,
    },
    knowledge: {
      ...buildKnowledgeMetrics(
        knowledgeTotal,
        knowledgeApproved,
        criticalKnowledgeTotal,
        criticalKnowledgeApproved,
      ),
      total: knowledgeTotal,
    },
    validations: {
      total: validationsTotal,
      approved: validationsApproved,
    },
  };
}

export async function getSectorDashboardAggregation(
  sectorId: string,
  options: DashboardQueryOptions = {},
): Promise<SectorDashboardAggregation> {
  const windowDays = options.windowDays ?? 30;
  const windowStart = resolveWindowStart(windowDays);

  const sector = await prisma.sector.findUnique({
    where: { id: sectorId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!sector) {
    throw new Error(`Sector not found: ${sectorId}`);
  }

  const [
    usersCount,
    activeUsersInWindow,
    xpAggregate,
    knowledgeTotal,
    knowledgeApproved,
    criticalKnowledgeTotal,
    criticalKnowledgeApproved,
    missionsTotal,
    missionsActive,
    topUsers,
    sectorXpGroups,
  ] = await Promise.all([
    prisma.user.count({
      where: { sectorId },
    }),
    prisma.user.count({
      where: {
        sectorId,
        xpEvents: {
          some: {
            createdAt: {
              gte: windowStart,
            },
          },
        },
      },
    }),
    prisma.user.aggregate({
      where: { sectorId },
      _sum: { totalXp: true },
      _avg: { totalXp: true },
    }),
    prisma.knowledgeItem.count({
      where: { sectorId },
    }),
    prisma.knowledgeItem.count({
      where: {
        sectorId,
        validations: {
          some: { status: ValidationStatus.APPROVED },
        },
      },
    }),
    prisma.knowledgeItem.count({
      where: {
        sectorId,
        criticality: 'CRITICAL',
      },
    }),
    prisma.knowledgeItem.count({
      where: {
        sectorId,
        criticality: 'CRITICAL',
        validations: {
          some: { status: ValidationStatus.APPROVED },
        },
      },
    }),
    prisma.mission.count({
      where: { sectorId },
    }),
    prisma.mission.count({
      where: {
        sectorId,
        active: true,
      },
    }),
    prisma.user.findMany({
      where: { sectorId },
      orderBy: [{ totalXp: 'desc' }, { createdAt: 'asc' }],
      take: 10,
      select: {
        id: true,
        name: true,
        totalXp: true,
        level: {
          select: {
            code: true,
          },
        },
      },
    }),
    prisma.user.groupBy({
      by: ['sectorId'],
      where: {
        sectorId: { not: null },
      },
      _sum: {
        totalXp: true,
      },
    }),
  ]);

  const orderedSectorXp = sectorXpGroups.sort((left, right) => {
    const leftXp = left._sum.totalXp ?? 0;
    const rightXp = right._sum.totalXp ?? 0;

    if (leftXp !== rightXp) {
      return rightXp - leftXp;
    }

    return (left.sectorId ?? '').localeCompare(right.sectorId ?? '');
  });

  const sectorXpRank = Math.max(1, orderedSectorXp.findIndex((entry) => entry.sectorId === sectorId) + 1);

  return {
    sectorId: sector.id,
    sectorName: sector.name,
    usersCount,
    activeUsersInWindow,
    xp: {
      total: xpAggregate._sum.totalXp ?? 0,
      averagePerUser: Number((xpAggregate._avg.totalXp ?? 0).toFixed(2)),
      rankAmongSectors: sectorXpRank,
    },
    knowledge: buildKnowledgeMetrics(
      knowledgeTotal,
      knowledgeApproved,
      criticalKnowledgeTotal,
      criticalKnowledgeApproved,
    ),
    missions: {
      total: missionsTotal,
      active: missionsActive,
    },
    topUsers: topUsers.map((user) => ({
      id: user.id,
      name: user.name,
      totalXp: user.totalXp,
      levelCode: user.level?.code ?? null,
    })),
  };
}

export async function getOrganizationDashboardAggregation(
  options: DashboardQueryOptions = {},
): Promise<OrganizationDashboardAggregation> {
  const windowDays = options.windowDays ?? 30;
  const windowStart = resolveWindowStart(windowDays);

  const [
    usersCount,
    sectors,
    activeUsersInWindow,
    xpAggregate,
    badgesGranted,
    knowledgeTotal,
    knowledgeApproved,
    criticalKnowledgeTotal,
    criticalKnowledgeApproved,
    missionsTotal,
    missionsActive,
    validationsTotal,
    validationsApproved,
    topUsers,
    sectorXpGroups,
    sectorKnowledgeGroups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.sector.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.user.count({
      where: {
        xpEvents: {
          some: {
            createdAt: {
              gte: windowStart,
            },
          },
        },
      },
    }),
    prisma.user.aggregate({
      _sum: { totalXp: true },
      _avg: { totalXp: true },
    }),
    prisma.userBadge.count(),
    prisma.knowledgeItem.count(),
    prisma.knowledgeItem.count({
      where: {
        validations: {
          some: { status: ValidationStatus.APPROVED },
        },
      },
    }),
    prisma.knowledgeItem.count({
      where: {
        criticality: 'CRITICAL',
      },
    }),
    prisma.knowledgeItem.count({
      where: {
        criticality: 'CRITICAL',
        validations: {
          some: { status: ValidationStatus.APPROVED },
        },
      },
    }),
    prisma.mission.count(),
    prisma.mission.count({
      where: { active: true },
    }),
    prisma.validation.count(),
    prisma.validation.count({
      where: { status: ValidationStatus.APPROVED },
    }),
    prisma.user.findMany({
      orderBy: [{ totalXp: 'desc' }, { createdAt: 'asc' }],
      take: 10,
      select: {
        id: true,
        name: true,
        totalXp: true,
        sector: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.user.groupBy({
      by: ['sectorId'],
      where: {
        sectorId: { not: null },
      },
      _sum: {
        totalXp: true,
      },
    }),
    prisma.knowledgeItem.groupBy({
      by: ['sectorId'],
      where: {
        sectorId: { not: null },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const sectorNameById = new Map(sectors.map((sector) => [sector.id, sector.name]));
  const sectorKnowledgeById = new Map(
    sectorKnowledgeGroups.map((item) => [item.sectorId ?? '', item._count._all]),
  );

  const topSectors: OrganizationSectorRankingItem[] = sectorXpGroups
    .map((item) => {
      const sectorId = item.sectorId ?? '';
      return {
        sectorId,
        sectorName: sectorNameById.get(sectorId) ?? 'Unknown',
        totalXp: item._sum.totalXp ?? 0,
        knowledgeCount: sectorKnowledgeById.get(sectorId) ?? 0,
      };
    })
    .sort((left, right) => {
      if (left.totalXp !== right.totalXp) {
        return right.totalXp - left.totalXp;
      }

      if (left.knowledgeCount !== right.knowledgeCount) {
        return right.knowledgeCount - left.knowledgeCount;
      }

      return left.sectorId.localeCompare(right.sectorId);
    })
    .slice(0, 10);

  return {
    usersCount,
    sectorsCount: sectors.length,
    activeUsersInWindow,
    xp: {
      total: xpAggregate._sum.totalXp ?? 0,
      averagePerUser: Number((xpAggregate._avg.totalXp ?? 0).toFixed(2)),
    },
    badgesGranted,
    knowledge: buildKnowledgeMetrics(
      knowledgeTotal,
      knowledgeApproved,
      criticalKnowledgeTotal,
      criticalKnowledgeApproved,
    ),
    missions: {
      total: missionsTotal,
      active: missionsActive,
    },
    validations: {
      total: validationsTotal,
      approved: validationsApproved,
    },
    rankings: {
      topUsers: topUsers.map((user) => ({
        id: user.id,
        name: user.name,
        totalXp: user.totalXp,
        sectorName: user.sector?.name ?? null,
      })),
      topSectors,
    },
  };
}

export async function getDashboardKpis(): Promise<DashboardKpi[]> {
  const organization = await getOrganizationDashboardAggregation();

  return [
    {
      id: 'users-count',
      label: 'Users',
      value: organization.usersCount,
    },
    {
      id: 'knowledge-total',
      label: 'Knowledge Items',
      value: organization.knowledge.total,
    },
    {
      id: 'critical-coverage',
      label: 'Critical Coverage %',
      value: organization.knowledge.criticalCoveragePct,
    },
    {
      id: 'xp-total',
      label: 'Total XP',
      value: organization.xp.total,
    },
  ];
}

const LEADERBOARD_TIE_BREAK_RULE = ['totalXp:desc', 'createdAt:asc', 'id:asc'];

function normalizeLeaderboardLimit(input: number | undefined): number {
  if (typeof input !== 'number' || Number.isNaN(input)) {
    return 25;
  }

  return Math.max(1, Math.min(100, Math.floor(input)));
}

function mapLeaderboardEntries(
  users: Array<{
    id: string;
    name: string;
    totalXp: number;
    sectorId: string | null;
    createdAt: Date;
    sector: { name: string } | null;
  }>,
): LeaderboardEntry[] {
  return users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    name: user.name,
    sectorId: user.sectorId,
    sectorName: user.sector?.name ?? null,
    totalXp: user.totalXp,
    createdAt: user.createdAt.toISOString(),
  }));
}

export async function getLeaderboard(
  options: LeaderboardQueryOptions = {},
): Promise<LeaderboardQueryResult> {
  const selectedSectorId = options.sectorId && options.sectorId.trim().length > 0
    ? options.sectorId.trim()
    : null;
  const limit = normalizeLeaderboardLimit(options.limit);

  const [sectors, users] = await Promise.all([
    prisma.sector.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.user.findMany({
      where: selectedSectorId ? { sectorId: selectedSectorId } : undefined,
      orderBy: [{ totalXp: 'desc' }, { createdAt: 'asc' }, { id: 'asc' }],
      take: limit,
      select: {
        id: true,
        name: true,
        totalXp: true,
        createdAt: true,
        sectorId: true,
        sector: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    items: mapLeaderboardEntries(users),
    filters: {
      sectors,
      selectedSectorId,
      tieBreakRule: LEADERBOARD_TIE_BREAK_RULE,
    },
  };
}
