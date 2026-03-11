-- Add Razorpay payment tracking and usage limits to subscriptions table
-- These columns were already applied to the database via `prisma db push`.
-- This migration file is created to sync the migration history with the actual DB state.

ALTER TABLE `subscriptions`
  ADD COLUMN `sub_remaining_uses` INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN `sub_razorpay_order_id` VARCHAR(191) NULL,
  ADD COLUMN `sub_razorpay_payment_id` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `subscriptions_sub_razorpay_order_id_key`(`sub_razorpay_order_id`);
