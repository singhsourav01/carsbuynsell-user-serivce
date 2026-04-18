/*
  Warnings:

  - A unique constraint covering the columns `[uld_user_id,uld_device_name]` on the table `user_login_devices` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user_login_devices` MODIFY `uld_fcm_token` TEXT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_login_devices_uld_user_id_uld_device_name_key` ON `user_login_devices`(`uld_user_id`, `uld_device_name`);
