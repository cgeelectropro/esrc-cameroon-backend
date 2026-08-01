/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "certificates_userId_courseId_key" ON "certificates"("userId", "courseId");
