-- Migration: Add table for pending PayPal orders
-- Stores order info between creation and capture to avoid relying on PayPal response data

CREATE TABLE IF NOT EXISTS pending_paypal_orders (
    id SERIAL PRIMARY KEY,
    paypal_order_id VARCHAR(50) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pending_paypal_orders_order_id ON pending_paypal_orders(paypal_order_id);
CREATE INDEX idx_pending_paypal_orders_user_id ON pending_paypal_orders(user_id);

-- Clean up old pending orders (older than 24 hours) - can be run periodically
-- DELETE FROM pending_paypal_orders WHERE created_at < NOW() - INTERVAL '24 hours';
