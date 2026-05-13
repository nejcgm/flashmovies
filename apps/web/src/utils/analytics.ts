/** Safe wrapper around GA4 gtag — no-ops when GA hasn't loaded yet. */
function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof (window as Window & { gtag?: (...a: unknown[]) => void }).gtag === "function") {
    (window as Window & { gtag: (...a: unknown[]) => void }).gtag(...args);
  }
}

/** Guest chose how to sign in on plans — before auth / `begin_checkout`. Register `intent` in GA4 as a custom dimension if you want breakdowns. */
export type PlansAuthIntent = "login" | "register";

export function trackPlansAuthIntent(intent: PlansAuthIntent) {
  gtag("event", "plans_auth_intent", {
    event_category: "monetisation",
    intent,
    page: "plans",
  });
}

/** How checkout was started — for GA4 `checkout_source` dimension. */
export type CheckoutSource = "logged_in" | "after_login" | "after_register";

/**
 * Fired when Stripe checkout begins.
 * - `logged_in` — user was already signed in and tapped Get Pro
 * - `after_login` — returned from login with auto-checkout URL
 * - `after_register` — returned from registration with auto-checkout URL
 */
export function trackBeginCheckout(planCode: string, source: CheckoutSource) {
  gtag("event", "begin_checkout", {
    event_category: "monetisation",
    event_label: planCode,
    checkout_source: source,
    currency: "USD",
    value: 9.99,
    items: [
      {
        item_id: planCode,
        item_name: "Pro Lifetime",
        item_category: "subscription",
        price: 9.99,
        quantity: 1,
      },
    ],
  });
}
