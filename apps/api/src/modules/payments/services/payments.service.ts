import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { errorMessage, errorStack } from '../../../common/utils/error.util';
import { UsersService } from '../../users/services/users.service';
import { PaymentsRepository } from '../repositories/payments.repository';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new InternalServerErrorException('Stripe secret key not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-01-28.clover',
    });
    this.logger.log('Stripe initialized successfully');
  }

  async getPlans() {
    return this.paymentsRepository.findActivePlans();
  }

  async createCheckoutSession(userId: number, planCode: string) {
    const plan = await this.paymentsRepository.findPlanByCode(planCode);

    if (!plan) {
      throw new BadRequestException('Plan not found');
    }

    if (plan.price_cents === 0) {
      throw new BadRequestException('Cannot checkout free plan');
    }

    const email = await this.paymentsRepository.findUserEmail(userId);

    if (!email) {
      throw new BadRequestException('User not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            unit_amount: plan.price_cents,
            product_data: {
              name: plan.name,
              description: plan.description || 'FlashMovies Pro Plan',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/payments/plans?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/payments/plans`,
      customer_email: email,
      metadata: {
        userId: userId.toString(),
        planId: plan.id.toString(),
        planCode: plan.code,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new InternalServerErrorException('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const message = errorMessage(err);
      this.logger.error(`Webhook signature verification failed: ${message}`);
      throw new BadRequestException(`Webhook Error: ${message}`);
    }

    this.logger.log(`Webhook event received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge);
        break;
      case 'payment_intent.succeeded':
        this.logger.log(`Payment succeeded: ${event.data.object.id}`);
        break;
      case 'payment_intent.payment_failed':
        this.logger.warn(`Payment failed: ${event.data.object.id}`);
        break;
      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    this.logger.log(`Processing checkout session: ${session.id}`);

    const { userId, planId, planCode } = session.metadata || {};

    if (!userId || !planId) {
      if (session.customer_email) {
        const foundUserId = await this.paymentsRepository.findUserIdByEmail(session.customer_email);

        if (foundUserId) {
          const foundPlanId = await this.paymentsRepository.findPlanIdByCode(planCode || 'pro_lifetime');

          if (foundPlanId) {
            await this.grantProAccess(foundUserId, foundPlanId, session);
            return;
          }
        }
      }

      this.logger.error(`Cannot process checkout: missing user/plan metadata for session ${session.id}`);
      return;
    }

    await this.grantProAccess(parseInt(userId), parseInt(planId), session);
  }

  private async grantProAccess(userId: number, planId: number, session: Stripe.Checkout.Session) {
    try {
      const existing = await this.paymentsRepository.findSubscriptionByCheckoutSession(session.id);

      if (existing) {
        this.logger.log(`Subscription already exists for session ${session.id}`);
        return;
      }

      const activeStatusId =
        (await this.paymentsRepository.findLookupId('subscription_status', 'active')) ?? 1;

      await this.paymentsRepository.insertSubscription(
        userId,
        planId,
        session.id,
        activeStatusId,
      );

      const succeededStatusId =
        (await this.paymentsRepository.findLookupId('payment_status', 'succeeded')) ?? 1;

      const amountCents = session.amount_total || 0;
      const currency = (session.currency || 'usd').toUpperCase();
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

      await this.paymentsRepository.insertPayment(
        userId,
        paymentIntentId,
        amountCents,
        currency,
        succeededStatusId,
      );

      if (session.customer) {
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer.id;
        await this.paymentsRepository.updateStripeCustomerId(userId, customerId);
      }

      await this.usersService.upgradeToProRole(userId);

      this.logger.log(`Pro access granted to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to grant Pro access: ${errorMessage(error)}`, errorStack(error));
      throw error;
    }
  }

  private async handleRefund(charge: Stripe.Charge) {
    try {
      this.logger.log(`Processing refund for charge: ${charge.id}`);

      const paymentIntentId =
        typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;

      if (!paymentIntentId) {
        this.logger.warn(`No payment intent ID found for refund on charge ${charge.id}`);
        return;
      }

      const refundedStatusId =
        (await this.paymentsRepository.findLookupId('payment_status', 'refunded')) ?? 4;

      const userId = await this.paymentsRepository.updatePaymentStatusByIntent(
        paymentIntentId,
        refundedStatusId,
      );

      if (!userId) {
        this.logger.warn(`Payment not found for payment intent ${paymentIntentId}`);
        return;
      }

      const cancelledStatusId = await this.paymentsRepository.findLookupId(
        'subscription_status',
        'cancelled',
      );
      const activeStatusId = await this.paymentsRepository.findLookupId(
        'subscription_status',
        'active',
      );

      if (cancelledStatusId && activeStatusId) {
        await this.paymentsRepository.cancelActiveSubscriptions(
          userId,
          cancelledStatusId,
          activeStatusId,
        );
      }

      await this.usersService.downgradeFromProRole(userId);

      this.logger.log(
        `Refund processed: Payment ${paymentIntentId} refunded, Pro access revoked for user ${userId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to process refund: ${errorMessage(error)}`, errorStack(error));
      throw error;
    }
  }
}
