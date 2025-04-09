-- AlterTable
ALTER TABLE `plataforms` ADD COLUMN `description` VARCHAR(191) NOT NULL DEFAULT 'Sua solução completa para pagamentos online',
    MODIFY `id` INTEGER NOT NULL DEFAULT 1,
    MODIFY `logo_url` VARCHAR(191) NULL;
