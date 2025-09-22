-- CreateTable
CREATE TABLE `UpdateLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `source` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UpdateLog_source_key`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoinInfo` (
    `coin_id` INTEGER NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,

    UNIQUE INDEX `CoinInfo_symbol_key`(`symbol`),
    PRIMARY KEY (`coin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoinQuotes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coin_id` INTEGER NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `volume_24h` DECIMAL(65, 30) NOT NULL,
    `volume_change_24h` DECIMAL(65, 30) NULL,
    `percent_change_1h` DECIMAL(65, 30) NOT NULL,
    `percent_change_24h` DECIMAL(65, 30) NOT NULL,
    `percent_change_7d` DECIMAL(65, 30) NOT NULL,
    `percent_change_30d` DECIMAL(65, 30) NULL,
    `market_cap` DECIMAL(65, 30) NOT NULL,
    `market_cap_dominance` DECIMAL(65, 30) NULL,
    `fully_diluted_market_cap` DECIMAL(65, 30) NULL,
    `last_updated` DATETIME(3) NULL,
    `timestamp` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserCoins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `coin_id` INTEGER NOT NULL,

    UNIQUE INDEX `UserCoins_user_id_coin_id_key`(`user_id`, `coin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CoinQuotes` ADD CONSTRAINT `CoinQuotes_coin_id_fkey` FOREIGN KEY (`coin_id`) REFERENCES `CoinInfo`(`coin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserCoins` ADD CONSTRAINT `UserCoins_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserCoins` ADD CONSTRAINT `UserCoins_coin_id_fkey` FOREIGN KEY (`coin_id`) REFERENCES `CoinInfo`(`coin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
