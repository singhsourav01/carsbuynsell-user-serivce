-- AlterTable
ALTER TABLE `subscriptions` ADD COLUMN `sub_daily_uses_reset_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
