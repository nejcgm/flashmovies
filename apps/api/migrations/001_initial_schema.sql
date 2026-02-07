-- FlashMovies Database Schema
-- Initial migration

-- Lookup values table (for status/types instead of CHECK constraints)
CREATE TABLE IF NOT EXISTS lookup_values (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, code)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role_id INT NOT NULL DEFAULT 1,
    status_id INT NOT NULL DEFAULT 1,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for JWT validation)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL,
    stripe_subscription_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    status_id INT NOT NULL DEFAULT 1,
    is_lifetime BOOLEAN DEFAULT FALSE,
    starts_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_cents INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    interval_type VARCHAR(20), -- NULL for lifetime
    stripe_price_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment history
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INT REFERENCES subscriptions(id),
    stripe_payment_intent_id VARCHAR(255),
    amount_cents INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status_id ON users(status_id);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status_id ON subscriptions(status_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_lookup_values_category ON lookup_values(category);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lookup_values_updated_at BEFORE UPDATE ON lookup_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed lookup values
INSERT INTO lookup_values (category, code, display_name, sort_order) VALUES
    ('user_role', 'user', 'User', 1),
    ('user_role', 'pro', 'Pro User', 2),
    ('user_role', 'admin', 'Administrator', 3),
    ('user_status', 'active', 'Active', 1),
    ('user_status', 'inactive', 'Inactive', 2),
    ('user_status', 'banned', 'Banned', 3),
    ('subscription_status', 'active', 'Active', 1),
    ('subscription_status', 'cancelled', 'Cancelled', 2),
    ('subscription_status', 'expired', 'Expired', 3),
    ('subscription_status', 'pending', 'Pending', 4),
    ('payment_status', 'succeeded', 'Succeeded', 1),
    ('payment_status', 'pending', 'Pending', 2),
    ('payment_status', 'failed', 'Failed', 3),
    ('payment_status', 'refunded', 'Refunded', 4)
ON CONFLICT (category, code) DO NOTHING;

-- Seed plans
INSERT INTO plans (code, name, description, price_cents, currency, interval_type, is_active) VALUES
    ('free', 'Free', 'Basic access with ads', 0, 'EUR', NULL, TRUE),
    ('pro_monthly', 'Pro Monthly', 'Ad-free experience, billed monthly', 499, 'EUR', 'month', TRUE),
    ('pro_yearly', 'Pro Yearly', 'Ad-free experience, billed yearly (save 20%)', 4790, 'EUR', 'year', TRUE),
    ('pro_lifetime', 'Pro Lifetime', 'Ad-free experience forever, one-time payment', 9900, 'EUR', NULL, TRUE)
ON CONFLICT (code) DO NOTHING;
