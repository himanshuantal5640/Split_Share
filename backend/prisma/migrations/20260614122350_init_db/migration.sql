/*
  Warnings:

  - A unique constraint covering the columns `[import_row_id]` on the table `settlements` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `anomalies` ADD COLUMN `import_row_id` INTEGER NULL,
    ADD COLUMN `resolution_note` TEXT NULL,
    ADD COLUMN `resolved_at` DATETIME(3) NULL,
    ADD COLUMN `resolved_by_id` INTEGER NULL,
    MODIFY `expense_id` INTEGER NULL,
    MODIFY `status` ENUM('UNRESOLVED', 'DISMISSED', 'RESOLVED', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `expenses` ADD COLUMN `exchange_rate` DECIMAL(10, 6) NULL,
    ADD COLUMN `import_id` INTEGER NULL,
    ADD COLUMN `normalized_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `original_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `original_currency` ENUM('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD') NULL;

-- AlterTable
ALTER TABLE `settlements` ADD COLUMN `exchange_rate` DECIMAL(10, 6) NULL,
    ADD COLUMN `import_id` INTEGER NULL,
    ADD COLUMN `import_row_id` INTEGER NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `normalized_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `original_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `original_currency` ENUM('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD') NULL;

-- CreateTable
CREATE TABLE `exchange_rates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_currency` ENUM('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD') NOT NULL,
    `to_currency` ENUM('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD') NOT NULL,
    `rate` DECIMAL(10, 6) NOT NULL,
    `effective_date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `exchange_rates_from_currency_to_currency_effective_date_key`(`from_currency`, `to_currency`, `effective_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `anomalies_import_row_id_idx` ON `anomalies`(`import_row_id`);

-- CreateIndex
CREATE INDEX `anomalies_resolved_by_id_idx` ON `anomalies`(`resolved_by_id`);

-- CreateIndex
CREATE INDEX `expenses_import_id_idx` ON `expenses`(`import_id`);

-- CreateIndex
CREATE UNIQUE INDEX `settlements_import_row_id_key` ON `settlements`(`import_row_id`);

-- CreateIndex
CREATE INDEX `settlements_import_id_idx` ON `settlements`(`import_id`);

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_import_id_fkey` FOREIGN KEY (`import_id`) REFERENCES `imports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settlements` ADD CONSTRAINT `settlements_import_id_fkey` FOREIGN KEY (`import_id`) REFERENCES `imports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settlements` ADD CONSTRAINT `settlements_import_row_id_fkey` FOREIGN KEY (`import_row_id`) REFERENCES `import_rows`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anomalies` ADD CONSTRAINT `anomalies_import_row_id_fkey` FOREIGN KEY (`import_row_id`) REFERENCES `import_rows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anomalies` ADD CONSTRAINT `anomalies_resolved_by_id_fkey` FOREIGN KEY (`resolved_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
