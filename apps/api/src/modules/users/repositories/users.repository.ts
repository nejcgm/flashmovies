import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../../config/database.module';
import { ActiveSubscriptionRow, UserRow } from '../interfaces/users.interfaces';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findById(id: number): Promise<UserRow | null> {
    const result = await this.pool.query<UserRow>(
      `SELECT u.id, u.email, u.display_name, u.role_id, u.stripe_customer_id, u.created_at,
              lr.code as role_code, lr.display_name as role_name
       FROM users u
       JOIN lookup_values lr ON u.role_id = lr.id
       WHERE u.id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findActiveSubscription(userId: number): Promise<ActiveSubscriptionRow | null> {
    const result = await this.pool.query<ActiveSubscriptionRow>(
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
    return result.rows[0] ?? null;
  }

  async findLookupId(category: string, code: string): Promise<number | null> {
    const result = await this.pool.query<{ id: number }>(
      'SELECT id FROM lookup_values WHERE category = $1 AND code = $2',
      [category, code],
    );
    return result.rows[0]?.id ?? null;
  }

  async updateRole(userId: number, roleId: number): Promise<void> {
    await this.pool.query('UPDATE users SET role_id = $1 WHERE id = $2', [roleId, userId]);
  }

  async cancelActiveSubscriptions(userId: number, cancelledStatusId: number): Promise<void> {
    await this.pool.query(
      `UPDATE subscriptions SET status_id = $1
       WHERE user_id = $2 AND status_id = (
         SELECT id FROM lookup_values WHERE category = 'subscription_status' AND code = 'active'
       )`,
      [cancelledStatusId, userId],
    );
  }
}
