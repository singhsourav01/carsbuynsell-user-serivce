/*
  Warnings:

  - You are about to drop the column `sub_daily_uses_reset_date` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `subscriptions` DROP COLUMN `sub_daily_uses_reset_date`;

-- CreateTable
CREATE TABLE `engagements` (
    `_id` VARCHAR(191) NOT NULL,
    `eng_user_id` VARCHAR(191) NOT NULL,
    `eng_subscription_id` VARCHAR(191) NOT NULL,
    `eng_listing_id` VARCHAR(191) NOT NULL,
    `eng_type` ENUM('AUCTION', 'BUY_NOW') NOT NULL,
    `eng_status` ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    `eng_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eng_closed_at` DATETIME(3) NULL,
    `eng_updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `engagements_eng_user_id_eng_listing_id_key`(`eng_user_id`, `eng_listing_id`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `engagements` ADD CONSTRAINT `engagements_eng_user_id_fkey` FOREIGN KEY (`eng_user_id`) REFERENCES `users`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagements` ADD CONSTRAINT `engagements_eng_subscription_id_fkey` FOREIGN KEY (`eng_subscription_id`) REFERENCES `subscriptions`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `engagements` ADD CONSTRAINT `engagements_eng_listing_id_fkey` FOREIGN KEY (`eng_listing_id`) REFERENCES `listings`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;
