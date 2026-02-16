'use client';

import { notifyGamificationFromApiResponse } from '@/modules/notifications';

interface CreateKnowledgeClientInput {
  title: string;
  content: string;
  type: 'ARTICLE' | 'GUIDE' | 'VIDEO' | 'TEMPLATE' | 'POLICY' | 'FAQ';
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary?: string;
  tags?: string[];
  sectorId?: string;
  sectorMultiplier?: number;
}

interface ValidateKnowledgeClientInput {
  knowledgeId: string;
  approved: boolean;
  notes?: string;
  sectorMultiplier?: number;
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  return body;
}

export async function createKnowledgeWithNotifications(input: CreateKnowledgeClientInput) {
  const response = await postJson('/api/knowledge', input);
  notifyGamificationFromApiResponse(response);
  return response;
}

export async function validateKnowledgeWithNotifications(input: ValidateKnowledgeClientInput) {
  const response = await postJson('/api/knowledge/validate', input);
  notifyGamificationFromApiResponse(response);
  return response;
}
