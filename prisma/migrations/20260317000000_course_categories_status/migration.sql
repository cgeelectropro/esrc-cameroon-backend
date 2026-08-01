-- Migration: Replace CourseCategory enum with dynamic CourseCategory table
-- Add CourseStatus enum, migrate isPublished -> status, add salePrice

-- Step 1: Create course_categories table
CREATE TABLE "course_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "course_categories_slug_key" ON "course_categories"("slug");

-- Step 2: Insert 14 ESRC academic categories
INSERT INTO "course_categories" ("id", "slug", "nameEn", "nameFr", "order") VALUES
    (gen_random_uuid()::text, 'business-entrepreneurship', 'Business & Entrepreneurship', 'Affaires et Entrepreneuriat', 1),
    (gen_random_uuid()::text, 'techpreneurship', 'Techpreneurship', 'Techpreneurship', 2),
    (gen_random_uuid()::text, 'entrepreneurship-dev-300', 'Entrepreneurship Development Level 300', 'Développement Entrepreneurial Niveau 300', 3),
    (gen_random_uuid()::text, 'entrepreneurship-theory-400', 'Entrepreneurship Theory and Practice Level 400', 'Théorie et Pratique Entrepreneuriale Niveau 400', 4),
    (gen_random_uuid()::text, 'advanced-entrepreneurship', 'Advanced Entrepreneurship Theory and Practice', 'Théorie et Pratique Entrepreneuriale Avancée', 5),
    (gen_random_uuid()::text, 'islamic-entrepreneurship', 'Islamic Entrepreneurship', 'Entrepreneuriat Islamique', 6),
    (gen_random_uuid()::text, 'tourism-entrepreneurship', 'Tourism Entrepreneurship', 'Entrepreneuriat Touristique', 7),
    (gen_random_uuid()::text, 'cultural-entrepreneurship', 'Cultural Entrepreneurship', 'Entrepreneuriat Culturel', 8),
    (gen_random_uuid()::text, 'kingdom-entrepreneurship', 'Kingdom Entrepreneurship', 'Entrepreneuriat du Royaume', 9),
    (gen_random_uuid()::text, 'ageing-entrepreneurship', 'Ageing Entrepreneurship', 'Entrepreneuriat du Vieillissement', 10),
    (gen_random_uuid()::text, 'sports-entrepreneurship', 'Sports Entrepreneurship', 'Entrepreneuriat Sportif', 11),
    (gen_random_uuid()::text, 'teacherpreneurship', 'Teacherpreneurship', 'Teacherpreneurship', 12),
    (gen_random_uuid()::text, 'innovation-business', 'Innovation for Business Growth', 'Innovation pour la Croissance', 13),
    (gen_random_uuid()::text, 'researchpreneurship', 'Researchpreneurship', 'Researchpreneurship', 14);

-- Step 3: Create CourseStatus enum
CREATE TYPE "CourseStatus" AS ENUM ('PUBLISHED', 'DRAFT', 'PENDING', 'PRIVATE', 'TRASH');

-- Step 4: Add status column to courses (default DRAFT)
ALTER TABLE "courses" ADD COLUMN "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT';

-- Step 5: Migrate existing isPublished -> status
UPDATE "courses" SET "status" = 'PUBLISHED' WHERE "isPublished" = true;
UPDATE "courses" SET "status" = 'DRAFT' WHERE "isPublished" = false;

-- Step 6: Add salePrice column
ALTER TABLE "courses" ADD COLUMN "salePrice" DOUBLE PRECISION;

-- Step 7: Migrate courses.category from old enum values to new slugs
ALTER TABLE "courses" ALTER COLUMN "category" TYPE TEXT USING
    CASE "category"::text
        WHEN 'ENTREPRENEURSHIP' THEN 'business-entrepreneurship'
        WHEN 'DEVELOPMENT_POLICY' THEN 'innovation-business'
        WHEN 'SOCIAL_RESEARCH' THEN 'researchpreneurship'
        WHEN 'FINANCE' THEN 'business-entrepreneurship'
        WHEN 'AGRICULTURE' THEN 'business-entrepreneurship'
        WHEN 'TECHNOLOGY' THEN 'techpreneurship'
        WHEN 'WOMEN_IN_BUSINESS' THEN 'business-entrepreneurship'
        WHEN 'YOUTH_EMPOWERMENT' THEN 'business-entrepreneurship'
        WHEN 'PUBLIC_HEALTH' THEN 'advanced-entrepreneurship'
        WHEN 'ENVIRONMENT' THEN 'innovation-business'
        ELSE 'business-entrepreneurship'
    END;

-- Step 8: Migrate user_interests.category from old enum values to new slugs
ALTER TABLE "user_interests" ALTER COLUMN "category" TYPE TEXT USING
    CASE "category"::text
        WHEN 'ENTREPRENEURSHIP' THEN 'business-entrepreneurship'
        WHEN 'DEVELOPMENT_POLICY' THEN 'innovation-business'
        WHEN 'SOCIAL_RESEARCH' THEN 'researchpreneurship'
        WHEN 'FINANCE' THEN 'business-entrepreneurship'
        WHEN 'AGRICULTURE' THEN 'business-entrepreneurship'
        WHEN 'TECHNOLOGY' THEN 'techpreneurship'
        WHEN 'WOMEN_IN_BUSINESS' THEN 'business-entrepreneurship'
        WHEN 'YOUTH_EMPOWERMENT' THEN 'business-entrepreneurship'
        WHEN 'PUBLIC_HEALTH' THEN 'advanced-entrepreneurship'
        WHEN 'ENVIRONMENT' THEN 'innovation-business'
        ELSE 'business-entrepreneurship'
    END;

-- Step 9: Drop the old CourseCategory enum (after columns have been converted to TEXT)
DROP TYPE "CourseCategory";

-- Step 10: Drop isPublished column (replaced by status)
ALTER TABLE "courses" DROP COLUMN "isPublished";

-- Step 11: Drop old index on isPublished
DROP INDEX IF EXISTS "courses_isPublished_idx";

-- Step 12: Create new index on status
CREATE INDEX "courses_status_idx" ON "courses"("status");
