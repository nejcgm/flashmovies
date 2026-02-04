import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('public/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    const userData = await this.usersService.findById(user.id);
    const subscription = await this.usersService.getSubscriptionStatus(user.id);
    return {
      id: userData.id,
      email: userData.email,
      displayName: userData.display_name,
      role: userData.role_code,
      subscription,
    };
  }

  @Get('subscription')
  async getSubscription(@CurrentUser() user: any) {
    return this.usersService.getSubscriptionStatus(user.id);
  }

  /**
   * TEST ENDPOINT: Remove pro status from current user
   * Use this to test the payment flow again
   */
  @Post('remove-pro')
  async removePro(@CurrentUser() user: any) {
    return this.usersService.removeProStatus(user.id);
  }
}
