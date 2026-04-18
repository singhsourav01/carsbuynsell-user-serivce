-- DropIndex
DROP INDEX `user_login_devices_uld_fcm_token_key` ON `user_login_devices`;

-- AlterTable
ALTER TABLE `user_login_devices` MODIFY `uld_fcm_token` TEXT NOT NULL,
    MODIFY `uld_access_token` TEXT NOT NULL,
    MODIFY `uld_refresh_token` TEXT NOT NULL;
