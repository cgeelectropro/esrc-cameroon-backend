-- AlterEnum
ALTER TYPE "LessonType" ADD VALUE 'TEXT';

-- AlterTable
ALTER TABLE "about_stats" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "course_categories" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "targetAudience" DROP DEFAULT,
ALTER COLUMN "materialsIncluded" DROP DEFAULT;

-- AlterTable
ALTER TABLE "team_members" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;
