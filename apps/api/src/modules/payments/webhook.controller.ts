import { Controller, Post, Req, Headers } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@Controller('public/webhooks')
export class WebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('paypal')
  @Throttle({ short: { limit: 10, ttl: 1000 }, medium: { limit: 50, ttl: 10000 }, long: { limit: 200, ttl: 60000 } })
  async handlePayPalWebhook(
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    const body = JSON.stringify(req.body);
    return this.paymentsService.handleWebhook(headers, body);
  }
}
