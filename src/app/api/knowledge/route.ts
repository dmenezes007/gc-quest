import { Criticality, KnowledgeType, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { GamificationRepository, LevelDefinition, UserProgress } from '@/modules/gamification-engine';
import { createGamificationService } from '@/modules/gamification-engine';
import { getServerUser } from '@/lib/supabase/session';
import { prisma } from '@/lib/prisma';
import { validateRuntimeEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import {
  formatZodError,
  sanitizeKnowledgeContent,
  sanitizeKnowledgeTag,
  sanitizeKnowledgeText,
} from '@/lib/validation';

const createKnowledgePayloadSchema = z.object({
  title: z
    .string()
    .max(160)
    .transform((value) => sanitizeKnowledgeText(value))
    .refine((value) => value.length >= 3, 'title must have at least 3 characters after sanitization'),
  content: z
    .string()
    .max(12_000)
    .transform((value) => sanitizeKnowledgeContent(value))
    .refine((value) => value.length >= 10, 'content must have at least 10 characters after sanitization'),
  summary: z
    .string()
    .max(500)
    .optional()
    .transform((value) => (typeof value === 'string' ? sanitizeKnowledgeText(value) : undefined))
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  type: z.nativeEnum(KnowledgeType),
  criticality: z.nativeEnum(Criticality),
  tags: z
    .array(z.string().max(60))
    .max(20)
    .optional()
    .transform((values) => {
      if (!values) {
        return [];
      }

      const deduplicated = new Set(values.map((entry) => sanitizeKnowledgeTag(entry)).filter(Boolean));
      return Array.from(deduplicated);
    }),
  sectorId: z.string().uuid().optional(),
  sectorMultiplier: z.number().finite().positive().max(10).optional(),
});

function mapCriticalityForXp(criticality: Criticality): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  return criticality;
}

function mapLevel(level: { id: string; code: string; minXp: number; maxXp: number | null }): LevelDefinition {
  return {
    id: level.id,
    code: level.code,
    minXp: level.minXp,
    maxXp: level.maxXp,
  };
}

function createGamificationRepository(): GamificationRepository {
  return {
    async getUserProgress(userId: string): Promise<UserProgress | null> {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, totalXp: true, levelId: true },
      });

      return user
        ? {
            id: user.id,
            totalXp: user.totalXp,
            levelId: user.levelId,
          }
        : null;
    },

    async listLevels() {
      const levels = await prisma.level.findMany({
        orderBy: { minXp: 'asc' },
      });

      return levels.map((level) => mapLevel(level));
    },

    async insertXpEvent(input) {
      await prisma.xpEvent.create({
        data: {
          userId: input.userId,
          points: input.points,
          reason: input.reason,
          knowledgeItemId: typeof input.metadata?.knowledgeId === 'string' ? input.metadata.knowledgeId : null,
          sectorId: typeof input.metadata?.sectorId === 'string' ? input.metadata.sectorId : null,
        },
      });
    },

    async updateUserProgress(userId, payload) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: payload.totalXp,
          levelId: payload.levelId,
        },
      });
    },

    async getUserBadgeStats(userId) {
      const [user, knowledgeCount, criticalKnowledgeCount, validationsReceived] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { totalXp: true },
        }),
        prisma.knowledgeItem.count({
          where: { authorId: userId },
        }),
        prisma.knowledgeItem.count({
          where: { authorId: userId, criticality: Criticality.CRITICAL },
        }),
        prisma.validation.count({
          where: {
            knowledgeItem: {
              authorId: userId,
            },
            status: 'APPROVED',
          },
        }),
      ]);

      return {
        xp: user?.totalXp ?? 0,
        knowledgeCount,
        criticalKnowledgeCount,
        validationsReceived,
      };
    },

    async listBadgeRules() {
      const badges = await prisma.badge.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          xpReward: true,
        },
      });

      return badges.map((badge) => ({
        id: badge.id,
        code: badge.code,
        name: badge.name,
        thresholds: {
          minXp: Math.max(1, badge.xpReward),
        },
      }));
    },

    async listGrantedBadgeIds(userId) {
      const entries = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true },
      });

      return entries.map((entry) => entry.badgeId);
    },

    async grantBadgeToUser(userId, badgeId) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
        },
      });
    },
  };
}

async function ensureLocalUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const email = typeof user.email === 'string' && user.email.trim().length > 0
    ? user.email.trim().toLowerCase()
    : `${user.id}@local.invalid`;

  const metadataName = user.user_metadata?.name;
  const fallbackName = typeof metadataName === 'string' && metadataName.trim().length > 0
    ? metadataName.trim()
    : email.split('@')[0];

  await prisma.user.upsert({
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
  });
}

export async function POST(request: Request) {
  try {
    validateRuntimeEnv({
      requireDatabase: true,
      requireSupabase: process.env.E2E_MOCK_AUTH !== 'true',
    });

    const authUser = await getServerUser();

    if (!authUser) {
      logger.warn('Unauthorized knowledge create attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = createKnowledgePayloadSchema.parse(await request.json());

    await ensureLocalUser({
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata,
    });

    if (payload.sectorId) {
      const sectorExists = await prisma.sector.findUnique({
        where: { id: payload.sectorId },
        select: { id: true },
      });

      if (!sectorExists) {
        return NextResponse.json({ error: 'Invalid sectorId.' }, { status: 400 });
      }
    }

    const knowledge = await prisma.knowledgeItem.create({
      data: {
        title: payload.title,
        summary: payload.summary,
        content: payload.content,
        type: payload.type,
        criticality: payload.criticality,
        tags: payload.tags,
        authorId: authUser.id,
        sectorId: payload.sectorId ?? null,
      },
    });

    const gamificationService = createGamificationService(createGamificationRepository());
    const xpResult = await gamificationService.awardXp({
      userId: authUser.id,
      reason: 'knowledge:create',
      xpInput: {
        baseXp: 80,
        criticality: mapCriticalityForXp(payload.criticality),
        validationCount: 0,
        reuseCount: 0,
        sectorMultiplier: payload.sectorMultiplier,
      },
      metadata: {
        action: 'knowledge:create',
        knowledgeId: knowledge.id,
        sectorId: payload.sectorId,
      },
    });

    return NextResponse.json(
      {
        data: {
          knowledge,
          xp: {
            awarded: xpResult.xpBreakdown.totalXp,
            previousTotal: xpResult.previousTotalXp,
            newTotal: xpResult.newTotalXp,
            levelUp: xpResult.levelUp,
            newLevelId: xpResult.newLevelId,
            awardedBadgeIds: xpResult.awardedBadgeIds,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid knowledge create payload', {
        issues: error.issues,
      });
      return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
    }

    logger.error('Knowledge creation route failed', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
