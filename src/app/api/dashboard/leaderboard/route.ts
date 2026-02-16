import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getLeaderboard } from '@/modules/dashboard';
import { validateRuntimeEnv } from '@/lib/env';
import { logger } from '@/lib/logger';
import { formatZodError } from '@/lib/validation';

const leaderboardQuerySchema = z.object({
  sectorId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(request: Request) {
  try {
    validateRuntimeEnv({
      requireDatabase: true,
      requireSupabase: false,
    });

    const url = new URL(request.url);
    const parsedQuery = leaderboardQuerySchema.parse({
      sectorId: url.searchParams.get('sectorId') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
    });

    const data = await getLeaderboard({
      sectorId: parsedQuery.sectorId,
      limit: parsedQuery.limit,
    });

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid dashboard leaderboard query', {
        issues: error.issues,
      });
      return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
    }

    logger.error('Dashboard leaderboard route failed', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
