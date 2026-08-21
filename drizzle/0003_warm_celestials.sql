PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_monthly_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`income_cents` integer NOT NULL,
	`expense_cents` integer NOT NULL,
	`investment_loss_cents` integer DEFAULT 0 NOT NULL,
	`investment_contribution_cents` integer NOT NULL,
	CONSTRAINT "monthly_snapshots_month_check" CHECK(length("__new_monthly_snapshots"."month") = 7
        and "__new_monthly_snapshots"."month" glob '[0-9][0-9][0-9][0-9]-[0-1][0-9]'
        and cast(substr("__new_monthly_snapshots"."month", 6, 2) as integer) between 1 and 12),
	CONSTRAINT "monthly_snapshots_income_non_negative" CHECK(typeof("__new_monthly_snapshots"."income_cents") = 'integer' and "__new_monthly_snapshots"."income_cents" >= 0),
	CONSTRAINT "monthly_snapshots_expense_non_negative" CHECK(typeof("__new_monthly_snapshots"."expense_cents") = 'integer' and "__new_monthly_snapshots"."expense_cents" >= 0),
	CONSTRAINT "monthly_snapshots_investment_profit_loss_integer" CHECK(typeof("__new_monthly_snapshots"."investment_loss_cents") = 'integer'),
	CONSTRAINT "monthly_snapshots_investment_contribution_integer" CHECK(typeof("__new_monthly_snapshots"."investment_contribution_cents") = 'integer')
);
--> statement-breakpoint
INSERT INTO `__new_monthly_snapshots`("id", "month", "income_cents", "expense_cents", "investment_loss_cents", "investment_contribution_cents") SELECT "id", "month", "income_cents", "expense_cents", "investment_loss_cents", "investment_contribution_cents" FROM `monthly_snapshots`;--> statement-breakpoint
CREATE TEMP TABLE `__backup_cash_assets` AS SELECT * FROM `cash_assets`;--> statement-breakpoint
CREATE TEMP TABLE `__backup_fund_assets` AS SELECT * FROM `fund_assets`;--> statement-breakpoint
CREATE TEMP TABLE `__backup_liabilities` AS SELECT * FROM `liabilities`;--> statement-breakpoint
DROP TABLE `monthly_snapshots`;--> statement-breakpoint
ALTER TABLE `__new_monthly_snapshots` RENAME TO `monthly_snapshots`;--> statement-breakpoint
INSERT INTO `cash_assets` SELECT * FROM `__backup_cash_assets`;--> statement-breakpoint
INSERT INTO `fund_assets` SELECT * FROM `__backup_fund_assets`;--> statement-breakpoint
INSERT INTO `liabilities` SELECT * FROM `__backup_liabilities`;--> statement-breakpoint
DROP TABLE `__backup_cash_assets`;--> statement-breakpoint
DROP TABLE `__backup_fund_assets`;--> statement-breakpoint
DROP TABLE `__backup_liabilities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_snapshots_month_unique` ON `monthly_snapshots` (`month`);
