CREATE TABLE `colorParts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`partName` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `colorParts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `cartItems` ADD `colorSelections` text;--> statement-breakpoint
ALTER TABLE `orderItems` ADD `colorSelections` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `customerName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customerPhone` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `userId`;