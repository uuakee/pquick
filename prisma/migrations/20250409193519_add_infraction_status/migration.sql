-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_senderId_fkey`;

-- AlterTable
ALTER TABLE `transactions` MODIFY `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'INFRACTION') NOT NULL DEFAULT 'PENDING',
    MODIFY `senderId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
