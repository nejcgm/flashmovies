import { Controller, Post, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@Controller('public/webhooks')
export class WebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error('Raw body not available');
    }
    return this.paymentsService.handleWebhook(signature, rawBody);
  }
}
