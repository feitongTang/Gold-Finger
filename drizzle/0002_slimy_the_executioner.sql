ALTER TABLE `monthly_snapshots`
ADD COLUMN `investment_loss_cents` integer DEFAULT 0 NOT NULL
CHECK(typeof(`investment_loss_cents`) = 'integer' and `investment_loss_cents` >= 0);
