import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../modules/users/services/users.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class ProGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest().user as AuthenticatedUser;
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.role === 'pro' || user.role === 'admin') {
      return true;
    }

    const status = await this.usersService.getSubscriptionStatus(user.id);
    if (!status.isPro) {
      throw new ForbiddenException('Pro subscription required');
    }

    return true;
  }
}
