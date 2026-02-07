import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { DATABASE_POOL } from '../../config/database.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(DATABASE_POOL) private readonly pool: Pool,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const tokenHash = await bcrypt.hash(token.slice(-32), 5);

    // Validate session in database (NEVER trust JWT alone)
    const sessionResult = await this.pool.query(
      `SELECT s.id FROM sessions s
       WHERE s.user_id = $1
       AND s.expires_at > CURRENT_TIMESTAMP
       AND s.revoked_at IS NULL`,
      [payload.sub],
    );

    if (sessionResult.rows.length === 0) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    // Get user details
    const userResult = await this.pool.query(
      `SELECT u.id, u.email, u.display_name, u.role_id, u.paypal_payer_id,
              lr.code as role_code, ls.code as status_code
       FROM users u
       JOIN lookup_values lr ON u.role_id = lr.id
       JOIN lookup_values ls ON u.status_id = ls.id
       WHERE u.id = $1 AND ls.code = 'active'`,
      [payload.sub],
    );

    if (userResult.rows.length === 0) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const user = userResult.rows[0];
    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role_code,
      paypalPayerId: user.paypal_payer_id,
    };
  }
}
