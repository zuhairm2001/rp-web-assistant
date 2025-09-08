CREATE TABLE `agent_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`status` text(2) NOT NULL,
	`tool_call_count` integer DEFAULT 0,
	`tools_used` integer DEFAULT 0,
	`tool_calls_successful` integer DEFAULT 0,
	`tool_calls_failed` integer DEFAULT 0,
	`total_token_input` integer DEFAULT 0,
	`total_tokens_output` integer DEFAULT 0,
	`average_response_time` integer DEFAULT 0,
	`user_provided_info` text DEFAULT '',
	`human_escalated` integer DEFAULT 0,
	`calendar_booking` integer DEFAULT 0,
	`user_satisfaction` integer DEFAULT 0,
	`user_feedback` text DEFAULT '',
	`transcript` text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE `products` (
	`shop_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`link` text NOT NULL,
	`categories` text,
	`downloadable` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);