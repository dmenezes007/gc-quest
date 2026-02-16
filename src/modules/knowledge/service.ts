import type { AwardXpInput, AwardXpResult } from '@/modules/gamification-engine';
import type {
  ApproveKnowledgeInput,
  CreateKnowledgeInput,
  KnowledgeItem,
  KnowledgeValidationRecord,
  TrackReuseInput,
  ValidateKnowledgeInput,
} from './types';

export interface KnowledgeServiceRepository {
  listKnowledgeItems(): Promise<KnowledgeItem[]>;
  createKnowledgeItem(input: CreateKnowledgeInput): Promise<KnowledgeItem>;
  getKnowledgeItemById(knowledgeId: string): Promise<KnowledgeItem | null>;
  createValidation(input: ValidateKnowledgeInput): Promise<KnowledgeValidationRecord>;
  approveKnowledge(knowledgeId: string, approverId: string): Promise<KnowledgeItem>;
  incrementReuseCount(knowledgeId: string, amount: number): Promise<KnowledgeItem>;
}

export interface KnowledgeGamificationAdapter {
  awardXp(input: AwardXpInput): Promise<AwardXpResult>;
}

export interface KnowledgeServiceResult<T> {
  data: T;
  xpAwards: AwardXpResult[];
}

function normalizeReuseAmount(amount: number | undefined): number {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
    return 1;
  }

  return Math.floor(amount);
}

export function createKnowledgeService(
  repository: KnowledgeServiceRepository,
  gamificationService: KnowledgeGamificationAdapter,
) {
  return {
    async listKnowledgeItems(): Promise<KnowledgeItem[]> {
      return repository.listKnowledgeItems();
    },

    async create(input: CreateKnowledgeInput): Promise<KnowledgeServiceResult<KnowledgeItem>> {
      const created = await repository.createKnowledgeItem(input);

      const xpAward = await gamificationService.awardXp({
        userId: input.authorId,
        reason: 'knowledge:create',
        xpInput: {
          baseXp: 80,
          criticality: input.criticality,
          validationCount: 0,
          reuseCount: 0,
          sectorMultiplier: input.sectorMultiplier,
        },
        metadata: {
          knowledgeId: created.id,
          action: 'create',
        },
      });

      return {
        data: created,
        xpAwards: [xpAward],
      };
    },

    async validate(input: ValidateKnowledgeInput): Promise<KnowledgeServiceResult<KnowledgeValidationRecord>> {
      const target = await repository.getKnowledgeItemById(input.knowledgeId);
      if (!target) {
        throw new Error(`Knowledge item not found: ${input.knowledgeId}`);
      }

      const validationRecord = await repository.createValidation(input);

      const validatorAward = await gamificationService.awardXp({
        userId: input.validatorId,
        reason: 'knowledge:validate',
        xpInput: {
          baseXp: input.approved ? 30 : 15,
          criticality: target.criticality,
          validationCount: 1,
          reuseCount: 0,
          sectorMultiplier: input.sectorMultiplier,
        },
        metadata: {
          knowledgeId: target.id,
          validationId: validationRecord.id,
          approved: input.approved,
          action: 'validate',
        },
      });

      return {
        data: validationRecord,
        xpAwards: [validatorAward],
      };
    },

    async approve(input: ApproveKnowledgeInput): Promise<KnowledgeServiceResult<KnowledgeItem>> {
      const target = await repository.getKnowledgeItemById(input.knowledgeId);
      if (!target) {
        throw new Error(`Knowledge item not found: ${input.knowledgeId}`);
      }

      const approved = await repository.approveKnowledge(input.knowledgeId, input.approverId);

      const [authorAward, approverAward] = await Promise.all([
        gamificationService.awardXp({
          userId: approved.authorId,
          reason: 'knowledge:approved',
          xpInput: {
            baseXp: 60,
            criticality: approved.criticality,
            validationCount: approved.validationCount,
            reuseCount: approved.reuseCount,
            sectorMultiplier: input.sectorMultiplier,
          },
          metadata: {
            knowledgeId: approved.id,
            approverId: input.approverId,
            action: 'approve:author_reward',
          },
        }),
        gamificationService.awardXp({
          userId: input.approverId,
          reason: 'knowledge:approve',
          xpInput: {
            baseXp: 25,
            criticality: approved.criticality,
            validationCount: 0,
            reuseCount: 0,
            sectorMultiplier: input.sectorMultiplier,
          },
          metadata: {
            knowledgeId: approved.id,
            action: 'approve:approver_reward',
          },
        }),
      ]);

      return {
        data: approved,
        xpAwards: [authorAward, approverAward],
      };
    },

    async trackReuse(input: TrackReuseInput): Promise<KnowledgeServiceResult<KnowledgeItem>> {
      const target = await repository.getKnowledgeItemById(input.knowledgeId);
      if (!target) {
        throw new Error(`Knowledge item not found: ${input.knowledgeId}`);
      }

      const amount = normalizeReuseAmount(input.amount);
      const updated = await repository.incrementReuseCount(input.knowledgeId, amount);

      const [authorAward, reuserAward] = await Promise.all([
        gamificationService.awardXp({
          userId: updated.authorId,
          reason: 'knowledge:reused:author',
          xpInput: {
            baseXp: 20,
            criticality: updated.criticality,
            validationCount: updated.validationCount,
            reuseCount: amount,
            sectorMultiplier: input.sectorMultiplier,
          },
          metadata: {
            knowledgeId: updated.id,
            reuseAmount: amount,
            action: 'reuse:author_reward',
            reusedByUserId: input.reusedByUserId,
          },
        }),
        gamificationService.awardXp({
          userId: input.reusedByUserId,
          reason: 'knowledge:reused:consumer',
          xpInput: {
            baseXp: 10,
            criticality: updated.criticality,
            validationCount: 0,
            reuseCount: 0,
            sectorMultiplier: input.sectorMultiplier,
          },
          metadata: {
            knowledgeId: updated.id,
            reuseAmount: amount,
            action: 'reuse:consumer_reward',
          },
        }),
      ]);

      return {
        data: updated,
        xpAwards: [authorAward, reuserAward],
      };
    },
  };
}
