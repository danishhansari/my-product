CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`shop_name` text NOT NULL,
	`category` text,
	`is_premium` integer DEFAULT false,
	`purchase_time` integer,
	`expires` integer,
	`created` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE INDEX `user_phone_index` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `shop_name_index` ON `users` (`shop_name`);