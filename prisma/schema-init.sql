-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "KnowledgeType" AS ENUM ('ARTICLE', 'GUIDE', 'VIDEO', 'TEMPLATE', 'POLICY', 'FAQ');

-- CreateEnum
CREATE TYPE "Criticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "sectorId" UUID,
    "levelId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minXp" INTEGER NOT NULL,
    "maxXp" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_items" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "type" "KnowledgeType" NOT NULL,
    "criticality" "Criticality" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[],
    "authorId" UUID NOT NULL,
    "sectorId" UUID,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validations" (
    "id" UUID NOT NULL,
    "knowledgeItemId" UUID NOT NULL,
    "validatorId" UUID NOT NULL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_events" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "knowledgeItemId" UUID,
    "missionId" UUID,
    "validationId" UUID,
    "sectorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "criticality" "Criticality" NOT NULL DEFAULT 'LOW',
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "badgeId" UUID NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "criticality" "Criticality" NOT NULL DEFAULT 'MEDIUM',
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "sectorId" UUID,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_missions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "missionId" UUID NOT NULL,
    "status" "MissionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_missions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_sectorId_idx" ON "users"("sectorId");

-- CreateIndex
CREATE INDEX "users_levelId_idx" ON "users"("levelId");

-- CreateIndex
CREATE INDEX "users_totalXp_idx" ON "users"("totalXp");

-- CreateIndex
CREATE INDEX "users_role_totalXp_idx" ON "users"("role", "totalXp");

-- CreateIndex
CREATE INDEX "users_sectorId_totalXp_idx" ON "users"("sectorId", "totalXp");

-- CreateIndex
CREATE INDEX "users_levelId_totalXp_idx" ON "users"("levelId", "totalXp");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sectors_name_key" ON "sectors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "levels_code_key" ON "levels"("code");

-- CreateIndex
CREATE INDEX "levels_minXp_idx" ON "levels"("minXp");

-- CreateIndex
CREATE INDEX "knowledge_items_authorId_idx" ON "knowledge_items"("authorId");

-- CreateIndex
CREATE INDEX "knowledge_items_sectorId_idx" ON "knowledge_items"("sectorId");

-- CreateIndex
CREATE INDEX "knowledge_items_type_idx" ON "knowledge_items"("type");

-- CreateIndex
CREATE INDEX "knowledge_items_criticality_idx" ON "knowledge_items"("criticality");

-- CreateIndex
CREATE INDEX "knowledge_items_publishedAt_idx" ON "knowledge_items"("publishedAt");

-- CreateIndex
CREATE INDEX "knowledge_items_createdAt_idx" ON "knowledge_items"("createdAt");

-- CreateIndex
CREATE INDEX "knowledge_items_authorId_createdAt_idx" ON "knowledge_items"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "knowledge_items_sectorId_type_criticality_idx" ON "knowledge_items"("sectorId", "type", "criticality");

-- CreateIndex
CREATE INDEX "validations_knowledgeItemId_idx" ON "validations"("knowledgeItemId");

-- CreateIndex
CREATE INDEX "validations_validatorId_idx" ON "validations"("validatorId");

-- CreateIndex
CREATE INDEX "validations_status_idx" ON "validations"("status");

-- CreateIndex
CREATE INDEX "validations_status_createdAt_idx" ON "validations"("status", "createdAt");

-- CreateIndex
CREATE INDEX "validations_validatorId_status_idx" ON "validations"("validatorId", "status");

-- CreateIndex
CREATE INDEX "validations_knowledgeItemId_status_idx" ON "validations"("knowledgeItemId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "validations_knowledgeItemId_validatorId_key" ON "validations"("knowledgeItemId", "validatorId");

-- CreateIndex
CREATE INDEX "xp_events_userId_idx" ON "xp_events"("userId");

-- CreateIndex
CREATE INDEX "xp_events_knowledgeItemId_idx" ON "xp_events"("knowledgeItemId");

-- CreateIndex
CREATE INDEX "xp_events_missionId_idx" ON "xp_events"("missionId");

-- CreateIndex
CREATE INDEX "xp_events_validationId_idx" ON "xp_events"("validationId");

-- CreateIndex
CREATE INDEX "xp_events_sectorId_idx" ON "xp_events"("sectorId");

-- CreateIndex
CREATE INDEX "xp_events_createdAt_idx" ON "xp_events"("createdAt");

-- CreateIndex
CREATE INDEX "xp_events_userId_createdAt_idx" ON "xp_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "xp_events_sectorId_createdAt_idx" ON "xp_events"("sectorId", "createdAt");

-- CreateIndex
CREATE INDEX "xp_events_missionId_createdAt_idx" ON "xp_events"("missionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE INDEX "badges_criticality_idx" ON "badges"("criticality");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");

-- CreateIndex
CREATE INDEX "user_badges_grantedAt_idx" ON "user_badges"("grantedAt");

-- CreateIndex
CREATE INDEX "user_badges_userId_grantedAt_idx" ON "user_badges"("userId", "grantedAt");

-- CreateIndex
CREATE INDEX "user_badges_badgeId_grantedAt_idx" ON "user_badges"("badgeId", "grantedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "missions_code_key" ON "missions"("code");

-- CreateIndex
CREATE INDEX "missions_criticality_idx" ON "missions"("criticality");

-- CreateIndex
CREATE INDEX "missions_active_idx" ON "missions"("active");

-- CreateIndex
CREATE INDEX "missions_sectorId_idx" ON "missions"("sectorId");

-- CreateIndex
CREATE INDEX "missions_active_startsAt_endsAt_idx" ON "missions"("active", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "missions_criticality_active_idx" ON "missions"("criticality", "active");

-- CreateIndex
CREATE INDEX "user_missions_userId_idx" ON "user_missions"("userId");

-- CreateIndex
CREATE INDEX "user_missions_missionId_idx" ON "user_missions"("missionId");

-- CreateIndex
CREATE INDEX "user_missions_status_idx" ON "user_missions"("status");

-- CreateIndex
CREATE INDEX "user_missions_userId_status_idx" ON "user_missions"("userId", "status");

-- CreateIndex
CREATE INDEX "user_missions_missionId_status_idx" ON "user_missions"("missionId", "status");

-- CreateIndex
CREATE INDEX "user_missions_status_updatedAt_idx" ON "user_missions"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "user_missions_completedAt_idx" ON "user_missions"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_missions_userId_missionId_key" ON "user_missions"("userId", "missionId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "knowledge_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validations" ADD CONSTRAINT "validations_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_knowledgeItemId_fkey" FOREIGN KEY ("knowledgeItemId") REFERENCES "knowledge_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_validationId_fkey" FOREIGN KEY ("validationId") REFERENCES "validations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

