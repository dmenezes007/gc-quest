import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getOrganizationDashboardAggregation,
  getSectorDashboardAggregation,
} from '@/modules/dashboard';
import { getServerUser } from '@/lib/supabase/session';
import { prisma } from '@/lib/prisma';
import { validateRuntimeEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { formatZodError } from '@/lib/validation';

const teamMapQuerySchema = z.object({
  windowDays: z.coerce.number().int().min(1).max(365).optional(),
});

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
      name: true,
      role: true,
      sectorId: true,
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
    const parsedQuery = teamMapQuerySchema.parse({
      windowDays: url.searchParams.get('windowDays') ?? undefined,
    });

    const authUser = await getServerUser();

    if (!authUser) {
      logger.warn('Unauthorized team-map access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await ensureLocalUser({
      id: authUser.id,
      email: authUser.email,
      user_metadata: authUser.user_metadata,
    });

    const organization = await getOrganizationDashboardAggregation({
      windowDays: parsedQuery.windowDays,
    });

    const sector = user.sectorId
      ? await getSectorDashboardAggregation(user.sectorId, {
          windowDays: parsedQuery.windowDays,
        })
      : null;

    return NextResponse.json({
      data: {
        user,
        organization,
        sector,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid team-map query', {
        issues: error.issues,
      });
      return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
    }

    logger.error('Team-map route failed', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}