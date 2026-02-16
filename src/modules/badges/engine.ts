import type { BadgeEvaluationResult, BadgeRuleDefinition, UserBadgeStats } from './types';
import { parseBadgeRulesFromJson } from './rules';

function clamp(value: number): number {
  if (Number.isNaN(value) || value < 0) {
    return 0;
  }

  return value;
}

function normalizeStats(stats: UserBadgeStats): UserBadgeStats {
  return {
    xp: clamp(stats.xp),
    knowledgeCount: clamp(stats.knowledgeCount),
    criticalKnowledgeCount: clamp(stats.criticalKnowledgeCount),
    validationsReceived: clamp(stats.validationsReceived),
  };
}

function evaluateRequirements(rule: BadgeRuleDefinition, stats: UserBadgeStats) {
  const thresholds = rule.thresholds;
  const matchedRequirements: string[] = [];
  const missingRequirements: string[] = [];

  const checks: Array<{ enabled: boolean; ok: boolean; label: string }> = [
    {
      enabled: typeof thresholds.minXp === 'number',
      ok: stats.xp >= (thresholds.minXp ?? 0),
      label: `xp >= ${thresholds.minXp ?? 0}`,
    },
    {
      enabled: typeof thresholds.minKnowledgeCount === 'number',
      ok: stats.knowledgeCount >= (thresholds.minKnowledgeCount ?? 0),
      label: `knowledgeCount >= ${thresholds.minKnowledgeCount ?? 0}`,
    },
    {
      enabled: typeof thresholds.minCriticalKnowledgeCount === 'number',
      ok: stats.criticalKnowledgeCount >= (thresholds.minCriticalKnowledgeCount ?? 0),
      label: `criticalKnowledgeCount >= ${thresholds.minCriticalKnowledgeCount ?? 0}`,
    },
    {
      enabled: typeof thresholds.minValidationsReceived === 'number',
      ok: stats.validationsReceived >= (thresholds.minValidationsReceived ?? 0),
      label: `validationsReceived >= ${thresholds.minValidationsReceived ?? 0}`,
    },
  ];

  const activeChecks = checks.filter((check) => check.enabled);

  activeChecks.forEach((check) => {
    if (check.ok) {
      matchedRequirements.push(check.label);
    } else {
      missingRequirements.push(check.label);
    }
  });

  const mode = rule.mode ?? 'ALL';
  const qualifies =
    mode === 'ANY'
      ? matchedRequirements.length > 0
      : missingRequirements.length === 0;

  return {
    qualifies,
    matchedRequirements,
    missingRequirements,
  };
}

export function evaluateBadgeRule(
  rule: BadgeRuleDefinition,
  stats: UserBadgeStats,
): BadgeEvaluationResult {
  const normalizedStats = normalizeStats(stats);
  const result = evaluateRequirements(rule, normalizedStats);

  return {
    badgeId: rule.id,
    code: rule.code,
    qualifies: result.qualifies,
    matchedRequirements: result.matchedRequirements,
    missingRequirements: result.missingRequirements,
  };
}

export function evaluateBadgeRules(
  rules: BadgeRuleDefinition[],
  stats: UserBadgeStats,
): BadgeEvaluationResult[] {
  return rules.map((rule) => evaluateBadgeRule(rule, stats));
}

export function evaluateBadgesFromJson(
  rulesJson: string | unknown,
  stats: UserBadgeStats,
): BadgeEvaluationResult[] {
  const rules = parseBadgeRulesFromJson(rulesJson);
  return evaluateBadgeRules(rules, stats);
}

export function getQualifiedBadges(
  rules: BadgeRuleDefinition[],
  stats: UserBadgeStats,
): BadgeEvaluationResult[] {
  return evaluateBadgeRules(rules, stats).filter((result) => result.qualifies);
}
