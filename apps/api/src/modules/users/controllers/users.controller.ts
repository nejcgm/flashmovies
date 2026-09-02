import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { mapRemoveProResponse, mapSubscriptionStatus, mapUserProfile } from '../mappers/users.mappers';
import { UsersService } from '../services/users.service';

@Controller('public/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    const userData = await this.usersService.findById(user.id);
    const subscription = await this.usersService.getSubscriptionStatus(user.id);
    return mapUserProfile(userData, subscription);
  }

  @Get('subscription')
  async getSubscription(@CurrentUser() user: AuthenticatedUser) {
    const subscription = await this.usersService.getSubscriptionStatus(user.id);
    return mapSubscriptionStatus(subscription);
  }

  @Post('remove-pro')
  async removePro(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.usersService.removeProStatus(user.id);
    return mapRemoveProResponse(result.message);
  }
}
