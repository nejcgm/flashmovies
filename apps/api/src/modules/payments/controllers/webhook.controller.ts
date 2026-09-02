import { Controller, Post, Req, Headers, RawBodyRequest, BadRequestException, Logger } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { mapWebhookResponse } from '../mappers/payments.mappers';
import { PaymentsService } from '../services/payments.service';

@Controller('public/webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe')
  @Throttle({ short: { limit: 10, ttl: 1000 }, medium: { limit: 50, ttl: 10000 }, long: { limit: 200, ttl: 60000 } })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      this.logger.error('Raw body not available for webhook verification');
      throw new BadRequestException('Invalid webhook request');
    }
    const result = await this.paymentsService.handleWebhook(signature, req.rawBody);
    return mapWebhookResponse(result.received);
  }
}
