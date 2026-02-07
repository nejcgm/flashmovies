import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { DATABASE_POOL } from '../../config/database.module';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, ip: string, userAgent: string) {
    // Check if user exists
    const existingUser = await this.pool.query(
      'SELECT id FROM users WHERE email = $1',
      [dto.email.toLowerCase()],
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictException('Email already registered');
    }

    // Hash password (bcrypt 10 rounds)
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Get default role and status IDs
    const roleResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'user_role' AND code = 'user'",
    );
    const statusResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'user_status' AND code = 'active'",
    );

    const roleId = roleResult.rows[0]?.id || 1;
    const statusId = statusResult.rows[0]?.id || 1;

    // Create user
    const result = await this.pool.query(
      `INSERT INTO users (email, password_hash, display_name, role_id, status_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, display_name, role_id, created_at`,
      [dto.email.toLowerCase(), passwordHash, dto.displayName || null, roleId, statusId],
    );

    const user = result.rows[0];

    // Generate token and create session
    const token = await this.createSession(user.id, ip, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
      },
      accessToken: token,
    };
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    // Find user
    const result = await this.pool.query(
      `SELECT u.id, u.email, u.password_hash, u.display_name, u.role_id, u.status_id,
              lv.code as status_code
       FROM users u
       JOIN lookup_values lv ON u.status_id = lv.id
       WHERE u.email = $1`,
      [dto.email.toLowerCase()],
    );

    const user = result.rows[0];

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status_code !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token and create session
    const token = await this.createSession(user.id, ip, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
      },
      accessToken: token,
    };
  }

  async logout(userId: number, token: string) {
    const tokenHash = await this.hashToken(token);
    await this.pool.query(
      'UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND token_hash = $2',
      [userId, tokenHash],
    );
    return { message: 'Logged out successfully' };
  }

  async validateSession(userId: number, tokenHash: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT id FROM sessions
       WHERE user_id = $1 AND token_hash = $2
       AND expires_at > CURRENT_TIMESTAMP
       AND revoked_at IS NULL`,
      [userId, tokenHash],
    );
    return result.rows.length > 0;
  }

  private async createSession(userId: number, ip: string, userAgent: string): Promise<string> {
    const payload = { sub: userId, iat: Date.now() };
    const token = this.jwtService.sign(payload);
    const tokenHash = await this.hashToken(token);

    // Session expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.pool.query(
      `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, tokenHash, ip, userAgent, expiresAt],
    );

    return token;
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token.slice(-32), 5);
  }
}
