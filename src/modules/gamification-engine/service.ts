import { evaluateBadgeRules } from '@/modules/badges';
import type { BadgeEvaluationResult, BadgeRuleDefinition, UserBadgeStats } from '@/modules/badges';
import { calculateXpBreakdown } from './engine';
import type { XPInput, XPBreakdown, XPRules } from './rules';

export interface UserProgress {
  id: string;
  totalXp: number;
  levelId: string | null;
}

export interface LevelDefinition {
  id: string;
  code: string;
  minXp: number;
  maxXp: number | null;
}

export interface XpEventRecordInput {
  userId: string;
  points: number;
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface LevelUpEvent {
  userId: string;
  previousLevelId: string | null;
  newLevelId: string;
  previousTotalXp: number;
  newTotalXp: number;
}

export interface AwardXpInput {
  userId: string;
  reason: string;
  xpInput: XPInput;
  badgeRules?: BadgeRuleDefinition[];
  metadata?: Record<string, unknown>;
}

export interface AwardXpResult {
  userId: string;
  xpBreakdown: XPBreakdown;
  previousTotalXp: number;
  newTotalXp: number;
  previousLevelId: string | null;
  newLevelId: string | null;
  levelUp: boolean;
  badgeEvaluations: BadgeEvaluationResult[];
  awardedBadgeIds: string[];
}

export interface GamificationRepository {
  getUserProgress(userId: string): Promise<UserProgress | null>;
  listLevels(): Promise<LevelDefinition[]>;
  insertXpEvent(input: XpEventRecordInput): Promise<void>;
  updateUserProgress(userId: string, payload: { totalXp: number; levelId: string | null }): Promise<void>;
  getUserBadgeStats(userId: string): Promise<UserBadgeStats>;
  listBadgeRules(): Promise<BadgeRuleDefinition[]>;
  listGrantedBadgeIds(userId: string): Promise<string[]>;
  grantBadgeToUser(userId: string, badgeId: string): Promise<void>;
}

export interface GamificationServiceOptions {
  rules?: XPRules;
  now?: () => Date;
  onLevelUp?: (event: LevelUpEvent) => Promise<void> | void;
}

function clamp(value: number): number {
  if (Number.isNaN(value) || value < 0) {
    return 0;
  }

  return value;
}

function normalizeLevels(levels: LevelDefinition[]): LevelDefinition[] {
  return [...levels].sort((a, b) => a.minXp - b.minXp);
}

export function resolveLevelForXp(levels: LevelDefinition[], totalXp: number): LevelDefinition | null {
  const safeXp = clamp(totalXp);
  const sortedLevels = normalizeLevels(levels);

  let currentLevel: LevelDefinition | null = null;

  for (const level of sortedLevels) {
    const min = clamp(level.minXp);
    const max = level.maxXp === null ? Number.POSITIVE_INFINITY : clamp(level.maxXp);

    if (safeXp >= min && safeXp <= max) {
      currentLevel = level;
    }
  }

  if (currentLevel) {
    return currentLevel;
  }

  return sortedLevels.length > 0 ? sortedLevels[sortedLevels.length - 1] : null;
}

export function didLevelUp(
  previousLevelId: string | null,
  newLevelId: string | null,
  levels: LevelDefinition[],
): boolean {
  if (!newLevelId || previousLevelId === newLevelId) {
    return false;
  }

  if (!previousLevelId) {
    return true;
  }

  const sorted = normalizeLevels(levels);
  const previousIndex = sorted.findIndex((level) => level.id === previousLevelId);
  const nextIndex = sorted.findIndex((level) => level.id === newLevelId);

  if (previousIndex < 0 || nextIndex < 0) {
    return previousLevelId !== newLevelId;
  }

  return nextIndex > previousIndex;
}

function mergeBadgeStatsWithNewXp(stats: UserBadgeStats, newTotalXp: number): UserBadgeStats {
  return {
    ...stats,
    xp: clamp(newTotalXp),
  };
}

export function createGamificationService(
  repository: GamificationRepository,
  options: GamificationServiceOptions = {},
) {
  const now = options.now ?? (() => new Date());

  return {
    async awardXp(input: AwardXpInput): Promise<AwardXpResult> {
      const user = await repository.getUserProgress(input.userId);

      if (!user) {
        throw new Error(`User not found: ${input.userId}`);
      }

      const levels = await repository.listLevels();
      const xpBreakdown = calculateXpBreakdown(input.xpInput, options.rules);
      const previousTotalXp = clamp(user.totalXp);
      const newTotalXp = previousTotalXp + xpBreakdown.totalXp;

      const previousLevelId = user.levelId;
      const resolvedLevel = resolveLevelForXp(levels, newTotalXp);
      const newLevelId = resolvedLevel?.id ?? null;

      await repository.insertXpEvent({
        userId: input.userId,
        points: xpBreakdown.totalXp,
        reason: input.reason,
        metadata: {
          ...(input.metadata ?? {}),
          timestamp: now().toISOString(),
          breakdown: xpBreakdown,
        },
      });

      await repository.updateUserProgress(input.userId, {
        totalXp: newTotalXp,
        levelId: newLevelId,
      });

      const levelUp = didLevelUp(previousLevelId, newLevelId, levels);
      if (levelUp && newLevelId && options.onLevelUp) {
        await options.onLevelUp({
          userId: input.userId,
          previousLevelId,
          newLevelId,
          previousTotalXp,
          newTotalXp,
        });
      }

      const stats = await repository.getUserBadgeStats(input.userId);
      const badgeStats = mergeBadgeStatsWithNewXp(stats, newTotalXp);
      const rules = input.badgeRules ?? (await repository.listBadgeRules());
      const badgeEvaluations = evaluateBadgeRules(rules, badgeStats);

      const grantedBadgeIds = await repository.listGrantedBadgeIds(input.userId);
      const grantedSet = new Set(grantedBadgeIds);
      const awardedBadgeIds: string[] = [];

      for (const evaluation of badgeEvaluations) {
        if (!evaluation.qualifies || grantedSet.has(evaluation.badgeId)) {
          continue;
        }

        await repository.grantBadgeToUser(input.userId, evaluation.badgeId);
        grantedSet.add(evaluation.badgeId);
        awardedBadgeIds.push(evaluation.badgeId);
      }

      return {
        userId: input.userId,
        xpBreakdown,
        previousTotalXp,
        newTotalXp,
        previousLevelId,
        newLevelId,
        levelUp,
        badgeEvaluations,
        awardedBadgeIds,
      };
    },
  };
}
