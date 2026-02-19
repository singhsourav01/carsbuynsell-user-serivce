/*
  Warnings:

  - You are about to drop the column `cat_image_url` on the `categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cat_name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `categories` DROP COLUMN `cat_image_url`;

-- CreateIndex
CREATE UNIQUE INDEX `categories_cat_name_key` ON `categories`(`cat_name`);
