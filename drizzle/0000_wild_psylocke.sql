CREATE TABLE `cash_assets` (
	`snapshot_id` integer PRIMARY KEY NOT NULL,
	`emergency_fund_cents` integer NOT NULL,
	`goal_fund_cents` integer NOT NULL,
	`daily_cash_cents` integer NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `monthly_snapshots`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "cash_assets_emergency_fund_non_negative" CHECK(typeof("cash_assets"."emergency_fund_cents") = 'integer' and "cash_assets"."emergency_fund_cents" >= 0),
	CONSTRAINT "cash_assets_goal_fund_non_negative" CHECK(typeof("cash_assets"."goal_fund_cents") = 'integer' and "cash_assets"."goal_fund_cents" >= 0),
	CONSTRAINT "cash_assets_daily_cash_non_negative" CHECK(typeof("cash_assets"."daily_cash_cents") = 'integer' and "cash_assets"."daily_cash_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE `fund_assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snapshot_id` integer NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`market_value_cents` integer NOT NULL,
	`cumulative_investment_cents` integer NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `monthly_snapshots`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "fund_assets_name_not_empty" CHECK(length(trim("fund_assets"."name")) > 0),
	CONSTRAINT "fund_assets_category_check" CHECK("fund_assets"."category" in ('us-nasdaq-100', 'us-sp-500', 'japan-market', 'europe-market', 'china-csi-500', 'china-csi-300', 'china-dividend-index', 'satellite-strategy', 'china-bonds', 'gold')),
	CONSTRAINT "fund_assets_market_value_non_negative" CHECK(typeof("fund_assets"."market_value_cents") = 'integer' and "fund_assets"."market_value_cents" >= 0),
	CONSTRAINT "fund_assets_cumulative_investment_non_negative" CHECK(typeof("fund_assets"."cumulative_investment_cents") = 'integer' and "fund_assets"."cumulative_investment_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE `liabilities` (
	`snapshot_id` integer PRIMARY KEY NOT NULL,
	`huabei_balance_cents` integer NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `monthly_snapshots`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "liabilities_huabei_balance_non_negative" CHECK(typeof("liabilities"."huabei_balance_cents") = 'integer' and "liabilities"."huabei_balance_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE `monthly_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`income_cents` integer NOT NULL,
	`expense_cents` integer NOT NULL,
	`investment_contribution_cents` integer NOT NULL,
	CONSTRAINT "monthly_snapshots_month_check" CHECK(length("monthly_snapshots"."month") = 7
        and "monthly_snapshots"."month" glob '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
        and cast(substr("monthly_snapshots"."month", 6, 2) as integer) between 1 and 12),
	CONSTRAINT "monthly_snapshots_income_non_negative" CHECK(typeof("monthly_snapshots"."income_cents") = 'integer' and "monthly_snapshots"."income_cents" >= 0),
	CONSTRAINT "monthly_snapshots_expense_non_negative" CHECK(typeof("monthly_snapshots"."expense_cents") = 'integer' and "monthly_snapshots"."expense_cents" >= 0),
	CONSTRAINT "monthly_snapshots_investment_contribution_non_negative" CHECK(typeof("monthly_snapshots"."investment_contribution_cents") = 'integer' and "monthly_snapshots"."investment_contribution_cents" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_snapshots_month_unique` ON `monthly_snapshots` (`month`);