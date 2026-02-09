import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('public/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('plans')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 10000 }, long: { limit: 30, ttl: 60000 } })
  async getPlans() {
    return this.paymentsService.getPlans();
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @Throttle({ short: { limit: 1, ttl: 2000 }, medium: { limit: 3, ttl: 60000 }, long: { limit: 10, ttl: 600000 } })
  async createCheckoutSession(@CurrentUser() user: any, @Body('planCode') planCode: string) {
    return this.paymentsService.createCheckoutSession(user.id, planCode);
  }
}
