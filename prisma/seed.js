const { PrismaClient, Criticality, KnowledgeType, MissionStatus, Role, ValidationStatus } = require('@prisma/client');

const prisma = new PrismaClient();

const ids = {
  sectors: {
    patents: '10000000-0000-4000-8000-000000000001',
    trademarks: '10000000-0000-4000-8000-000000000002',
    legal: '10000000-0000-4000-8000-000000000003',
  },
  levels: {
    l1: '20000000-0000-4000-8000-000000000001',
    l2: '20000000-0000-4000-8000-000000000002',
    l3: '20000000-0000-4000-8000-000000000003',
    l4: '20000000-0000-4000-8000-000000000004',
  },
  users: {
    ana: '30000000-0000-4000-8000-000000000001',
    bruno: '30000000-0000-4000-8000-000000000002',
    carla: '30000000-0000-4000-8000-000000000003',
    diego: '30000000-0000-4000-8000-000000000004',
    elisa: '30000000-0000-4000-8000-000000000005',
  },
  badges: {
    firstKnowledge: '40000000-0000-4000-8000-000000000001',
    validatorPro: '40000000-0000-4000-8000-000000000002',
    criticalGuardian: '40000000-0000-4000-8000-000000000003',
  },
  missions: {
    publishGuide: '50000000-0000-4000-8000-000000000001',
    validateCritical: '50000000-0000-4000-8000-000000000002',
    lgpdChecklist: '50000000-0000-4000-8000-000000000003',
  },
  knowledgeItems: {
    privacyGuide: '60000000-0000-4000-8000-000000000001',
    incidentTemplate: '60000000-0000-4000-8000-000000000002',
    classificationPolicy: '60000000-0000-4000-8000-000000000003',
    consentFaq: '60000000-0000-4000-8000-000000000004',
    anonymizationArticle: '60000000-0000-4000-8000-000000000005',
  },
  validations: {
    v1: '70000000-0000-4000-8000-000000000001',
    v2: '70000000-0000-4000-8000-000000000002',
    v3: '70000000-0000-4000-8000-000000000003',
    v4: '70000000-0000-4000-8000-000000000004',
  },
  xpEvents: {
    e1: '80000000-0000-4000-8000-000000000001',
    e2: '80000000-0000-4000-8000-000000000002',
    e3: '80000000-0000-4000-8000-000000000003',
    e4: '80000000-0000-4000-8000-000000000004',
    e5: '80000000-0000-4000-8000-000000000005',
    e6: '80000000-0000-4000-8000-000000000006',
    e7: '80000000-0000-4000-8000-000000000007',
    e8: '80000000-0000-4000-8000-000000000008',
    e9: '80000000-0000-4000-8000-000000000009',
    e10: '80000000-0000-4000-8000-000000000010',
    e11: '80000000-0000-4000-8000-000000000011',
    e12: '80000000-0000-4000-8000-000000000012',
  },
  userMissions: {
    um1: '90000000-0000-4000-8000-000000000001',
    um2: '90000000-0000-4000-8000-000000000002',
    um3: '90000000-0000-4000-8000-000000000003',
    um4: '90000000-0000-4000-8000-000000000004',
  },
  userBadges: {
    ub1: 'a0000000-0000-4000-8000-000000000001',
    ub2: 'a0000000-0000-4000-8000-000000000002',
    ub3: 'a0000000-0000-4000-8000-000000000003',
    ub4: 'a0000000-0000-4000-8000-000000000004',
  },
};

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function resolveLevelId(levels, totalXp) {
  const sorted = [...levels].sort((left, right) => left.minXp - right.minXp);
  let resolved = sorted[0]?.id ?? null;

  for (const level of sorted) {
    const withinRange = level.maxXp === null
      ? totalXp >= level.minXp
      : totalXp >= level.minXp && totalXp <= level.maxXp;

    if (withinRange) {
      resolved = level.id;
    }
  }

  return resolved;
}

async function clearDomainData() {
  await prisma.$transaction([
    prisma.userMission.deleteMany(),
    prisma.userBadge.deleteMany(),
    prisma.xpEvent.deleteMany(),
    prisma.validation.deleteMany(),
    prisma.knowledgeItem.deleteMany(),
    prisma.mission.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.user.deleteMany(),
    prisma.level.deleteMany(),
    prisma.sector.deleteMany(),
  ]);
}

