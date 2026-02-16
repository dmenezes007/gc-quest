import { dispatchGamificationEvent } from './events';

interface XpNotificationPayload {
  awarded?: number;
  previousTotal?: number;
  newTotal?: number;
  levelUp?: boolean;
  newLevelId?: string | null;
  previousLevelId?: string | null;
  awardedBadgeIds?: string[];
}

interface GamificationApiEnvelope {
  data?: {
    xp?: XpNotificationPayload;
  };
}

export function notifyGamificationFromApiResponse(response: unknown): void {
  const envelope = response as GamificationApiEnvelope;
  const xp = envelope?.data?.xp;

  if (!xp) {
    return;
  }

  if (typeof xp.awarded === 'number' && xp.awarded > 0) {
    dispatchGamificationEvent('xp:gain', {
      points: xp.awarded,
      newTotalXp: typeof xp.newTotal === 'number' ? xp.newTotal : undefined,
    });
  }

  if (xp.levelUp && typeof xp.newLevelId === 'string' && xp.newLevelId.length > 0) {
    dispatchGamificationEvent('level:up', {
      previousLevelId: xp.previousLevelId ?? null,
      newLevelId: xp.newLevelId,
      newTotalXp: typeof xp.newTotal === 'number' ? xp.newTotal : undefined,
    });
  }

  if (Array.isArray(xp.awardedBadgeIds)) {
    for (const badgeId of xp.awardedBadgeIds) {
      if (typeof badgeId !== 'string' || badgeId.length === 0) {
        continue;
      }

      dispatchGamificationEvent('badge:unlock', {
        badgeId,
      });
    }
  }
}
