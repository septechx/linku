CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`code` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_by` text NOT NULL,
	`expires_at` integer,
	`max_uses` integer,
	`use_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_code_unique` ON `invitation` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_code_idx` ON `invitation` (`code`);