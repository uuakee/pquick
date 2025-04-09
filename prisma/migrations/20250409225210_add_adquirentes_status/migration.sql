-- AlterTable
ALTER TABLE `adquirentes` ADD COLUMN `primepag_name` VARCHAR(191) NULL DEFAULT 'PrimePag',
    ADD COLUMN `primepag_status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE',
    ADD COLUMN `zendry_name` VARCHAR(191) NULL DEFAULT 'Zendry',
    ADD COLUMN `zendry_status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'INACTIVE';
