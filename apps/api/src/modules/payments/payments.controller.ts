import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('public/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('plans')
  async getPlans() {
    return this.paymentsService.getPlans();
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(@CurrentUser() user: any, @Body('planCode') planCode: string) {
    return this.paymentsService.createCheckoutSession(user.id, planCode);
  }
}
