-- Migration: Switch from PayPal back to Stripe
-- This migration is idempotent and can be run multiple times safely

-- =============================================================================
-- USERS TABLE: paypal_payer_id → stripe_customer_id
-- =============================================================================

-- Only rename if paypal_payer_id exists and stripe_customer_id doesn't
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'paypal_payer_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE users RENAME COLUMN paypal_payer_id TO stripe_customer_id;
        RAISE NOTICE 'Renamed users.paypal_payer_id to stripe_customer_id';
    ELSE
        RAISE NOTICE 'Skipping users column rename (already done or column missing)';
    END IF;
END $$;

-- Drop PayPal index if exists
DROP INDEX IF EXISTS idx_users_paypal_payer_id;

-- Create Stripe index if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_users_stripe_customer_id'
    ) THEN
        CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
        RAISE NOTICE 'Created index idx_users_stripe_customer_id';
    ELSE
        RAISE NOTICE 'Index idx_users_stripe_customer_id already exists';
    END IF;
END $$;

-- =============================================================================
-- SUBSCRIPTIONS TABLE: paypal columns → stripe columns
-- =============================================================================

-- Rename paypal_subscription_id → stripe_subscription_id
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'paypal_subscription_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id'
    ) THEN
        ALTER TABLE subscriptions RENAME COLUMN paypal_subscription_id TO stripe_subscription_id;
        RAISE NOTICE 'Renamed subscriptions.paypal_subscription_id to stripe_subscription_id';
    ELSE
        RAISE NOTICE 'Skipping subscriptions.paypal_subscription_id rename';
    END IF;
END $$;

-- Rename paypal_order_id → stripe_checkout_session_id
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'paypal_order_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'stripe_checkout_session_id'
    ) THEN
        ALTER TABLE subscriptions RENAME COLUMN paypal_order_id TO stripe_checkout_session_id;
        RAISE NOTICE 'Renamed subscriptions.paypal_order_id to stripe_checkout_session_id';
    ELSE
        RAISE NOTICE 'Skipping subscriptions.paypal_order_id rename';
    END IF;
END $$;

-- Drop PayPal indexes
DROP INDEX IF EXISTS idx_subscriptions_paypal_order_id;

-- Create Stripe indexes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_subscriptions_stripe_subscription_id'
    ) THEN
        CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
        RAISE NOTICE 'Created index idx_subscriptions_stripe_subscription_id';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_subscriptions_stripe_checkout_session_id'
    ) THEN
        CREATE INDEX idx_subscriptions_stripe_checkout_session_id ON subscriptions(stripe_checkout_session_id);
        RAISE NOTICE 'Created index idx_subscriptions_stripe_checkout_session_id';
    END IF;
END $$;

-- =============================================================================
-- PAYMENTS TABLE: paypal_capture_id → stripe_payment_intent_id
-- =============================================================================

-- Rename paypal_capture_id → stripe_payment_intent_id
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'paypal_capture_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE payments RENAME COLUMN paypal_capture_id TO stripe_payment_intent_id;
        RAISE NOTICE 'Renamed payments.paypal_capture_id to stripe_payment_intent_id';
    ELSE
        RAISE NOTICE 'Skipping payments.paypal_capture_id rename';
    END IF;
END $$;

-- =============================================================================
-- PLANS TABLE: Add stripe_price_id back if missing
-- =============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'plans' AND column_name = 'stripe_price_id'
    ) THEN
        ALTER TABLE plans ADD COLUMN stripe_price_id VARCHAR(255);
        RAISE NOTICE 'Added plans.stripe_price_id column';
    ELSE
        RAISE NOTICE 'Column plans.stripe_price_id already exists';
    END IF;
END $$;

-- =============================================================================
-- CLEANUP: Drop PayPal-specific tables
-- =============================================================================

-- Drop pending_paypal_orders table (no longer needed for Stripe)
DROP TABLE IF EXISTS pending_paypal_orders;

DO $$ 
BEGIN
    RAISE NOTICE 'Dropped pending_paypal_orders table if it existed';
END $$;

-- =============================================================================
-- VERIFICATION: Show updated schema
-- =============================================================================

DO $$ 
BEGIN
    RAISE NOTICE '=== Migration Complete ===';
    RAISE NOTICE 'Users table now has: stripe_customer_id';
    RAISE NOTICE 'Subscriptions table now has: stripe_subscription_id, stripe_checkout_session_id';
    RAISE NOTICE 'Payments table now has: stripe_payment_intent_id';
    RAISE NOTICE 'Plans table now has: stripe_price_id';
    RAISE NOTICE 'Run \d users, \d subscriptions, \d payments to verify';
END $$;
