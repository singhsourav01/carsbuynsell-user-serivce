-- CreateTable
CREATE TABLE `user_vehicle_record` (
    `_id` VARCHAR(191) NOT NULL,
    `uvr_user_id` VARCHAR(191) NOT NULL,
    `uvr_title` VARCHAR(191) NOT NULL,
    `uvr_description` TEXT NULL,
    `uvr_category` VARCHAR(191) NULL,
    `uvr_base_price` DECIMAL(12, 2) NOT NULL,
    `uvr_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uvr_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_vehicle_record` ADD CONSTRAINT `user_vehicle_record_uvr_user_id_fkey` FOREIGN KEY (`uvr_user_id`) REFERENCES `users`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;
