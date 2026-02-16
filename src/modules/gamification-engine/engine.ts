import type { XPBreakdown, XPInput, XPRules } from './rules';
import { defaultRules } from './rules';

function clamp(value: number, min = 0): number {
  return Math.max(min, value);
}

function safeRound(value: number): number {
  return Math.round(value);
}

export function resolveSectorMultiplier(
  sectorMultiplier: number | undefined,
  rules: XPRules = defaultRules,
): number {
  if (typeof sectorMultiplier !== 'number' || Number.isNaN(sectorMultiplier)) {
    return rules.defaultSectorMultiplier;
  }

  return clamp(sectorMultiplier, 0);
}

export function calculateValidationBonus(
  validationCount: number,
  rules: XPRules = defaultRules,
): number {
  const safeCount = clamp(validationCount, 0);
  const rawBonus = safeCount * rules.validations.pointsPerValidation;
  return safeRound(Math.min(rawBonus, rules.validations.maxValidationBonus));
}

export function calculateReuseBonus(
  reuseCount: number,
  rules: XPRules = defaultRules,
): number {
  const safeCount = clamp(reuseCount, 0);
  const rawBonus = safeCount * rules.reuse.pointsPerReuse;
  return safeRound(Math.min(rawBonus, rules.reuse.maxReuseBonus));
}

export function calculateWeightedBaseXp(input: XPInput, rules: XPRules = defaultRules): number {
  const baseXp = clamp(input.baseXp, 0);
  const criticalityMultiplier = rules.criticalityMultiplier[input.criticality] ?? 1;
  const sectorMultiplier = resolveSectorMultiplier(input.sectorMultiplier, rules);

  return safeRound(baseXp * criticalityMultiplier * sectorMultiplier);
}

export function calculateXpBreakdown(input: XPInput, rules: XPRules = defaultRules): XPBreakdown {
  const baseXp = clamp(input.baseXp, 0);
  const criticalityMultiplier = rules.criticalityMultiplier[input.criticality] ?? 1;
  const sectorMultiplier = resolveSectorMultiplier(input.sectorMultiplier, rules);
  const weightedBaseXp = calculateWeightedBaseXp(input, rules);
  const validationBonus = calculateValidationBonus(input.validationCount, rules);
  const reuseBonus = calculateReuseBonus(input.reuseCount, rules);
  const totalXp = safeRound(weightedBaseXp + validationBonus + reuseBonus);

  return {
    baseXp,
    criticality: input.criticality,
    criticalityMultiplier,
    sectorMultiplier,
    weightedBaseXp,
    validationBonus,
    reuseBonus,
    totalXp,
  };
}

export function calculateXp(input: XPInput, rules: XPRules = defaultRules): number {
  return calculateXpBreakdown(input, rules).totalXp;
}
