-- Migration: Switch from Stripe to PayPal
-- Simplify to only lifetime subscription at $15

-- Rename Stripe columns to PayPal in users table
ALTER TABLE users RENAME COLUMN stripe_customer_id TO paypal_payer_id;

-- Drop old Stripe-related indexes
DROP INDEX IF EXISTS idx_users_stripe_customer_id;

-- Create new PayPal-related indexes
CREATE INDEX idx_users_paypal_payer_id ON users(paypal_payer_id);

-- Update subscriptions table: rename Stripe columns to PayPal
ALTER TABLE subscriptions RENAME COLUMN stripe_subscription_id TO paypal_subscription_id;
ALTER TABLE subscriptions RENAME COLUMN stripe_payment_intent_id TO paypal_order_id;

-- Drop old Stripe-related indexes on subscriptions
DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription_id;

-- Create new PayPal-related indexes on subscriptions
CREATE INDEX idx_subscriptions_paypal_order_id ON subscriptions(paypal_order_id);

-- Update payments table: rename Stripe columns to PayPal
ALTER TABLE payments RENAME COLUMN stripe_payment_intent_id TO paypal_capture_id;

-- Remove stripe_price_id from plans table (not needed for PayPal)
ALTER TABLE plans DROP COLUMN IF EXISTS stripe_price_id;

-- Deactivate old plans and update to new pricing structure
UPDATE plans SET is_active = FALSE;

-- Delete old plans and insert new simplified plans
DELETE FROM plans WHERE code IN ('pro_monthly', 'pro_yearly');

-- Update free plan
UPDATE plans SET 
    name = 'Free',
    description = 'Basic access with ads',
    price_cents = 0,
    currency = 'USD',
    interval_type = NULL,
    is_active = TRUE
WHERE code = 'free';

-- Update lifetime plan to $15
UPDATE plans SET 
    name = 'Pro Lifetime',
    description = 'Ad-free experience forever, one-time payment',
    price_cents = 1500,
    currency = 'USD',
    interval_type = NULL,
    is_active = TRUE
WHERE code = 'pro_lifetime';

-- If pro_lifetime doesn't exist, insert it
INSERT INTO plans (code, name, description, price_cents, currency, interval_type, is_active)
SELECT 'pro_lifetime', 'Pro Lifetime', 'Ad-free experience forever, one-time payment', 1500, 'USD', NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE code = 'pro_lifetime');
