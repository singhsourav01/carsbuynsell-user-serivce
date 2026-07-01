/*
  Warnings:

  - The values [FOURTH_OWNER_PLUS] on the enum `listing_vehicle_details_lvd_ownership` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `listing_vehicle_details` MODIFY `lvd_ownership` ENUM('FIRST_OWNER', 'SECOND_OWNER', 'THIRD_OWNER', 'FOURTH_OWNER', 'FIFTH_OWNER', 'SIXTH_OWNER') NULL;
