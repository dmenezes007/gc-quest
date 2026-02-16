import { Criticality, Role, ValidationStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { GamificationRepository, LevelDefinition, UserProgress } from '@/modules/gamification-engine';
import { createGamificationService } from '@/modules/gamification-engine';
import { getServerUser } from '@/lib/supabase/session';
import { prisma } from '@/lib/prisma';
import { validateRuntimeEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { formatZodError, sanitizeKnowledgeText } from '@/lib/validation';

const validateKnowledgePayloadSchema = z.object({
  knowledgeId: z.string().uuid(),
  approved: z.boolean(),
  notes: z
    .string()
    .max(1_500)
    .optional()
    .transform((value) => (typeof value === 'string' ? sanitizeKnowledgeText(value) : undefined))
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  sectorMultiplier: z.number().finite().positive().max(10).optional(),
});

function mapLevel(level: { id: string; code: string; minXp: number; maxXp: number | null }): LevelDefinition {
  return {
    id: level.id,
    code: level.code,
    minXp: level.minXp,
    maxXp: level.maxXp,
  };
}

function mapCriticalityForXp(criticality: Criticality): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  return criticality;
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
          validationId: typeof input.metadata?.validationId === 'string' ? input.metadata.validationId : null,
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
            status: ValidationStatus.APPROVED,
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
    select: {
      id: true,
      role: true,
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
      logger.warn('Unauthorized knowledge validation attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const localUser = await ensureLocalUser({
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata,
    });

    if (localUser.role !== Role.MANAGER) {
      return NextResponse.json({ error: 'Forbidden. MANAGER role is required.' }, { status: 403 });
    }

    const payload = validateKnowledgePayloadSchema.parse(await request.json());

    const knowledge = await prisma.knowledgeItem.findUnique({
      where: { id: payload.knowledgeId },
      select: {
        id: true,
        criticality: true,
        sectorId: true,
      },
    });

    if (!knowledge) {
      return NextResponse.json({ error: 'Knowledge item not found.' }, { status: 404 });
    }

    const createdValidation = await prisma.validation.create({
      data: {
        knowledgeItemId: knowledge.id,
        validatorId: authUser.id,
        status: payload.approved ? ValidationStatus.APPROVED : ValidationStatus.REJECTED,
        notes: payload.notes,
      },
      select: {
        id: true,
        status: true,
        notes: true,
        createdAt: true,
      },
    });

    const gamificationService = createGamificationService(createGamificationRepository());
    const xpResult = await gamificationService.awardXp({
      userId: authUser.id,
      reason: 'knowledge:validate',
      xpInput: {
        baseXp: payload.approved ? 30 : 15,
        criticality: mapCriticalityForXp(knowledge.criticality),
        validationCount: 1,
        reuseCount: 0,
        sectorMultiplier: payload.sectorMultiplier,
      },
      metadata: {
        action: 'knowledge:validate',
        knowledgeId: knowledge.id,
        validationId: createdValidation.id,
        sectorId: knowledge.sectorId,
      },
    });

    return NextResponse.json(
      {
        data: {
          validation: createdValidation,
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
      logger.warn('Invalid knowledge validate payload', {
        issues: error.issues,
      });
      return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Unexpected error';

    if (message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'This validator has already validated the knowledge item.' }, { status: 409 });
    }

    logger.error('Knowledge validation route failed', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}