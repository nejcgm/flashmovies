import { Controller, Post, Req, Headers } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@Controller('public/webhooks')
export class WebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('paypal')
  async handlePayPalWebhook(
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    const body = JSON.stringify(req.body);
    return this.paymentsService.handleWebhook(headers, body);
  }
}
