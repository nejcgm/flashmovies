import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../common/interfaces/authenticated-user.interface';
import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import { mapCheckoutSession, mapPlans } from '../mappers/payments.mappers';
import { PaymentsService } from '../services/payments.service';

@Controller('public/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('plans')
  @Throttle({ short: { limit: 2, ttl: 1000 }, medium: { limit: 10, ttl: 10000 }, long: { limit: 30, ttl: 60000 } })
  async getPlans() {
    const plans = await this.paymentsService.getPlans();
    return mapPlans(plans);
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @Throttle({ short: { limit: 1, ttl: 2000 }, medium: { limit: 3, ttl: 60000 }, long: { limit: 10, ttl: 600000 } })
  async createCheckoutSession(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCheckoutSessionDto) {
    const session = await this.paymentsService.createCheckoutSession(user.id, dto.planCode);
    return mapCheckoutSession(session.sessionId, session.url);
  }
}
