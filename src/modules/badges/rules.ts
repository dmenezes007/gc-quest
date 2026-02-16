import type { BadgeRuleDefinition, BadgeRuleMode, BadgeRuleThresholds } from './types';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asNonNegativeNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new Error(`Invalid badge rule threshold: ${field}`);
  }

  return value;
}

function parseMode(value: unknown): BadgeRuleMode {
  if (value === undefined || value === null) {
    return 'ALL';
  }

  if (value === 'ALL' || value === 'ANY') {
    return value;
  }

  throw new Error('Invalid badge rule mode. Expected ALL or ANY.');
}

function parseThresholds(value: unknown): BadgeRuleThresholds {
  if (!isPlainObject(value)) {
    throw new Error('Invalid badge rule thresholds. Expected an object.');
  }

  const thresholds: BadgeRuleThresholds = {
    minXp: asNonNegativeNumber(value.minXp, 'minXp'),
    minKnowledgeCount: asNonNegativeNumber(value.minKnowledgeCount, 'minKnowledgeCount'),
    minCriticalKnowledgeCount: asNonNegativeNumber(value.minCriticalKnowledgeCount, 'minCriticalKnowledgeCount'),
    minValidationsReceived: asNonNegativeNumber(value.minValidationsReceived, 'minValidationsReceived'),
  };

  const hasAnyRequirement = Object.values(thresholds).some((entry) => typeof entry === 'number');
  if (!hasAnyRequirement) {
    throw new Error('Badge rule must contain at least one threshold requirement.');
  }

  return thresholds;
}

function parseRule(value: unknown): BadgeRuleDefinition {
  if (!isPlainObject(value)) {
    throw new Error('Invalid badge rule. Expected an object.');
  }

  if (typeof value.id !== 'string' || value.id.trim() === '') {
    throw new Error('Invalid badge rule id.');
  }

  if (typeof value.code !== 'string' || value.code.trim() === '') {
    throw new Error('Invalid badge rule code.');
  }

  if (typeof value.name !== 'string' || value.name.trim() === '') {
    throw new Error('Invalid badge rule name.');
  }

  return {
    id: value.id,
    code: value.code,
    name: value.name,
    mode: parseMode(value.mode),
    thresholds: parseThresholds(value.thresholds),
  };
}

export function parseBadgeRulesFromJson(input: string | unknown): BadgeRuleDefinition[] {
  const parsedValue = typeof input === 'string' ? JSON.parse(input) : input;

  if (!Array.isArray(parsedValue)) {
    throw new Error('Invalid badge rules JSON. Expected an array.');
  }

  return parsedValue.map((entry) => parseRule(entry));
}
