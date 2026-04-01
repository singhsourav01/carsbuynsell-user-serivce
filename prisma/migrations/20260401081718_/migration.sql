-- CreateTable
CREATE TABLE `password_reset_otp` (
    `_id` VARCHAR(191) NOT NULL,
    `pro_user_id` VARCHAR(191) NOT NULL,
    `pro_otp` VARCHAR(191) NOT NULL,
    `pro_identifier` VARCHAR(191) NOT NULL,
    `pro_type` VARCHAR(191) NOT NULL,
    `pro_is_used` BOOLEAN NOT NULL DEFAULT false,
    `pro_expires_at` DATETIME(3) NOT NULL,
    `pro_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pro_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_token` (
    `_id` VARCHAR(191) NOT NULL,
    `prt_user_id` VARCHAR(191) NOT NULL,
    `prt_token` VARCHAR(191) NOT NULL,
    `prt_is_used` BOOLEAN NOT NULL DEFAULT false,
    `prt_expires_at` DATETIME(3) NOT NULL,
    `prt_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `prt_updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `password_reset_token_prt_token_key`(`prt_token`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listing_vehicle_details` (
    `_id` VARCHAR(191) NOT NULL,
    `lvd_listing_id` VARCHAR(191) NOT NULL,
    `lvd_fuel_type` ENUM('PETROL', 'DIESEL', 'CNG', 'ELECTRIC') NULL,
    `lvd_transmission` ENUM('MANUAL', 'AUTOMATIC') NULL,
    `lvd_body_type` ENUM('SEDAN', 'MUV', 'SUV', 'LUXURY', 'HATCHBACK') NULL,
    `lvd_ownership` ENUM('FIRST_OWNER', 'SECOND_OWNER', 'THIRD_OWNER', 'FOURTH_OWNER_PLUS') NULL,
    `lvd_year` INTEGER NULL,
    `lvd_kilometers` INTEGER NULL,
    `lvd_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lvd_updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `listing_vehicle_details_lvd_listing_id_key`(`lvd_listing_id`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `listing_vehicle_details` ADD CONSTRAINT `listing_vehicle_details_lvd_listing_id_fkey` FOREIGN KEY (`lvd_listing_id`) REFERENCES `listings`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;
