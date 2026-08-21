-- Drizzle opens an outer transaction before running migrations. Close it so
-- SQLite can actually disable foreign keys while both parent and child tables
-- are rebuilt, then reopen a transaction for Drizzle's migration metadata.
COMMIT;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
BEGIN;--> statement-breakpoint
CREATE TABLE `__new_fund_assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snapshot_id` integer NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`market_value_cents` integer NOT NULL,
	`cumulative_investment_cents` integer NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `monthly_snapshots`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "fund_assets_name_not_empty" CHECK(length(trim("__new_fund_assets"."name")) > 0),
	CONSTRAINT "fund_assets_category_check" CHECK("__new_fund_assets"."category" in ('us-nasdaq-100', 'us-sp-500', 'japan-market', 'europe-market', 'china-csi-500', 'china-csi-300', 'china-dividend-index', 'satellite-strategy', 'china-bonds', 'gold')),
	CONSTRAINT "fund_assets_market_value_non_negative" CHECK(typeof("__new_fund_assets"."market_value_cents") = 'integer' and "__new_fund_assets"."market_value_cents" >= 0),
	CONSTRAINT "fund_assets_monthly_investment_integer" CHECK(typeof("__new_fund_assets"."cumulative_investment_cents") = 'integer')
);
--> statement-breakpoint
INSERT INTO `__new_fund_assets`("id", "snapshot_id", "name", "category", "market_value_cents", "cumulative_investment_cents") SELECT "id", "snapshot_id", "name", "category", "market_value_cents", "cumulative_investment_cents" FROM `fund_assets`;--> statement-breakpoint
DROP TABLE `fund_assets`;--> statement-breakpoint
ALTER TABLE `__new_fund_assets` RENAME TO `fund_assets`;--> statement-breakpoint
CREATE TABLE `__new_monthly_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`income_cents` integer NOT NULL,
	`expense_cents` integer NOT NULL,
	`investment_contribution_cents` integer NOT NULL,
	CONSTRAINT "monthly_snapshots_month_check" CHECK(length("__new_monthly_snapshots"."month") = 7
        and "__new_monthly_snapshots"."month" glob '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
        and cast(substr("__new_monthly_snapshots"."month", 6, 2) as integer) between 1 and 12),
	CONSTRAINT "monthly_snapshots_income_non_negative" CHECK(typeof("__new_monthly_snapshots"."income_cents") = 'integer' and "__new_monthly_snapshots"."income_cents" >= 0),
	CONSTRAINT "monthly_snapshots_expense_non_negative" CHECK(typeof("__new_monthly_snapshots"."expense_cents") = 'integer' and "__new_monthly_snapshots"."expense_cents" >= 0),
	CONSTRAINT "monthly_snapshots_investment_contribution_integer" CHECK(typeof("__new_monthly_snapshots"."investment_contribution_cents") = 'integer')
);
--> statement-breakpoint
INSERT INTO `__new_monthly_snapshots`("id", "month", "income_cents", "expense_cents", "investment_contribution_cents") SELECT "id", "month", "income_cents", "expense_cents", "investment_contribution_cents" FROM `monthly_snapshots`;--> statement-breakpoint
DROP TABLE `monthly_snapshots`;--> statement-breakpoint
ALTER TABLE `__new_monthly_snapshots` RENAME TO `monthly_snapshots`;--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_snapshots_month_unique` ON `monthly_snapshots` (`month`);--> statement-breakpoint
COMMIT;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
BEGIN;
