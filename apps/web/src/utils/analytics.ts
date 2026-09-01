import type {
  CheckoutSource,
  PlansAuthIntent,
} from "../interfaces/analytics/index.ts";

function gtag(...args: unknown[]) {
  if (
    typeof window !== "undefined" &&
    typeof (window as Window & { gtag?: (...a: unknown[]) => void }).gtag ===
      "function"
  ) {
    (window as Window & { gtag: (...a: unknown[]) => void }).gtag(...args);
  }
}

export function trackPlansAuthIntent(intent: PlansAuthIntent) {
  gtag("event", "plans_auth_intent", {
    event_category: "monetisation",
    intent,
    page: "plans",
  });
}

export function trackBeginCheckout(planCode: string, source: CheckoutSource) {
  gtag("event", "begin_checkout", {
    event_category: "monetisation",
    event_label: planCode,
    checkout_source: source,
    currency: "USD",
    value: 6.99,
    items: [
      {
        item_id: planCode,
        item_name: "Pro Lifetime",
        item_category: "subscription",
        price: 6.99,
        quantity: 1,
      },
    ],
  });
}
