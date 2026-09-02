import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../../config/database.module';
import { PlanRow } from '../interfaces/payments.interfaces';

@Injectable()
export class PaymentsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findActivePlans(): Promise<PlanRow[]> {
    const result = await this.pool.query<PlanRow>(
      `SELECT id, code, name, description, price_cents, currency, interval_type, stripe_price_id, is_active
       FROM plans WHERE is_active = TRUE ORDER BY price_cents ASC`,
    );
    return result.rows;
  }

  async findPlanByCode(code: string): Promise<PlanRow | null> {
    const result = await this.pool.query<PlanRow>(
      'SELECT * FROM plans WHERE code = $1 AND is_active = TRUE',
      [code],
    );
    return result.rows[0] ?? null;
  }

  async findPlanIdByCode(code: string): Promise<number | null> {
    const result = await this.pool.query<{ id: number }>(
      'SELECT id FROM plans WHERE code = $1',
      [code],
    );
    return result.rows[0]?.id ?? null;
  }

  async findUserEmail(userId: number): Promise<string | null> {
    const result = await this.pool.query<{ email: string }>(
      'SELECT email FROM users WHERE id = $1',
      [userId],
    );
    return result.rows[0]?.email ?? null;
  }

  async findUserIdByEmail(email: string): Promise<number | null> {
    const result = await this.pool.query<{ id: number }>(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    return result.rows[0]?.id ?? null;
  }

  async findSubscriptionByCheckoutSession(sessionId: string): Promise<{ id: number } | null> {
    const result = await this.pool.query<{ id: number }>(
      'SELECT id FROM subscriptions WHERE stripe_checkout_session_id = $1',
      [sessionId],
    );
    return result.rows[0] ?? null;
  }

  async findLookupId(category: string, code: string): Promise<number | null> {
    const result = await this.pool.query<{ id: number }>(
      'SELECT id FROM lookup_values WHERE category = $1 AND code = $2',
      [category, code],
    );
    return result.rows[0]?.id ?? null;
  }

  async insertSubscription(
    userId: number,
    planId: number,
    checkoutSessionId: string,
    statusId: number,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, stripe_checkout_session_id, status_id, is_lifetime, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, planId, checkoutSessionId, statusId, true, null],
    );
  }

  async insertPayment(
    userId: number,
    paymentIntentId: string | undefined,
    amountCents: number,
    currency: string,
    statusId: number,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO payments (user_id, stripe_payment_intent_id, amount_cents, currency, status_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, paymentIntentId, amountCents, currency, statusId],
    );
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<void> {
    await this.pool.query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [customerId, userId],
    );
  }

  async updatePaymentStatusByIntent(paymentIntentId: string, statusId: number): Promise<number | null> {
    const result = await this.pool.query<{ user_id: number }>(
      'UPDATE payments SET status_id = $1 WHERE stripe_payment_intent_id = $2 RETURNING user_id',
      [statusId, paymentIntentId],
    );
    return result.rows[0]?.user_id ?? null;
  }

  async cancelActiveSubscriptions(userId: number, cancelledStatusId: number, activeStatusId: number): Promise<void> {
    await this.pool.query(
      'UPDATE subscriptions SET status_id = $1 WHERE user_id = $2 AND status_id = $3',
      [cancelledStatusId, userId, activeStatusId],
    );
  }
}
