-- Aviar E-Commerce Database Schema
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Table: users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table: products
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `originalPrice` DECIMAL(10,2) DEFAULT NULL,
  `category` VARCHAR(255) NOT NULL,
  `section` VARCHAR(255) DEFAULT NULL,
  `badge` ENUM('new', 'sale') DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `sizes` JSON DEFAULT NULL,
  `colors` JSON DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `images` JSON DEFAULT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `inStock` TINYINT(1) DEFAULT 1,
  `stockCount` INT DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_products_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table: orders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(36) NOT NULL,
  `orderNumber` VARCHAR(255) NOT NULL,
  `customer` JSON DEFAULT NULL,
  `items` JSON DEFAULT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(255) DEFAULT 'Processing',
  `paymentMethod` VARCHAR(255) DEFAULT NULL,
  `paymentIntentId` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_orders_orderNumber` (`orderNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table: abandoned_carts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `abandoned_carts` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(255) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(255) DEFAULT NULL,
  `country` VARCHAR(255) DEFAULT NULL,
  `zip` VARCHAR(255) DEFAULT NULL,
  `items` JSON NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `source` VARCHAR(255) DEFAULT 'checkout',
  `status` VARCHAR(255) DEFAULT 'abandoned',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_abandoned_carts_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table: chat_conversations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_conversations` (
  `id` VARCHAR(36) NOT NULL,
  `sessionId` VARCHAR(255) NOT NULL,
  `customerName` VARCHAR(255) DEFAULT 'Guest',
  `customerEmail` VARCHAR(255) DEFAULT '',
  `status` ENUM('open', 'closed') DEFAULT 'open',
  `unreadByAdmin` INT DEFAULT 0,
  `unreadByCustomer` INT DEFAULT 0,
  `lastMessage` TEXT DEFAULT NULL,
  `lastMessageAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_chat_conversations_sessionId` (`sessionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table: chat_messages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` VARCHAR(36) NOT NULL,
  `conversationId` VARCHAR(36) DEFAULT NULL,
  `content` TEXT NOT NULL,
  `sender` ENUM('customer', 'admin') NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_messages_conversationId` (`conversationId`),
  CONSTRAINT `fk_chat_messages_conversation` FOREIGN KEY (`conversationId`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table: coupons
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `code` VARCHAR(255) NOT NULL,
  `discountType` ENUM('percent', 'fixed', 'shipping') NOT NULL,
  `discountValue` DECIMAL(10,2) NOT NULL,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Table: Sections
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Sections` (
  `id` VARCHAR(255) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) DEFAULT NULL,
  `emoji` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Table: settings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(255) NOT NULL,
  `value` TEXT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Initial Seed Data
-- --------------------------------------------------------

-- Seed Default Store Sections
INSERT INTO `Sections` (`id`, `label`, `desc`, `emoji`, `createdAt`, `updatedAt`) VALUES
('collection', 'Collection', 'Main catalogue', '📁', NOW(), NOW()),
('new_arrival', 'New Arrival', 'Latest drops', '✨', NOW(), NOW()),
('sale', 'Sale', 'Discounted items', '🏷️', NOW(), NOW())
ON DUPLICATE KEY UPDATE `label`=VALUES(`label`);

-- Seed Initial Admin Account (email: admin@aviarx.local / pass: aviarx_admin_123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin', 'admin@aviarx.local', '$2b$10$EYfQhgrj6x.om00Iub0BReaec7w1KuF9aeNyeWWnRo97Tc0C03geS', 'admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`);

SET FOREIGN_KEY_CHECKS = 1;
