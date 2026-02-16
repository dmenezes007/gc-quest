export type KnowledgeCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ValidationRules {
  pointsPerValidation: number;
  maxValidationBonus: number;
}

export interface ReuseRules {
  pointsPerReuse: number;
  maxReuseBonus: number;
}

export interface XPRules {
  criticalityMultiplier: Record<KnowledgeCriticality, number>;
  validations: ValidationRules;
  reuse: ReuseRules;
  defaultSectorMultiplier: number;
}

export interface XPInput {
  baseXp: number;
  criticality: KnowledgeCriticality;
  validationCount: number;
  reuseCount: number;
  sectorMultiplier?: number;
}

export interface XPBreakdown {
  baseXp: number;
  criticality: KnowledgeCriticality;
  criticalityMultiplier: number;
  sectorMultiplier: number;
  weightedBaseXp: number;
  validationBonus: number;
  reuseBonus: number;
  totalXp: number;
}

export const defaultRules: XPRules = {
  criticalityMultiplier: {
    LOW: 1,
    MEDIUM: 1.2,
    HIGH: 1.5,
    CRITICAL: 2,
  },
  validations: {
    pointsPerValidation: 8,
    maxValidationBonus: 80,
  },
  reuse: {
    pointsPerReuse: 5,
    maxReuseBonus: 100,
  },
  defaultSectorMultiplier: 1,
};
