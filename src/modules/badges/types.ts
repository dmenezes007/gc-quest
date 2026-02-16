export interface Badge {
  id: string;
  code: string;
  name: string;
  unlocked: boolean;
}

export type BadgeRuleMode = 'ALL' | 'ANY';

export interface BadgeRuleThresholds {
  minXp?: number;
  minKnowledgeCount?: number;
  minCriticalKnowledgeCount?: number;
  minValidationsReceived?: number;
}

export interface BadgeRuleDefinition {
  id: string;
  code: string;
  name: string;
  mode?: BadgeRuleMode;
  thresholds: BadgeRuleThresholds;
}

export interface UserBadgeStats {
  xp: number;
  knowledgeCount: number;
  criticalKnowledgeCount: number;
  validationsReceived: number;
}

export interface BadgeEvaluationResult {
  badgeId: string;
  code: string;
  qualifies: boolean;
  matchedRequirements: string[];
  missingRequirements: string[];
}
