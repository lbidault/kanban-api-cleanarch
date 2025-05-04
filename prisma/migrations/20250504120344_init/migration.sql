/*
  Warnings:

  - The primary key for the `Column` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Column` table. All the data in the column will be lost.
  - You are about to drop the column `columnId` on the `Task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `boardId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_columnId_fkey";

-- AlterTable
ALTER TABLE "Column" DROP CONSTRAINT "Column_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Column_pkey" PRIMARY KEY ("boardId", "name");

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "columnId",
ADD COLUMN     "boardId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Task_title_key" ON "Task"("title");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_boardId_status_fkey" FOREIGN KEY ("boardId", "status") REFERENCES "Column"("boardId", "name") ON DELETE CASCADE ON UPDATE CASCADE;
