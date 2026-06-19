ALTER TABLE boats ADD COLUMN IF NOT EXISTS stripe_product_half_day_id text;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS stripe_product_full_day_id text;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS stripe_price_half_day_id text;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS stripe_price_full_day_id text;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS stripe_deposit_price_half_day_id text;
ALTER TABLE boats ADD COLUMN IF NOT EXISTS stripe_deposit_price_full_day_id text;
