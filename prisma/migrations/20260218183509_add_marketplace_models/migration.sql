-- AlterTable
ALTER TABLE `users` ADD COLUMN `user_selfie_file_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `categories` (
    `_id` VARCHAR(191) NOT NULL,
    `cat_name` VARCHAR(191) NOT NULL,
    `cat_slug` VARCHAR(191) NOT NULL,
    `cat_description` VARCHAR(191) NULL,
    `cat_image_url` VARCHAR(191) NULL,
    `cat_is_active` BOOLEAN NOT NULL DEFAULT true,
    `cat_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cat_updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_cat_slug_key`(`cat_slug`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listings` (
    `_id` VARCHAR(191) NOT NULL,
    `lst_seller_id` VARCHAR(191) NOT NULL,
    `lst_category_id` VARCHAR(191) NOT NULL,
    `lst_title` VARCHAR(191) NOT NULL,
    `lst_description` TEXT NULL,
    `lst_type` ENUM('AUCTION', 'BUY_NOW') NOT NULL DEFAULT 'BUY_NOW',
    `lst_status` ENUM('DRAFT', 'ACTIVE', 'SOLD', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `lst_price` DECIMAL(12, 2) NOT NULL,
    `lst_current_bid` DECIMAL(12, 2) NULL,
    `lst_min_increment` DECIMAL(12, 2) NULL,
    `lst_auction_end` DATETIME(3) NULL,
    `lst_is_featured` BOOLEAN NOT NULL DEFAULT false,
    `lst_bid_count` INTEGER NOT NULL DEFAULT 0,
    `lst_view_count` INTEGER NOT NULL DEFAULT 0,
    `lst_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lst_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listing_images` (
    `_id` VARCHAR(191) NOT NULL,
    `limg_listing_id` VARCHAR(191) NOT NULL,
    `limg_url` VARCHAR(191) NOT NULL,
    `limg_order` INTEGER NOT NULL DEFAULT 0,
    `limg_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `limg_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bids` (
    `_id` VARCHAR(191) NOT NULL,
    `bid_listing_id` VARCHAR(191) NOT NULL,
    `bid_bidder_id` VARCHAR(191) NOT NULL,
    `bid_amount` DECIMAL(12, 2) NOT NULL,
    `bid_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bid_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `_id` VARCHAR(191) NOT NULL,
    `ord_buyer_id` VARCHAR(191) NOT NULL,
    `ord_listing_id` VARCHAR(191) NOT NULL,
    `ord_amount` DECIMAL(12, 2) NOT NULL,
    `ord_status` ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `ord_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ord_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_plans` (
    `_id` VARCHAR(191) NOT NULL,
    `sp_name` VARCHAR(191) NOT NULL,
    `sp_description` VARCHAR(191) NULL,
    `sp_price` DECIMAL(10, 2) NOT NULL,
    `sp_duration` INTEGER NOT NULL,
    `sp_is_active` BOOLEAN NOT NULL DEFAULT true,
    `sp_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sp_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `_id` VARCHAR(191) NOT NULL,
    `sub_user_id` VARCHAR(191) NOT NULL,
    `sub_plan_id` VARCHAR(191) NOT NULL,
    `sub_status` ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `sub_starts_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sub_expires_at` DATETIME(3) NOT NULL,
    `sub_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sub_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `listings` ADD CONSTRAINT `listings_lst_seller_id_fkey` FOREIGN KEY (`lst_seller_id`) REFERENCES `users`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listings` ADD CONSTRAINT `listings_lst_category_id_fkey` FOREIGN KEY (`lst_category_id`) REFERENCES `categories`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listing_images` ADD CONSTRAINT `listing_images_limg_listing_id_fkey` FOREIGN KEY (`limg_listing_id`) REFERENCES `listings`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bids` ADD CONSTRAINT `bids_bid_listing_id_fkey` FOREIGN KEY (`bid_listing_id`) REFERENCES `listings`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bids` ADD CONSTRAINT `bids_bid_bidder_id_fkey` FOREIGN KEY (`bid_bidder_id`) REFERENCES `users`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_ord_buyer_id_fkey` FOREIGN KEY (`ord_buyer_id`) REFERENCES `users`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_ord_listing_id_fkey` FOREIGN KEY (`ord_listing_id`) REFERENCES `listings`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_sub_user_id_fkey` FOREIGN KEY (`sub_user_id`) REFERENCES `users`(`_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_sub_plan_id_fkey` FOREIGN KEY (`sub_plan_id`) REFERENCES `subscription_plans`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
