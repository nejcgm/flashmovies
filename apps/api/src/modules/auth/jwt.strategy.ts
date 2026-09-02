import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser, UserRole } from '../../common/interfaces/authenticated-user.interface';
import { UsersService } from '../users/services/users.service';
import { AuthRepository } from './repositories/auth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: { sub: number }): Promise<AuthenticatedUser> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const hasSession = await this.authRepository.hasValidSessionForToken(payload.sub, token);
    if (!hasSession) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    const user = await this.usersService.findById(payload.sub);

    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role_code as UserRole,
      stripeCustomerId: user.stripe_customer_id,
    };
  }
}
