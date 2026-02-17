-- CreateTable
CREATE TABLE `users` (
    `_id` VARCHAR(191) NOT NULL,
    `user_full_name` VARCHAR(191) NULL,
    `user_gender` ENUM('MALE', 'FEMALE', 'OTHER', 'BOTH') NOT NULL DEFAULT 'OTHER',
    `user_primary_phone` VARCHAR(191) NOT NULL,
    `user_email` VARCHAR(191) NULL,
    `user_password` VARCHAR(191) NULL,
    `user_role` ENUM('USER', 'ADMIN', 'BASIC', 'SUPER_ADMIN', 'AGENCY') NOT NULL DEFAULT 'USER',
    `user_admin_status` ENUM('NONE', 'PENDING', 'APPROVED', 'REJECTED', 'BLOCKED', 'DELETED') NOT NULL DEFAULT 'NONE',
    `user_email_verified` BOOLEAN NULL DEFAULT false,
    `user_phone_verified` BOOLEAN NULL DEFAULT false,
    `user_created_by_admin` BOOLEAN NULL DEFAULT true,
    `user_bio` VARCHAR(191) NULL,
    `user_dob` DATETIME(3) NULL,
    `user_height` VARCHAR(191) NULL,
    `user_primary_country_id` VARCHAR(191) NULL,
    `user_active` BOOLEAN NULL DEFAULT true,
    `user_profile_image_file_id` VARCHAR(191) NULL,
    `user_portfolio_pdf_id` VARCHAR(191) NULL,
    `user_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_updated_at` DATETIME(3) NOT NULL,
    `user_referred_by` VARCHAR(191) NULL,
    `user_is_deleted` BOOLEAN NULL DEFAULT false,
    `is_first_login` BOOLEAN NULL DEFAULT false,
    `is_private_user` BOOLEAN NULL DEFAULT false,
    `user_managed_by` VARCHAR(191) NULL,

    FULLTEXT INDEX `users_user_full_name_user_email_idx`(`user_full_name`, `user_email`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sms_otp` (
    `_id` VARCHAR(191) NOT NULL,
    `so_user_id` VARCHAR(191) NOT NULL,
    `so_country_code` VARCHAR(191) NOT NULL,
    `so_receiver` VARCHAR(191) NOT NULL,
    `so_token` VARCHAR(191) NOT NULL,
    `so_is_expired` BOOLEAN NOT NULL DEFAULT false,
    `so_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `so_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_otp` (
    `_id` VARCHAR(191) NOT NULL,
    `eo_user_id` VARCHAR(191) NOT NULL,
    `eo_sender` VARCHAR(191) NOT NULL,
    `eo_receiver` VARCHAR(191) NOT NULL,
    `eo_token` VARCHAR(191) NOT NULL,
    `eo_is_expired` BOOLEAN NOT NULL DEFAULT false,
    `eo_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eo_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_old_emails` (
    `_id` VARCHAR(191) NOT NULL,
    `uoe_user_id` VARCHAR(191) NOT NULL,
    `uoe_eo_id` VARCHAR(191) NOT NULL,
    `uoe_email` VARCHAR(191) NOT NULL,
    `uoe_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uoe_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_old_phones` (
    `_id` VARCHAR(191) NOT NULL,
    `uop_user_id` VARCHAR(191) NOT NULL,
    `uop_so_id` VARCHAR(191) NOT NULL,
    `uop_phone` VARCHAR(191) NOT NULL,
    `uop_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uop_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_login_devices` (
    `_id` VARCHAR(191) NOT NULL,
    `uld_user_id` VARCHAR(191) NOT NULL,
    `uld_fcm_token` VARCHAR(191) NOT NULL,
    `uld_device_name` VARCHAR(191) NOT NULL,
    `uld_device_type` ENUM('ANDROID', 'IOS', 'WEB') NOT NULL,
    `uld_access_token` VARCHAR(191) NOT NULL,
    `uld_refresh_token` VARCHAR(191) NOT NULL,
    `uld_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uld_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_old_emails` ADD CONSTRAINT `user_old_emails_uoe_eo_id_fkey` FOREIGN KEY (`uoe_eo_id`) REFERENCES `email_otp`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_old_phones` ADD CONSTRAINT `user_old_phones_uop_so_id_fkey` FOREIGN KEY (`uop_so_id`) REFERENCES `sms_otp`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_login_devices` ADD CONSTRAINT `user_login_devices_uld_user_id_fkey` FOREIGN KEY (`uld_user_id`) REFERENCES `users`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;
