import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { hashSessionToken } from '../../../common/utils/token.util';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, ip: string, userAgent: string) {
    const email = dto.email.toLowerCase();
    const existingUserId = await this.authRepository.findUserIdByEmail(email);

    if (existingUserId) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const roleId = (await this.authRepository.findLookupId('user_role', 'user')) ?? 1;
    const statusId = (await this.authRepository.findLookupId('user_status', 'active')) ?? 1;

    const user = await this.authRepository.insertUser(
      email,
      passwordHash,
      dto.displayName || null,
      roleId,
      statusId,
    );

    const token = await this.createSession(user.id, ip, userAgent);
    return { user, accessToken: token };
  }

  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.authRepository.findLoginUserByEmail(dto.email.toLowerCase());

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status_code !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const isValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.createSession(user.id, ip, userAgent);
    return {
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role_id: user.role_id,
        created_at: user.created_at,
      },
      accessToken: token,
    };
  }

  async logout(userId: number, token: string) {
    await this.authRepository.revokeSessionForToken(userId, token);
    return { message: 'Logged out successfully' };
  }

  private async createSession(userId: number, ip: string, userAgent: string): Promise<string> {
    const token = this.jwtService.sign({ sub: userId, iat: Date.now() });
    const tokenHash = await hashSessionToken(token);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepository.insertSession(userId, tokenHash, ip, userAgent, expiresAt);
    return token;
  }
}
