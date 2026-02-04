import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../config/database.module';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findById(id: number) {
    const result = await this.pool.query(
      `SELECT u.id, u.email, u.display_name, u.role_id, u.paypal_payer_id, u.created_at,
              lr.code as role_code, lr.display_name as role_name
       FROM users u
       JOIN lookup_values lr ON u.role_id = lr.id
       WHERE u.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    return result.rows[0];
  }

  async getSubscriptionStatus(userId: number) {
    const result = await this.pool.query(
      `SELECT s.id, s.is_lifetime, s.starts_at, s.expires_at,
              p.code as plan_code, p.name as plan_name,
              ls.code as status_code
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       JOIN lookup_values ls ON s.status_id = ls.id
       WHERE s.user_id = $1 AND ls.code = 'active'
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId],
    );

    if (result.rows.length === 0) {
      return {
        isPro: false,
        plan: 'free',
        subscription: null,
      };
    }

    const sub = result.rows[0];
    return {
      isPro: true,
      plan: sub.plan_code,
      subscription: {
        id: sub.id,
        isLifetime: sub.is_lifetime,
        startsAt: sub.starts_at,
        expiresAt: sub.expires_at,
        planName: sub.plan_name,
      },
    };
  }

  async updatePayPalPayerId(userId: number, payerId: string) {
    await this.pool.query(
      'UPDATE users SET paypal_payer_id = $1 WHERE id = $2',
      [payerId, userId],
    );
  }

  async upgradeToProRole(userId: number) {
    const proRoleResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'user_role' AND code = 'pro'",
    );
    const proRoleId = proRoleResult.rows[0]?.id;
    if (proRoleId) {
      await this.pool.query('UPDATE users SET role_id = $1 WHERE id = $2', [proRoleId, userId]);
    }
  }

  /**
   * Remove pro status from user (TEST ENDPOINT ONLY)
   * - Downgrades user role to 'user'
   * - Cancels active subscriptions
   */
  async removeProStatus(userId: number) {
    const userRoleResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'user_role' AND code = 'user'",
    );
    const userRoleId = userRoleResult.rows[0]?.id;

    const cancelledStatusResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'subscription_status' AND code = 'cancelled'",
    );
    const cancelledStatusId = cancelledStatusResult.rows[0]?.id;

    if (userRoleId) {
      await this.pool.query('UPDATE users SET role_id = $1 WHERE id = $2', [userRoleId, userId]);
    }

    if (cancelledStatusId) {
      await this.pool.query(
        `UPDATE subscriptions SET status_id = $1 
         WHERE user_id = $2 AND status_id = (
           SELECT id FROM lookup_values WHERE category = 'subscription_status' AND code = 'active'
         )`,
        [cancelledStatusId, userId],
      );
    }

    return { message: 'Pro status removed successfully' };
  }
}
