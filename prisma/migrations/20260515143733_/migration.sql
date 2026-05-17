/*
  Warnings:

  - You are about to drop the column `eo_receiver` on the `email_otp` table. All the data in the column will be lost.
  - You are about to drop the column `eo_sender` on the `email_otp` table. All the data in the column will be lost.
  - You are about to drop the column `eo_token` on the `email_otp` table. All the data in the column will be lost.
  - You are about to drop the column `eo_user_id` on the `email_otp` table. All the data in the column will be lost.
  - You are about to drop the column `so_country_code` on the `sms_otp` table. All the data in the column will be lost.
  - You are about to drop the column `so_receiver` on the `sms_otp` table. All the data in the column will be lost.
  - You are about to drop the column `so_token` on the `sms_otp` table. All the data in the column will be lost.
  - You are about to drop the column `so_user_id` on the `sms_otp` table. All the data in the column will be lost.
  - Added the required column `eo_code` to the `email_otp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eo_email` to the `email_otp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `so_phone` to the `sms_otp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `so_verfication_id` to the `sms_otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `email_otp` DROP COLUMN `eo_receiver`,
    DROP COLUMN `eo_sender`,
    DROP COLUMN `eo_token`,
    DROP COLUMN `eo_user_id`,
    ADD COLUMN `eo_code` VARCHAR(191) NOT NULL,
    ADD COLUMN `eo_email` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sms_otp` DROP COLUMN `so_country_code`,
    DROP COLUMN `so_receiver`,
    DROP COLUMN `so_token`,
    DROP COLUMN `so_user_id`,
    ADD COLUMN `so_phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `so_verfication_id` VARCHAR(191) NOT NULL;
