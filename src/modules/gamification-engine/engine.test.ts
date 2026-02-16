import { describe, expect, it } from 'vitest';
import { calculateXp, calculateXpBreakdown } from './engine';

describe('XP Engine', () => {
  it('calculates XP for critical knowledge scenario', () => {
    const result = calculateXpBreakdown({
      baseXp: 100,
      criticality: 'CRITICAL',
      validationCount: 3,
      reuseCount: 4,
      sectorMultiplier: 1.2,
    });

    expect(result.weightedBaseXp).toBe(240);
    expect(result.validationBonus).toBe(24);
    expect(result.reuseBonus).toBe(20);
    expect(result.totalXp).toBe(284);
  });

  it('calculates XP for essential knowledge scenario', () => {
    const total = calculateXp({
      baseXp: 100,
      criticality: 'HIGH',
      validationCount: 2,
      reuseCount: 1,
      sectorMultiplier: 1,
    });

    expect(total).toBe(171);
  });

  it('calculates XP for normal knowledge scenario', () => {
    const result = calculateXpBreakdown({
      baseXp: 80,
      criticality: 'MEDIUM',
      validationCount: 1,
      reuseCount: 0,
    });

    expect(result.weightedBaseXp).toBe(96);
    expect(result.validationBonus).toBe(8);
    expect(result.reuseBonus).toBe(0);
    expect(result.totalXp).toBe(104);
  });
});
