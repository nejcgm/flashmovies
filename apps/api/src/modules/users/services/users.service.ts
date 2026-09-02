import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionStatus } from '../interfaces/users.interfaces';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getSubscriptionStatus(userId: number): Promise<SubscriptionStatus> {
    const sub = await this.usersRepository.findActiveSubscription(userId);

    if (!sub) {
      return {
        isPro: false,
        plan: 'free',
        subscription: null,
      };
    }

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

  async upgradeToProRole(userId: number) {
    const proRoleId = await this.usersRepository.findLookupId('user_role', 'pro');
    if (proRoleId) {
      await this.usersRepository.updateRole(userId, proRoleId);
    }
  }

  async downgradeFromProRole(userId: number) {
    const userRoleId = await this.usersRepository.findLookupId('user_role', 'user');
    if (userRoleId) {
      await this.usersRepository.updateRole(userId, userRoleId);
    }
  }

  async removeProStatus(userId: number) {
    const userRoleId = await this.usersRepository.findLookupId('user_role', 'user');
    const cancelledStatusId = await this.usersRepository.findLookupId('subscription_status', 'cancelled');

    if (userRoleId) {
      await this.usersRepository.updateRole(userId, userRoleId);
    }

    if (cancelledStatusId) {
      await this.usersRepository.cancelActiveSubscriptions(userId, cancelledStatusId);
    }

    return { message: 'Pro status removed successfully' };
  }
}
