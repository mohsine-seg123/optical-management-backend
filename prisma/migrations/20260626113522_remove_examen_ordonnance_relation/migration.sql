/*
  Warnings:

  - You are about to drop the column `id_ordonnance` on the `examen_vue` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "examen_vue" DROP CONSTRAINT "examen_vue_id_ordonnance_fkey";

-- AlterTable
ALTER TABLE "examen_vue" DROP COLUMN "id_ordonnance";
