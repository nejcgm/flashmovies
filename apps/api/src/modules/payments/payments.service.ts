import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import Stripe from 'stripe';
import { DATABASE_POOL } from '../../config/database.module';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
  }

  async getPlans() {
    const result = await this.pool.query<{
      id: number;
      code: string;
      name: string;
      description: string | null;
      price_cents: number;
      currency: string;
      interval_type: string | null;
      stripe_price_id: string | null;
    }>(
      `SELECT id, code, name, description, price_cents, currency, interval_type, stripe_price_id
       FROM plans WHERE is_active = TRUE ORDER BY price_cents ASC`,
    );
    return result.rows.map(plan => ({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      price: plan.price_cents / 100,
      currency: plan.currency,
      interval: plan.interval_type,
      isLifetime: plan.interval_type === null && plan.price_cents > 0,
    }));
  }

  async createCheckoutSession(userId: number, planCode: string) {
    // Get plan
    const planResult = await this.pool.query(
      'SELECT * FROM plans WHERE code = $1 AND is_active = TRUE',
      [planCode],
    );

    if (planResult.rows.length === 0) {
      throw new BadRequestException('Plan not found');
    }

    const plan = planResult.rows[0];

    if (plan.price_cents === 0) {
      throw new BadRequestException('Cannot checkout free plan');
    }

    // Get or create Stripe customer
    const user = await this.usersService.findById(userId);
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId: userId.toString() },
      });
      customerId = customer.id;
      await this.usersService.updateStripeCustomerId(userId, customerId);
    }

    // Create checkout session
    const isLifetime = plan.interval_type === null;
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:8080';

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description || undefined,
            },
            unit_amount: plan.price_cents,
            ...(isLifetime ? {} : { recurring: { interval: plan.interval_type } }),
          },
          quantity: 1,
        },
      ],
      mode: isLifetime ? 'payment' : 'subscription',
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancel`,
      metadata: {
        userId: userId.toString(),
        planId: plan.id.toString(),
        planCode: plan.code,
        isLifetime: isLifetime.toString(),
      },
    };

    const session = await this.stripe.checkout.sessions.create(sessionConfig);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret || '');
    } catch (err) {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = parseInt(session.metadata?.userId || '0');
    const planId = parseInt(session.metadata?.planId || '0');
    const isLifetime = session.metadata?.isLifetime === 'true';

    if (!userId || !planId) return;

    // Get active subscription status
    const activeStatusResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'subscription_status' AND code = 'active'",
    );
    const activeStatusId = activeStatusResult.rows[0]?.id || 1;

    // Create subscription record
    const expiresAt = isLifetime ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days for monthly

    await this.pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, stripe_subscription_id, stripe_payment_intent_id, status_id, is_lifetime, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        planId,
        session.subscription || null,
        session.payment_intent || null,
        activeStatusId,
        isLifetime,
        expiresAt,
      ],
    );

    // Record payment
    const succeededStatusResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'payment_status' AND code = 'succeeded'",
    );
    const succeededStatusId = succeededStatusResult.rows[0]?.id || 1;

    await this.pool.query(
      `INSERT INTO payments (user_id, stripe_payment_intent_id, amount_cents, currency, status_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, session.payment_intent, session.amount_total, session.currency?.toUpperCase(), succeededStatusId],
    );

    // Upgrade user role
    await this.usersService.upgradeToProRole(userId);
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    // Find user by stripe customer id
    const userResult = await this.pool.query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId],
    );

    if (userResult.rows.length === 0) return;

    const userId = userResult.rows[0].id;

    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      // Mark subscription as cancelled
      const cancelledStatusResult = await this.pool.query(
        "SELECT id FROM lookup_values WHERE category = 'subscription_status' AND code = 'cancelled'",
      );
      const cancelledStatusId = cancelledStatusResult.rows[0]?.id || 2;

      await this.pool.query(
        `UPDATE subscriptions SET status_id = $1, cancelled_at = CURRENT_TIMESTAMP
         WHERE user_id = $2 AND stripe_subscription_id = $3`,
        [cancelledStatusId, userId, subscription.id],
      );
    }
  }
}
