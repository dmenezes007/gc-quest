import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerUser } from '@/lib/supabase/session';
import { prisma } from '@/lib/prisma';
import { validateRuntimeEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { formatZodError } from '@/lib/validation';

const aggregateQuerySchema = z.object({
  windowDays: z.coerce.number().int().min(1).max(365).optional(),
});

type IsoDate = string;

function toUtcDateKey(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function calculateCurrentStreak(activityDates: Date[]): number {
  if (activityDates.length === 0) {
    return 0;
  }

  const uniqueDates = new Set(activityDates.map((date) => toUtcDateKey(date)));
  const sorted = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a));
  const latestDate = sorted[0];

  const today = new Date();
  const todayKey = toUtcDateKey(today);
  const yesterdayKey = toUtcDateKey(addDays(today, -1));

  if (latestDate !== todayKey && latestDate !== yesterdayKey) {
    return 0;
  }

  let streak = 0;
  let cursor = new Date(`${latestDate}T00:00:00.000Z`);

  while (uniqueDates.has(toUtcDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

async function ensureLocalUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const email = typeof user.email === 'string' && user.email.trim().length > 0
    ? user.email.trim().toLowerCase()
    : `${user.id}@local.invalid`;

  const metadataName = user.user_metadata?.name;
  const fallbackName = typeof metadataName === 'string' && metadataName.trim().length > 0
    ? metadataName.trim()
    : email.split('@')[0];

  return prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email,
      name: fallbackName,
      role: Role.USER,
    },
    update: {
      email,
      name: fallbackName,
    },
    include: {
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
}

export async function GET(request: Request) {
  try {
    validateRuntimeEnv({
      requireDatabase: true,
      requireSupabase: process.env.E2E_MOCK_AUTH !== 'true',
    });

    const url = new URL(request.url);
    aggregateQuerySchema.parse({
      windowDays: url.searchParams.get('windowDays') ?? undefined,
    });

    const authUser = await getServerUser();

    if (!authUser) {
      logger.warn('Unauthorized dashboard aggregate access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await ensureLocalUser({
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata,
    });

    const [
      nextLevel,
      badgeEntries,
      missionEntries,
      recentActivity,
      knowledgeTotal,
      validationsTotal,
      totalUsers,
      usersAbove,
    ] = await Promise.all([
      prisma.level.findFirst({
        where: {
          minXp: {
            gt: user.totalXp,
          },
        },
        orderBy: {
          minXp: 'asc',
        },
        select: {
          id: true,
          code: true,
          name: true,
          minXp: true,
          maxXp: true,
        },
      }),
      prisma.userBadge.findMany({
        where: { userId: user.id },
        orderBy: { grantedAt: 'desc' },
        select: {
          grantedAt: true,
          badge: {
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
              xpReward: true,
            },
          },
        },
      }),
      prisma.userMission.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          status: true,
          progress: true,
          startedAt: true,
          completedAt: true,
          updatedAt: true,
          mission: {
            select: {
              id: true,
              code: true,
              title: true,
              description: true,
              xpReward: true,
              criticality: true,
              active: true,
            },
          },
        },
      }),
      prisma.xpEvent.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
        take: 90,
      }),
      prisma.knowledgeItem.count({
        where: { authorId: user.id },
      }),
      prisma.validation.count({
        where: { validatorId: user.id },
      }),
      prisma.user.count(),
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
    ]);

    const leaderboardPosition = usersAbove + 1;
    const currentStreak = calculateCurrentStreak(recentActivity.map((event) => event.createdAt));

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sectorId: user.sectorId,
        },
        xp: {
          total: user.totalXp,
        },
        level: {
          current: user.level,
          next: nextLevel,
          xpToNextLevel: nextLevel ? Math.max(0, nextLevel.minXp - user.totalXp) : null,
        },
        badges: {
          total: badgeEntries.length,
          items: badgeEntries.map((entry) => ({
            ...entry.badge,
            grantedAt: entry.grantedAt,
          })),
        },
        knowledge: {
          total: knowledgeTotal,
        },
        validations: {
          total: validationsTotal,
        },
        missions: {
          total: missionEntries.length,
          completed: missionEntries.filter((entry) => entry.status === 'COMPLETED').length,
          items: missionEntries,
        },
        streak: {
          current: currentStreak,
        },
        leaderboard: {
          position: leaderboardPosition,
          totalUsers,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid dashboard aggregate query', {
        issues: error.issues,
      });
      return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
    }

    logger.error('Dashboard aggregate route failed', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}