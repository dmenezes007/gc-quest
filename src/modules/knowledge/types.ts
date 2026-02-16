export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  authorId: string;
  sectorId?: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  validationCount: number;
  reuseCount: number;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeInput {
  title: string;
  content: string;
  authorId: string;
  sectorId?: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sectorMultiplier?: number;
}

export interface ValidateKnowledgeInput {
  knowledgeId: string;
  validatorId: string;
  approved: boolean;
  notes?: string;
  sectorMultiplier?: number;
}

export interface ApproveKnowledgeInput {
  knowledgeId: string;
  approverId: string;
  sectorMultiplier?: number;
}

export interface TrackReuseInput {
  knowledgeId: string;
  reusedByUserId: string;
  amount?: number;
  sectorMultiplier?: number;
}

export interface KnowledgeValidationRecord {
  id: string;
  knowledgeId: string;
  validatorId: string;
  approved: boolean;
  notes?: string;
  createdAt: string;
}
