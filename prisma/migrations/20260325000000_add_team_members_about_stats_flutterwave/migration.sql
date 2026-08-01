-- Migration applied directly via Supabase MCP
-- See schema.prisma for model definitions

ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'FLUTTERWAVE';

CREATE TABLE IF NOT EXISTS "team_members" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "bio" TEXT,
  "photo" TEXT,
  "email" TEXT,
  "linkedin" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "about_stats" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "number" TEXT NOT NULL,
  "labelEn" TEXT NOT NULL,
  "labelFr" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "about_stats_pkey" PRIMARY KEY ("id")
);
