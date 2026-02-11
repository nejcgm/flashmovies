# Stripe Integration Guide - FlashMovies

This guide covers the complete Stripe integration that replaced PayPal.

## 🎯 Overview

**What Changed:**
- ✅ Frontend now uses Stripe Buy Button
- ✅ Backend handles Stripe webhooks for payment confirmation
- ✅ Database migrated from PayPal columns to Stripe columns
- ✅ All PayPal code removed from both frontend and backend

## 📋 Prerequisites

1. Stripe Account (create at https://stripe.com)
2. Product created in Stripe Dashboard
3. Payment Link / Buy Button created in Stripe

## 🔧 Setup Instructions

### 1. Database Migration

Run the migration to convert PayPal columns to Stripe:

```bash
cd apps/api
psql -U flashmovies_user -d flashmovies_db -f migrations/004_paypal_to_stripe.sql
```

This migration:
- Renames `paypal_payer_id` → `stripe_customer_id` in users table
- Renames `paypal_order_id` → `stripe_checkout_session_id` in subscriptions table  
- Renames `paypal_capture_id` → `stripe_payment_intent_id` in payments table
- Drops `pending_paypal_orders` table
- Adds `stripe_price_id` column back to plans table

### 2. Backend Configuration

Update `apps/api/.env`:

```env
# Stripe Payments
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:5173
```

**Get your Stripe keys:**
- Secret Key: https://dashboard.stripe.com/apikeys
- Webhook Secret: https://dashboard.stripe.com/webhooks (after creating webhook)

### 3. Frontend Configuration

Update `apps/web/.env`:

```env
# Stripe Configuration (no longer needed - using backend API instead)
# VITE_STRIPE_PUBLISHABLE_KEY is not required anymore
```

**Note**: The frontend now uses the backend API to create checkout sessions with proper metadata. The Stripe publishable key and buy button ID are no longer needed in the frontend environment variables.

### 4. Create Stripe Product (Optional)

**Note**: Creating a product in the Stripe dashboard is optional. The checkout session is created programmatically via the backend API using inline price data.

If you want to track products in Stripe dashboard:
1. Go to https://dashboard.stripe.com/products
2. Create a product:
   - Name: "Pro Lifetime"
   - Price: $15.00 USD (one-time payment)
3. Note: The backend automatically creates checkout sessions with the correct price and metadata

### 5. Setup Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/api/v1/public/webhooks/stripe`
4. **Events to listen for**:
   - `checkout.session.completed` (required)
   - `payment_intent.succeeded` (optional)
   - `charge.refunded` (optional)
5. Copy the webhook signing secret
6. Add to `apps/api/.env` as `STRIPE_WEBHOOK_SECRET`

### 6. Testing Locally

For local testing, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/v1/public/webhooks/stripe

# IMPORTANT: Copy the webhook signing secret shown (starts with whsec_) to apps/api/.env
# This secret is different from the dashboard webhook secret and is required for local testing
```

**CRITICAL**: When you run `stripe listen`, it will output a webhook signing secret. You MUST update `apps/api/.env` with this secret:

```env
STRIPE_WEBHOOK_SECRET=whsec_[SECRET_FROM_STRIPE_LISTEN_COMMAND]
```

After updating, restart your API server for the changes to take effect.

## 🚀 How It Works

### Payment Flow

1. **User visits `/payments/plans`**
   - If not logged in: Shows "Login to Purchase"
   - If logged in & not Pro: Shows "Upgrade to Pro" button
   - If already Pro: Shows "Current Plan"

2. **User clicks "Upgrade to Pro" button**
   - Frontend calls backend API: `POST /api/v1/public/payments/create-checkout-session`
   - Backend creates Stripe Checkout Session with metadata (userId, planId, planCode)
   - Backend returns checkout URL
   - User is redirected to Stripe Checkout (hosted by Stripe)
   - User pays with card, Apple Pay, Google Pay, etc.

3. **After successful payment**
   - Stripe redirects to: `/payments/plans?session_id={CHECKOUT_SESSION_ID}`
   - Frontend shows success message and refreshes user status

4. **Stripe webhook fires** (`checkout.session.completed`)
   - Backend receives webhook
   - Verifies signature using webhook secret
   - Extracts userId and planId from session metadata
   - Creates subscription record in database
   - Records payment
   - Upgrades user role to "pro"

### Success URL Handling

The frontend checks for these URL parameters:
- `?session_id=cs_xxx` - From Stripe checkout session
- `?payment=success` - Generic success flag

When detected, it:
- Shows success message
- Calls `refreshUser()` to update Pro status
- Clears URL parameters

## 📁 File Changes

### Created Files
- `apps/api/migrations/004_paypal_to_stripe.sql` - Database migration
- `apps/web/src/components/payments/StripeBuyButton.tsx` - Stripe buy button component
- `STRIPE_INTEGRATION_GUIDE.md` - This guide

### Modified Files

**Backend:**
- `apps/api/src/modules/payments/payments.service.ts` - Complete rewrite for Stripe
- `apps/api/src/modules/payments/payments.controller.ts` - Updated endpoints
- `apps/api/src/modules/payments/webhook.controller.ts` - Changed to Stripe webhook
- `apps/api/src/main.ts` - Added raw body support, updated CORS
- `apps/api/.env` - Replaced PayPal with Stripe keys
- `apps/api/package.json` - Added `stripe` dependency

**Frontend:**
- `apps/web/src/pages/payments/plans.tsx` - Uses StripeBuyButton, handles success URL
- `apps/web/src/components/payments/index.ts` - Exports StripeBuyButton
- `apps/web/src/client/payments.ts` - Removed PayPal functions
- `apps/web/.env` - Added Stripe keys
- `apps/web/index.html` - Added Stripe script tag
- `apps/web/src/pages/footer-pages/ProPlanTermsConditionsPage.tsx` - Updated PayPal → Stripe

### Deleted Files
- `apps/web/src/components/payments/PaymentButtons.tsx` (old PayPal component)
- `apps/web/src/components/payments/PayPalButton.tsx` (old PayPal component)

## 🧪 Testing

### Test Payment

Use Stripe test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Any future expiry date, any CVC

### Verify Integration

1. **Frontend test:**
   ```bash
   cd apps/web
   npm run dev
   ```
   Visit http://localhost:5173/payments/plans

2. **Backend test:**
   ```bash
   cd apps/api
   npm run start:dev
   ```

3. **Make a test purchase:**
   - Login to your test account
   - Click Stripe Buy Button
   - Use test card `4242 4242 4242 4242`
   - Complete checkout
   - Verify redirect to success page
   - Check database for new subscription record

4. **Check webhook:**
   - View logs: Stripe CLI shows webhook events
   - Backend logs show "Checkout session completed"
   - Database: `subscriptions` table has new record with `stripe_checkout_session_id`

## 🔒 Security Notes

- Webhook signature verification prevents fake payment notifications
- Raw body preserved for Stripe signature verification
- User authentication required before checkout
- Email-based user lookup as fallback if metadata missing

## 🌐 Production Checklist

- [ ] Replace test keys with live keys in both frontend and backend .env
- [ ] Update Stripe webhook URL to production domain
- [ ] Update Success/Cancel URLs in Stripe Payment Link to production domain
- [ ] Test webhook delivery in production
- [ ] Monitor Stripe Dashboard for successful payments
- [ ] Set up email notifications for failed webhooks (Stripe Dashboard)

## 📊 Monitoring

### Stripe Dashboard
- Payments: https://dashboard.stripe.com/payments
- Webhooks: https://dashboard.stripe.com/webhooks
- Events: https://dashboard.stripe.com/events

### Database Queries

Check subscriptions:
```sql
SELECT u.email, s.stripe_checkout_session_id, s.created_at 
FROM subscriptions s 
JOIN users u ON u.id = s.user_id 
WHERE s.is_lifetime = true 
ORDER BY s.created_at DESC;
```

Check payments:
```sql
SELECT u.email, p.amount_cents, p.stripe_payment_intent_id, p.created_at
FROM payments p
JOIN users u ON u.id = p.user_id
ORDER BY p.created_at DESC;
```

## 🆘 Troubleshooting

### "Stripe secret key not configured"
- Check `STRIPE_SECRET_KEY` in `apps/api/.env`
- Restart backend server after adding keys

### Webhook signature verification failed
- Check `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret
- Ensure raw body is enabled (check `main.ts` has `rawBody: true`)

### Payment succeeds but user not upgraded
- Check backend logs for webhook errors
- Verify webhook endpoint is accessible from internet (use ngrok for local testing)
- Check database for subscription record

### Buy button not showing
- Check frontend console for script loading errors
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` and `VITE_STRIPE_BUY_BUTTON_ID` in `apps/web/.env`
- Ensure Stripe script is loaded in `index.html`

## 📝 Next Steps

1. Run the database migration
2. Add your Stripe keys to both .env files
3. Create Stripe product and payment link
4. Set up webhook endpoint
5. Test with Stripe CLI locally
6. Deploy and test in production

---

**Migration completed successfully!** 🎉

All PayPal code has been removed and replaced with Stripe integration.

Testing interactively
When testing interactively, use a card number, such as 4242 4242 4242 4242. Enter the card number in the Dashboard or in any payment form.

Use a valid future date, such as 12/34.
Use any three-digit CVC (four digits for American Express cards).
Use any value you like for other form fields.
