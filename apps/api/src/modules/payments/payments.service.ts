import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../config/database.module';
import { UsersService } from '../users/users.service';

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: Array<{
    custom_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        custom_id?: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
  payer?: {
    payer_id: string;
    email_address: string;
  };
}

@Injectable()
export class PaymentsService {
  private readonly paypalBaseUrl: string;

  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const isProduction = this.configService.get('PAYPAL_MODE') === 'live';
    this.paypalBaseUrl = isProduction
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private async getPayPalAccessToken(): Promise<string> {
    const clientId = this.configService.get('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('PayPal credentials not configured');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${this.paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new InternalServerErrorException('Failed to get PayPal access token');
    }

    const data: PayPalAccessToken = await response.json();
    return data.access_token;
  }

  async getPlans() {
    const result = await this.pool.query<{
      id: number;
      code: string;
      name: string;
      description: string | null;
      price_cents: number;
      currency: string;
      interval_type: string | null;
    }>(
      `SELECT id, code, name, description, price_cents, currency, interval_type
       FROM plans WHERE is_active = TRUE ORDER BY price_cents ASC`,
    );
    return result.rows.map(plan => ({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      price: plan.price_cents / 100,
      currency: plan.currency,
      interval: plan.interval_type,
      isLifetime: plan.interval_type === null && plan.price_cents > 0,
    }));
  }

  async createPayPalOrder(userId: number, planCode: string) {
    // Get plan
    const planResult = await this.pool.query(
      'SELECT * FROM plans WHERE code = $1 AND is_active = TRUE',
      [planCode],
    );

    if (planResult.rows.length === 0) {
      throw new BadRequestException('Plan not found');
    }

    const plan = planResult.rows[0];

    if (plan.price_cents === 0) {
      throw new BadRequestException('Cannot checkout free plan');
    }

    const accessToken = await this.getPayPalAccessToken();
    const priceInDollars = (plan.price_cents / 100).toFixed(2);

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `user_${userId}_plan_${plan.id}`,
          description: plan.name,
          custom_id: JSON.stringify({
            userId,
            planId: plan.id,
            planCode: plan.code,
          }),
          amount: {
            currency_code: plan.currency,
            value: priceInDollars,
          },
        },
      ],
      application_context: {
        brand_name: 'FlashMovies',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${this.configService.get('FRONTEND_URL')}/payment/success`,
        cancel_url: `${this.configService.get('FRONTEND_URL')}/payment/cancel`,
      },
    };

    const response = await fetch(`${this.paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal order creation failed:', error);
      throw new InternalServerErrorException('Failed to create PayPal order');
    }

    const order: PayPalOrder = await response.json();

    // Store pending order in database
    await this.pool.query(
      `INSERT INTO pending_paypal_orders (paypal_order_id, user_id, plan_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (paypal_order_id) DO UPDATE SET user_id = $2, plan_id = $3`,
      [order.id, userId, plan.id],
    );

    return {
      orderId: order.id,
      status: order.status,
    };
  }

  async capturePayPalOrder(orderId: string, userId: number) {
    // Get plan info from pending order
    const pendingOrderResult = await this.pool.query(
      'SELECT plan_id FROM pending_paypal_orders WHERE paypal_order_id = $1 AND user_id = $2',
      [orderId, userId],
    );

    if (pendingOrderResult.rows.length === 0) {
      throw new BadRequestException('Order not found or does not belong to user');
    }

    const planId = pendingOrderResult.rows[0].plan_id;
    const accessToken = await this.getPayPalAccessToken();

    const response = await fetch(`${this.paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal capture failed:', error);
      throw new BadRequestException('Failed to capture PayPal payment');
    }

    const order: PayPalOrder = await response.json();

    if (order.status === 'COMPLETED') {
      await this.handleSuccessfulPayment(order, userId, planId);

      // Clean up pending order after successful payment
      await this.pool.query(
        'DELETE FROM pending_paypal_orders WHERE paypal_order_id = $1',
        [orderId],
      );
    }

    return {
      status: order.status,
      orderId: order.id,
    };
  }

  private async handleSuccessfulPayment(order: PayPalOrder, userId: number, planId: number) {
    // Get capture details from PayPal response
    const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = capture?.id;
    const amountCents = capture ? Math.round(parseFloat(capture.amount.value) * 100) : 0;
    const currency = capture?.amount.currency_code || 'USD';

    // Update user's PayPal payer ID if available
    if (order.payer?.payer_id) {
      await this.usersService.updatePayPalPayerId(userId, order.payer.payer_id);
    }

    // Get active subscription status
    const activeStatusResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'subscription_status' AND code = 'active'",
    );
    const activeStatusId = activeStatusResult.rows[0]?.id || 1;

    // Create subscription record (lifetime - no expiry)
    await this.pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, paypal_order_id, status_id, is_lifetime, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, planId, order.id, activeStatusId, true, null],
    );

    // Record payment
    const succeededStatusResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'payment_status' AND code = 'succeeded'",
    );
    const succeededStatusId = succeededStatusResult.rows[0]?.id || 1;

    await this.pool.query(
      `INSERT INTO payments (user_id, paypal_capture_id, amount_cents, currency, status_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, captureId, amountCents, currency, succeededStatusId],
    );

    // Upgrade user role to pro
    await this.usersService.upgradeToProRole(userId);
  }

  async handleWebhook(headers: Record<string, string>, body: string) {
    const webhookId = this.configService.get('PAYPAL_WEBHOOK_ID');
    const accessToken = await this.getPayPalAccessToken();

    // Verify webhook signature
    const verifyPayload = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    const verifyResponse = await fetch(`${this.paypalBaseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyPayload),
    });

    if (!verifyResponse.ok) {
      throw new BadRequestException('Webhook verification failed');
    }

    const verifyResult = await verifyResponse.json();
    if (verifyResult.verification_status !== 'SUCCESS') {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was captured successfully - already handled in capturePayPalOrder
        console.log('Payment capture completed:', event.resource.id);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await this.handleRefund(event.resource);
        break;
      default:
        console.log('Unhandled webhook event:', event.event_type);
    }

    return { received: true };
  }

  private async handleRefund(resource: { id: string; amount: { value: string } }) {
    // Mark payment as refunded
    const refundedStatusResult = await this.pool.query(
      "SELECT id FROM lookup_values WHERE category = 'payment_status' AND code = 'refunded'",
    );
    const refundedStatusId = refundedStatusResult.rows[0]?.id || 4;

    await this.pool.query(
      'UPDATE payments SET status_id = $1 WHERE paypal_capture_id = $2',
      [refundedStatusId, resource.id],
    );

    console.log(`Payment ${resource.id} marked as refunded`);
  }
}
