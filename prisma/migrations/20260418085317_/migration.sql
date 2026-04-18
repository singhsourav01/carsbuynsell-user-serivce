/*
  Warnings:

  - A unique constraint covering the columns `[uld_fcm_token]` on the table `user_login_devices` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_login_devices_uld_fcm_token_key` ON `user_login_devices`(`uld_fcm_token`);
