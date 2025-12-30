/*
  Warnings:

  - A unique constraint covering the columns `[userId,fileId,folderId]` on the table `Love` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Love_userId_fileId_key";

-- AlterTable
ALTER TABLE "Love" ADD COLUMN     "folderId" INTEGER,
ALTER COLUMN "fileId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Love_userId_fileId_folderId_key" ON "Love"("userId", "fileId", "folderId");

-- AddForeignKey
ALTER TABLE "Love" ADD CONSTRAINT "Love_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
