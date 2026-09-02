import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../../config/database.module';
import { verifySessionToken } from '../../../common/utils/token.util';
import { AuthUserRow, LoginUserRow } from '../interfaces/auth.interfaces';

@Injectable()
export class AuthRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findUserIdByEmail(email: string): Promise<number | null> {
    const result = await this.pool.query<{ id: number }>(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    return result.rows[0]?.id ?? null;
  }

  async findLoginUserByEmail(email: string): Promise<LoginUserRow | null> {
    const result = await this.pool.query<LoginUserRow>(
      `SELECT u.id, u.email, u.password_hash, u.display_name, u.role_id, u.status_id, u.created_at,
              lv.code as status_code
       FROM users u
       JOIN lookup_values lv ON u.status_id = lv.id
       WHERE u.email = $1`,
      [email],
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

  async insertUser(
    email: string,
    passwordHash: string,
    displayName: string | null,
    roleId: number,
    statusId: number,
  ): Promise<AuthUserRow> {
    const result = await this.pool.query<AuthUserRow>(
      `INSERT INTO users (email, password_hash, display_name, role_id, status_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, display_name, role_id, created_at`,
      [email, passwordHash, displayName, roleId, statusId],
    );
    return result.rows[0];
  }

  async insertSession(
    userId: number,
    tokenHash: string,
    ip: string,
    userAgent: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, tokenHash, ip, userAgent, expiresAt],
    );
  }

  async revokeSessionForToken(userId: number, token: string): Promise<void> {
    const result = await this.pool.query<{ id: number; token_hash: string }>(
      `SELECT id, token_hash FROM sessions
       WHERE user_id = $1
       AND expires_at > CURRENT_TIMESTAMP
       AND revoked_at IS NULL`,
      [userId],
    );

    for (const session of result.rows) {
      if (await verifySessionToken(token, session.token_hash)) {
        await this.pool.query(
          'UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1',
          [session.id],
        );
        return;
      }
    }
  }

  async hasValidSessionForToken(userId: number, token: string): Promise<boolean> {
    const result = await this.pool.query<{ token_hash: string }>(
      `SELECT token_hash FROM sessions
       WHERE user_id = $1
       AND expires_at > CURRENT_TIMESTAMP
       AND revoked_at IS NULL`,
      [userId],
    );

    for (const session of result.rows) {
      if (await verifySessionToken(token, session.token_hash)) {
        return true;
      }
    }

    return false;
  }
}
