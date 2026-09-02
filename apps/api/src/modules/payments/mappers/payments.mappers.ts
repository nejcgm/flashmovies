import { PlanRow } from '../interfaces/payments.interfaces';

export function mapPlan(plan: PlanRow) {
  return {
    id: plan.id,
    code: plan.code,
    name: plan.name,
    description: plan.description,
    price: plan.price_cents / 100,
    currency: plan.currency,
    interval: plan.interval_type,
    isLifetime: plan.interval_type === null && plan.price_cents > 0,
  };
}

export function mapPlans(plans: PlanRow[]) {
  return plans.map(mapPlan);
}

export function mapCheckoutSession(sessionId: string, url: string | null) {
  return {
    sessionId,
    url,
  };
}

export function mapWebhookResponse(received: boolean) {
  return { received };
}
