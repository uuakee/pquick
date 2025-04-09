-- CreateTable
CREATE TABLE `plataforms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `logo_url` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adquirentes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `primepag_uri` VARCHAR(191) NULL,
    `primepag_ci` VARCHAR(191) NULL,
    `primepag_cs` VARCHAR(191) NULL,
    `zendry_uri` VARCHAR(191) NULL,
    `zendry_ci` VARCHAR(191) NULL,
    `zendry_cs` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