async function seed() {
  const shouldReset = process.env.SEED_RESET !== 'false';

  if (shouldReset) {
    console.log('🧹 Resetting domain tables before seed...');
    await clearDomainData();
  }

  const sectors = [
    {
      id: ids.sectors.patents,
      name: 'Patentes',
      description: 'Equipe focada em análise e gestão de patentes.',
    },
    {
      id: ids.sectors.trademarks,
      name: 'Marcas',
      description: 'Equipe focada em marcas e sinais distintivos.',
    },
    {
      id: ids.sectors.legal,
      name: 'Jurídico',
      description: 'Equipe de suporte legal e compliance LGPD.',
    },
  ];

  const levels = [
    { id: ids.levels.l1, code: 'L1', name: 'Iniciante', minXp: 0, maxXp: 149 },
    { id: ids.levels.l2, code: 'L2', name: 'Colaborador', minXp: 150, maxXp: 349 },
    { id: ids.levels.l3, code: 'L3', name: 'Especialista', minXp: 350, maxXp: 649 },
    { id: ids.levels.l4, code: 'L4', name: 'Guardião', minXp: 650, maxXp: null },
  ];

  const users = [
    {
      id: ids.users.ana,
      email: 'ana.souza@demo.local',
      name: 'Ana Souza',
      role: Role.USER,
      sectorId: ids.sectors.patents,
      createdAt: daysAgo(45),
    },
    {
      id: ids.users.bruno,
      email: 'bruno.lima@demo.local',
      name: 'Bruno Lima',
      role: Role.USER,
      sectorId: ids.sectors.trademarks,
      createdAt: daysAgo(30),
    },
    {
      id: ids.users.carla,
      email: 'carla.mendes@demo.local',
      name: 'Carla Mendes',
      role: Role.MANAGER,
      sectorId: ids.sectors.patents,
      createdAt: daysAgo(80),
    },
    {
      id: ids.users.diego,
      email: 'diego.rocha@demo.local',
      name: 'Diego Rocha',
      role: Role.MANAGER,
      sectorId: ids.sectors.legal,
      createdAt: daysAgo(120),
    },
    {
      id: ids.users.elisa,
      email: 'elisa.almeida@demo.local',
      name: 'Elisa Almeida',
      role: Role.ADMIN,
      sectorId: ids.sectors.legal,
      createdAt: daysAgo(150),
    },
  ];

  const badges = [
    {
      id: ids.badges.firstKnowledge,
      code: 'FIRST_KNOWLEDGE',
      name: 'Primeiro Conhecimento',
      description: 'Publicou o primeiro item de conhecimento.',
      criticality: Criticality.LOW,
      xpReward: 80,
    },
    {
      id: ids.badges.validatorPro,
      code: 'VALIDATOR_PRO',
      name: 'Validador Pro',
      description: 'Realizou validações aprovadas com consistência.',
      criticality: Criticality.MEDIUM,
      xpReward: 220,
    },
    {
      id: ids.badges.criticalGuardian,
      code: 'CRITICAL_GUARDIAN',
      name: 'Guardião Crítico',
      description: 'Contribuiu com conhecimento crítico validado.',
      criticality: Criticality.CRITICAL,
      xpReward: 380,
    },
  ];

  const missions = [
    {
      id: ids.missions.publishGuide,
      code: 'PUBLISH_GUIDE_WEEKLY',
      title: 'Publicar guia semanal',
      description: 'Publicar ao menos um guia validado na semana.',
      criticality: Criticality.MEDIUM,
      xpReward: 120,
      sectorId: ids.sectors.patents,
      startsAt: daysAgo(14),
      endsAt: daysAgo(-7),
      active: true,
    },
    {
      id: ids.missions.validateCritical,
      code: 'VALIDATE_CRITICAL_SET',
      title: 'Validar conhecimento crítico',
      description: 'Aprovar dois conhecimentos críticos no mês.',
      criticality: Criticality.HIGH,
      xpReward: 140,
      sectorId: ids.sectors.legal,
      startsAt: daysAgo(20),
      endsAt: daysAgo(-10),
      active: true,
    },
    {
      id: ids.missions.lgpdChecklist,
      code: 'LGPD_CHECKLIST_MONTHLY',
      title: 'Checklist mensal LGPD',
      description: 'Completar o checklist mensal de compliance.',
      criticality: Criticality.HIGH,
      xpReward: 110,
      sectorId: null,
      startsAt: daysAgo(10),
      endsAt: daysAgo(-20),
      active: true,
    },
  ];

  const knowledgeItems = [
    {
      id: ids.knowledgeItems.privacyGuide,
      title: 'Guia de Classificação de Dados Pessoais',
      summary: 'Classificação por criticidade e base legal.',
      content: 'Conteúdo detalhado para classificar dados pessoais e sensíveis no ciclo de tratamento.',
      type: KnowledgeType.GUIDE,
      criticality: Criticality.HIGH,
      tags: ['lgpd', 'classificacao', 'dados'],
      authorId: ids.users.ana,
      sectorId: ids.sectors.patents,
      publishedAt: daysAgo(18),
      createdAt: daysAgo(20),
    },
    {
      id: ids.knowledgeItems.incidentTemplate,
      title: 'Template de Resposta a Incidentes',
      summary: 'Fluxo de resposta e comunicação para incidentes.',
      content: 'Modelo de procedimento para triagem, contenção, análise e comunicação de incidentes.',
      type: KnowledgeType.TEMPLATE,
      criticality: Criticality.CRITICAL,
      tags: ['incidente', 'seguranca', 'resposta'],
      authorId: ids.users.bruno,
      sectorId: ids.sectors.trademarks,
      publishedAt: daysAgo(12),
      createdAt: daysAgo(15),
    },
    {
      id: ids.knowledgeItems.classificationPolicy,
      title: 'Política de Retenção e Descarte',
      summary: 'Diretrizes para retenção segura e descarte.',
      content: 'Política com prazos por tipo documental, requisitos legais e trilha de auditoria.',
      type: KnowledgeType.POLICY,
      criticality: Criticality.HIGH,
      tags: ['retencao', 'descarte', 'governanca'],
      authorId: ids.users.ana,
      sectorId: ids.sectors.legal,
      publishedAt: daysAgo(9),
      createdAt: daysAgo(11),
    },
    {
      id: ids.knowledgeItems.consentFaq,
      title: 'FAQ de Consentimento para Titulares',
      summary: 'Perguntas frequentes sobre consentimento.',
      content: 'FAQ com cenários de revogação, prova de consentimento e canais de atendimento ao titular.',
      type: KnowledgeType.FAQ,
      criticality: Criticality.MEDIUM,
      tags: ['consentimento', 'titular', 'faq'],
      authorId: ids.users.bruno,
      sectorId: ids.sectors.trademarks,
      publishedAt: daysAgo(6),
      createdAt: daysAgo(7),
    },
    {
      id: ids.knowledgeItems.anonymizationArticle,
      title: 'Artigo: Técnicas de Anonimização',
      summary: 'Panorama de técnicas práticas de anonimização.',
      content: 'Comparativo de técnicas de anonimização, pseudoanonimização e critérios de risco residual.',
      type: KnowledgeType.ARTICLE,
      criticality: Criticality.MEDIUM,
      tags: ['anonimizacao', 'artigo', 'privacy-by-design'],
      authorId: ids.users.ana,
      sectorId: ids.sectors.patents,
      publishedAt: daysAgo(4),
      createdAt: daysAgo(5),
    },
  ];

  const validations = [
    {
      id: ids.validations.v1,
      knowledgeItemId: ids.knowledgeItems.privacyGuide,
      validatorId: ids.users.carla,
      status: ValidationStatus.APPROVED,
      notes: 'Conteúdo adequado para publicação setorial.',
      createdAt: daysAgo(17),
    },
    {
      id: ids.validations.v2,
      knowledgeItemId: ids.knowledgeItems.incidentTemplate,
      validatorId: ids.users.diego,
      status: ValidationStatus.APPROVED,
      notes: 'Fluxo está alinhado com política de segurança.',
      createdAt: daysAgo(11),
    },
    {
      id: ids.validations.v3,
      knowledgeItemId: ids.knowledgeItems.classificationPolicy,
      validatorId: ids.users.carla,
      status: ValidationStatus.APPROVED,
      notes: 'Aprovado após revisão jurídica.',
      createdAt: daysAgo(8),
    },
    {
      id: ids.validations.v4,
      knowledgeItemId: ids.knowledgeItems.consentFaq,
      validatorId: ids.users.diego,
      status: ValidationStatus.REJECTED,
      notes: 'Necessário detalhar canal de revogação.',
      createdAt: daysAgo(5),
    },
  ];

  const xpEvents = [
    {
      id: ids.xpEvents.e1,
      userId: ids.users.ana,
      points: 120,
      reason: 'knowledge:create',
      knowledgeItemId: ids.knowledgeItems.privacyGuide,
      sectorId: ids.sectors.patents,
      createdAt: daysAgo(20),
    },
    {
      id: ids.xpEvents.e2,
      userId: ids.users.carla,
      points: 55,
      reason: 'knowledge:validate',
      knowledgeItemId: ids.knowledgeItems.privacyGuide,
      validationId: ids.validations.v1,
      sectorId: ids.sectors.patents,
      createdAt: daysAgo(17),
    },
    {
      id: ids.xpEvents.e3,
      userId: ids.users.bruno,
      points: 140,
      reason: 'knowledge:create',
      knowledgeItemId: ids.knowledgeItems.incidentTemplate,
      sectorId: ids.sectors.trademarks,
      createdAt: daysAgo(15),
    },
    {
      id: ids.xpEvents.e4,
      userId: ids.users.diego,
      points: 70,
      reason: 'knowledge:validate',
      knowledgeItemId: ids.knowledgeItems.incidentTemplate,
      validationId: ids.validations.v2,
      sectorId: ids.sectors.legal,
      createdAt: daysAgo(11),
    },
    {
      id: ids.xpEvents.e5,
      userId: ids.users.ana,
      points: 130,
      reason: 'knowledge:create',
      knowledgeItemId: ids.knowledgeItems.classificationPolicy,
      sectorId: ids.sectors.legal,
      createdAt: daysAgo(11),
    },
    {
      id: ids.xpEvents.e6,
      userId: ids.users.carla,
      points: 65,
      reason: 'knowledge:validate',
      knowledgeItemId: ids.knowledgeItems.classificationPolicy,
      validationId: ids.validations.v3,
      sectorId: ids.sectors.patents,
      createdAt: daysAgo(8),
    },
    {
      id: ids.xpEvents.e7,
      userId: ids.users.bruno,
      points: 95,
      reason: 'knowledge:create',
      knowledgeItemId: ids.knowledgeItems.consentFaq,
      sectorId: ids.sectors.trademarks,
      createdAt: daysAgo(7),
    },
    {
      id: ids.xpEvents.e8,
      userId: ids.users.ana,
      points: 90,
      reason: 'knowledge:create',
      knowledgeItemId: ids.knowledgeItems.anonymizationArticle,
      sectorId: ids.sectors.patents,
      createdAt: daysAgo(5),
    },
    {
      id: ids.xpEvents.e9,
      userId: ids.users.ana,
      points: 120,
      reason: 'mission:complete',
      missionId: ids.missions.publishGuide,
      sectorId: ids.sectors.patents,
      createdAt: daysAgo(3),
    },
    {
      id: ids.xpEvents.e10,
      userId: ids.users.carla,
      points: 140,
      reason: 'mission:complete',
      missionId: ids.missions.validateCritical,
      sectorId: ids.sectors.legal,
      createdAt: daysAgo(2),
    },
    {
      id: ids.xpEvents.e11,
      userId: ids.users.bruno,
      points: 110,
      reason: 'mission:complete',
      missionId: ids.missions.lgpdChecklist,
      sectorId: ids.sectors.trademarks,
      createdAt: daysAgo(2),
    },
    {
      id: ids.xpEvents.e12,
      userId: ids.users.elisa,
      points: 210,
      reason: 'admin:campaign',
      sectorId: ids.sectors.legal,
      createdAt: daysAgo(1),
    },
  ];

  const userMissions = [
    {
      id: ids.userMissions.um1,
      userId: ids.users.ana,
      missionId: ids.missions.publishGuide,
      status: MissionStatus.COMPLETED,
      progress: 1,
      startedAt: daysAgo(12),
      completedAt: daysAgo(3),
      createdAt: daysAgo(12),
      updatedAt: daysAgo(3),
    },
    {
      id: ids.userMissions.um2,
      userId: ids.users.carla,
      missionId: ids.missions.validateCritical,
      status: MissionStatus.COMPLETED,
      progress: 2,
      startedAt: daysAgo(9),
      completedAt: daysAgo(2),
      createdAt: daysAgo(9),
      updatedAt: daysAgo(2),
    },
    {
      id: ids.userMissions.um3,
      userId: ids.users.bruno,
      missionId: ids.missions.lgpdChecklist,
      status: MissionStatus.COMPLETED,
      progress: 1,
      startedAt: daysAgo(8),
      completedAt: daysAgo(2),
      createdAt: daysAgo(8),
      updatedAt: daysAgo(2),
    },
    {
      id: ids.userMissions.um4,
      userId: ids.users.diego,
      missionId: ids.missions.validateCritical,
      status: MissionStatus.IN_PROGRESS,
      progress: 1,
      startedAt: daysAgo(6),
      completedAt: null,
      createdAt: daysAgo(6),
      updatedAt: daysAgo(1),
    },
  ];

  const userBadges = [
    {
      id: ids.userBadges.ub1,
      userId: ids.users.ana,
      badgeId: ids.badges.firstKnowledge,
      grantedAt: daysAgo(19),
    },
    {
      id: ids.userBadges.ub2,
      userId: ids.users.bruno,
      badgeId: ids.badges.firstKnowledge,
      grantedAt: daysAgo(14),
    },
    {
      id: ids.userBadges.ub3,
      userId: ids.users.carla,
      badgeId: ids.badges.validatorPro,
      grantedAt: daysAgo(2),
    },
    {
      id: ids.userBadges.ub4,
      userId: ids.users.ana,
      badgeId: ids.badges.criticalGuardian,
      grantedAt: daysAgo(1),
    },
  ];

  console.log('🌱 Inserting sectors, levels, users, badges, missions...');
  await prisma.$transaction([
    prisma.sector.createMany({ data: sectors }),
    prisma.level.createMany({ data: levels }),
    prisma.user.createMany({
      data: users.map((user) => ({
        ...user,
        totalXp: 0,
        levelId: ids.levels.l1,
      })),
    }),
    prisma.badge.createMany({ data: badges }),
    prisma.mission.createMany({ data: missions }),
  ]);

  console.log('🌱 Inserting knowledge, validations, XP history, mission progress and user badges...');
  await prisma.$transaction([
    prisma.knowledgeItem.createMany({ data: knowledgeItems }),
    prisma.validation.createMany({ data: validations }),
    prisma.xpEvent.createMany({ data: xpEvents }),
    prisma.userMission.createMany({ data: userMissions }),
    prisma.userBadge.createMany({ data: userBadges }),
  ]);

  const totalsByUserId = new Map();
  for (const event of xpEvents) {
    const current = totalsByUserId.get(event.userId) ?? 0;
    totalsByUserId.set(event.userId, current + event.points);
  }

  console.log('🌱 Updating user totalXp and levelId based on XP history...');
  await prisma.$transaction(
    users.map((user) => {
      const totalXp = totalsByUserId.get(user.id) ?? 0;
      const levelId = resolveLevelId(levels, totalXp);

      return prisma.user.update({
        where: { id: user.id },
        data: {
          totalXp,
          levelId,
        },
      });
    }),
  );

  console.log('✅ Seed completed successfully.');
  console.log('   • Users:', users.length);
  console.log('   • Sectors:', sectors.length);
  console.log('   • Knowledge items:', knowledgeItems.length);
  console.log('   • Badges:', badges.length);
  console.log('   • Missions:', missions.length);
  console.log('   • XP events:', xpEvents.length);
}

seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
