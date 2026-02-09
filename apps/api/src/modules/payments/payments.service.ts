import { Injectable, Inject, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import Stripe from 'stripe';
import { DATABASE_POOL } from '../../config/database.module';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new InternalServerErrorException('Stripe secret key not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-01-28.clover',
    });
    this.logger.log('Stripe initialized successfully');
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
    }>(
      `SELECT id, code, name, description, price_cents, currency, interval_type
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

    const userResult = await this.pool.query(
      'SELECT email FROM users WHERE id = $1',
      [userId],
    );

    if (userResult.rows.length === 0) {
      throw new BadRequestException('User not found');
    }

    const user = userResult.rows[0];

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            unit_amount: plan.price_cents,
            product_data: {
              name: plan.name,
              description: plan.description || 'FlashMovies Pro Plan',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/payments/plans?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/payments/plans`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        planId: plan.id.toString(),
        planCode: plan.code,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new InternalServerErrorException('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Webhook event received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge);
        break;
      case 'payment_intent.succeeded':
        this.logger.log(`Payment succeeded: ${event.data.object.id}`);
        break;
      case 'payment_intent.payment_failed':
        this.logger.warn(`Payment failed: ${event.data.object.id}`);
        break;
      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`Processing checkout session: ${session.id}`);

    const { userId, planId, planCode } = session.metadata || {};

    if (!userId || !planId) {
      if (session.customer_email) {
        const userResult = await this.pool.query(
          'SELECT id FROM users WHERE email = $1',
          [session.customer_email],
        );
        
        if (userResult.rows.length > 0) {
          const foundUserId = userResult.rows[0].id;
          const planResult = await this.pool.query(
            'SELECT id FROM plans WHERE code = $1',
            [planCode || 'pro_lifetime'],
          );
          
          if (planResult.rows.length > 0) {
            await this.grantProAccess(foundUserId, planResult.rows[0].id, session);
            return;
          }
        }
      }
      
      this.logger.error(`Cannot process checkout: missing user/plan metadata for session ${session.id}`);
      return;
    }

    await this.grantProAccess(parseInt(userId), parseInt(planId), session);
  }

  private async grantProAccess(userId: number, planId: number, session: Stripe.Checkout.Session) {
    try {
      const existingSubResult = await this.pool.query(
        'SELECT id FROM subscriptions WHERE stripe_checkout_session_id = $1',
        [session.id],
      );

      if (existingSubResult.rows.length > 0) {
        this.logger.log(`Subscription already exists for session ${session.id}`);
        return;
      }

      const activeStatusResult = await this.pool.query(
        "SELECT id FROM lookup_values WHERE category = 'subscription_status' AND code = 'active'",
      );
      const activeStatusId = activeStatusResult.rows[0]?.id || 1;

      await this.pool.query(
        `INSERT INTO subscriptions (user_id, plan_id, stripe_checkout_session_id, status_id, is_lifetime, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, planId, session.id, activeStatusId, true, null],
      );

      const succeededStatusResult = await this.pool.query(
        "SELECT id FROM lookup_values WHERE category = 'payment_status' AND code = 'succeeded'",
      );
      const succeededStatusId = succeededStatusResult.rows[0]?.id || 1;

      const amountCents = session.amount_total || 0;
      const currency = (session.currency || 'usd').toUpperCase();
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

      await this.pool.query(
        `INSERT INTO payments (user_id, stripe_payment_intent_id, amount_cents, currency, status_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, paymentIntentId, amountCents, currency, succeededStatusId],
      );

      if (session.customer) {
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
        await this.pool.query(
          'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
          [customerId, userId],
        );
      }

      await this.usersService.upgradeToProRole(userId);

      this.logger.log(`Pro access granted to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to grant Pro access: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleRefund(charge: Stripe.Charge) {
    try {
      this.logger.log(`Processing refund for charge: ${charge.id}`);

      const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

      if (!paymentIntentId) {
        this.logger.warn(`No payment intent ID found for refund on charge ${charge.id}`);
        return;
      }

      const refundedStatusResult = await this.pool.query(
        "SELECT id FROM lookup_values WHERE category = 'payment_status' AND code = 'refunded'",
      );
      const refundedStatusId = refundedStatusResult.rows[0]?.id || 4;

      const paymentResult = await this.pool.query(
        'UPDATE payments SET status_id = $1 WHERE stripe_payment_intent_id = $2 RETURNING user_id',
        [refundedStatusId, paymentIntentId],
      );

      if (paymentResult.rows.length === 0) {
        this.logger.warn(`Payment not found for payment intent ${paymentIntentId}`);
        return;
      }

      const userId = paymentResult.rows[0].user_id;

      const cancelledStatusResult = await this.pool.query(
        "SELECT id FROM lookup_values WHERE category = 'subscription_status' AND code = 'cancelled'",
      );
      const cancelledStatusId = cancelledStatusResult.rows[0]?.id;

      const activeStatusResult = await this.pool.query(
        "SELECT id FROM lookup_values WHERE category = 'subscription_status' AND code = 'active'",
      );
      const activeStatusId = activeStatusResult.rows[0]?.id;

      if (cancelledStatusId && activeStatusId) {
        await this.pool.query(
          'UPDATE subscriptions SET status_id = $1 WHERE user_id = $2 AND status_id = $3',
          [cancelledStatusId, userId, activeStatusId],
        );
      }

      await this.usersService.downgradeFromProRole(userId);

      this.logger.log(`Refund processed: Payment ${paymentIntentId} refunded, Pro access revoked for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to process refund: ${error.message}`, error.stack);
      throw error;
    }
  }
}
