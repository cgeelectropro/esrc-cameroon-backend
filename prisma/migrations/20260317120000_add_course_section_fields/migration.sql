-- AlterTable: Add targetAudience and materialsIncluded to courses
ALTER TABLE "courses" ADD COLUMN "targetAudience" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "courses" ADD COLUMN "materialsIncluded" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- AlterTable: Add summary to sections
ALTER TABLE "sections" ADD COLUMN "summary" TEXT;
