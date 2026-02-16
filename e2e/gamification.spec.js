const { expect, request, test } = require('@playwright/test');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

test.skip(!process.env.DATABASE_URL, 'DATABASE_URL is required to run gamification E2E tests.');

const seed = {
  userId: '00000000-0000-4000-8000-000000000101',
  managerId: '00000000-0000-4000-8000-000000000202',
  badgeId: '00000000-0000-4000-8000-000000000303',
  level1Id: '00000000-0000-4000-8000-000000000401',
  level2Id: '00000000-0000-4000-8000-000000000402',
};

function authHeaders(input) {
  const role = input.role ?? 'USER';
  return {
    'x-e2e-user-id': input.userId,
    'x-e2e-user-role': role,
    'x-e2e-user-email': input.email ?? `${input.userId}@e2e.local`,
    'x-e2e-user-name': role === 'MANAGER' ? 'E2E Manager' : 'E2E User',
  };
}

async function ensureSeedData() {
  await prisma.level.upsert({
    where: { id: seed.level1Id },
    update: { code: 'L1', name: 'Iniciante', minXp: 0, maxXp: 199 },
    create: { id: seed.level1Id, code: 'L1', name: 'Iniciante', minXp: 0, maxXp: 199 },
  });

  await prisma.level.upsert({
    where: { id: seed.level2Id },
    update: { code: 'L2', name: 'Especialista', minXp: 200, maxXp: null },
    create: { id: seed.level2Id, code: 'L2', name: 'Especialista', minXp: 200, maxXp: null },
  });

  await prisma.badge.upsert({
    where: { id: seed.badgeId },
    update: { code: 'E2E_XP_STARTER', name: 'E2E XP Starter', xpReward: 1 },
    create: {
      id: seed.badgeId,
      code: 'E2E_XP_STARTER',
      name: 'E2E XP Starter',
      description: 'Unlocked after first XP gain in E2E.',
      xpReward: 1,
    },
  });

  await prisma.user.upsert({
    where: { id: seed.managerId },
    update: {
      role: Role.MANAGER,
      email: 'manager.e2e@example.com',
      name: 'Manager E2E',
      levelId: seed.level1Id,
    },
    create: {
      id: seed.managerId,
      role: Role.MANAGER,
      email: 'manager.e2e@example.com',
      name: 'Manager E2E',
      totalXp: 0,
      levelId: seed.level1Id,
    },
  });
}

test.beforeAll(async () => {
  await ensureSeedData();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test('login/auth guard: unauthenticated request is blocked and authenticated request succeeds', async ({ baseURL }) => {
  const api = await request.newContext({ baseURL });

  const unauthorized = await api.post('/api/knowledge', {
    data: {
      title: 'Unauthorized knowledge',
      content: 'This call should fail because no auth headers are set.',
      type: 'ARTICLE',
      criticality: 'LOW',
    },
  });

  expect(unauthorized.status()).toBe(401);

  const authorized = await api.post('/api/knowledge', {
    headers: authHeaders({ userId: seed.userId, role: 'USER', email: 'user.e2e@example.com' }),
    data: {
      title: 'Authenticated knowledge',
      content: 'This call should pass because e2e auth headers are present.',
      type: 'GUIDE',
      criticality: 'MEDIUM',
    },
  });

  expect(authorized.status()).toBe(201);
});

test('knowledge submission awards XP and unlocks at least one badge', async ({ baseURL }) => {
  const api = await request.newContext({ baseURL });

  const response = await api.post('/api/knowledge', {
    headers: authHeaders({ userId: seed.userId, role: 'USER', email: 'user.e2e@example.com' }),
    data: {
      title: 'Guia de classificação LGPD',
      content: 'Conteúdo completo sobre classificação de dados pessoais para o setor.',
      type: 'GUIDE',
      criticality: 'HIGH',
      tags: ['lgpd', 'classificacao'],
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.data.knowledge.id).toBeTruthy();
  expect(body.data.xp.awarded).toBeGreaterThan(0);
  expect(body.data.xp.newTotal).toBeGreaterThan(body.data.xp.previousTotal);
  expect(body.data.xp.awardedBadgeIds.length).toBeGreaterThan(0);
});

test('manager validation approves knowledge and grants validation XP', async ({ baseURL }) => {
  const api = await request.newContext({ baseURL });

  const creation = await api.post('/api/knowledge', {
    headers: authHeaders({ userId: seed.userId, role: 'USER', email: 'user.e2e@example.com' }),
    data: {
      title: 'Template de resposta a incidentes',
      content: 'Procedimento detalhado para resposta a incidentes e comunicação interna.',
      type: 'TEMPLATE',
      criticality: 'CRITICAL',
    },
  });

  expect(creation.status()).toBe(201);
  const knowledgeBody = await creation.json();
  const knowledgeId = knowledgeBody.data.knowledge.id;

  const validation = await api.post('/api/knowledge/validate', {
    headers: authHeaders({ userId: seed.managerId, role: 'MANAGER', email: 'manager.e2e@example.com' }),
    data: {
      knowledgeId,
      approved: true,
      notes: 'Validado no fluxo e2e.',
    },
  });

  expect(validation.status()).toBe(201);

  const validationBody = await validation.json();
  expect(validationBody.data.validation.status).toBe('APPROVED');
  expect(validationBody.data.xp.awarded).toBeGreaterThan(0);
});

test('XP gain persists after submission and validation events', async ({ baseURL }) => {
  const api = await request.newContext({ baseURL });

  const before = await prisma.user.findUnique({
    where: { id: seed.managerId },
    select: { totalXp: true },
  });

  const creation = await api.post('/api/knowledge', {
    headers: authHeaders({ userId: seed.userId, role: 'USER', email: 'user.e2e@example.com' }),
    data: {
      title: 'Checklist de privacidade',
      content: 'Checklist completo de privacidade para revisão mensal da equipe.',
      type: 'POLICY',
      criticality: 'HIGH',
    },
  });
  expect(creation.status()).toBe(201);
  const knowledgeId = (await creation.json()).data.knowledge.id;

  const validateResponse = await api.post('/api/knowledge/validate', {
    headers: authHeaders({ userId: seed.managerId, role: 'MANAGER', email: 'manager.e2e@example.com' }),
    data: {
      knowledgeId,
      approved: true,
      notes: 'Aprovado para publicação.',
    },
  });

  expect(validateResponse.status()).toBe(201);

  const after = await prisma.user.findUnique({
    where: { id: seed.managerId },
    select: { totalXp: true },
  });

  expect((after?.totalXp ?? 0)).toBeGreaterThan(before?.totalXp ?? 0);

  const events = await prisma.xpEvent.findMany({
    where: {
      userId: seed.managerId,
      reason: 'knowledge:validate',
    },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  expect(events.length).toBeGreaterThan(0);
  expect(events[0].points).toBeGreaterThan(0);
});
