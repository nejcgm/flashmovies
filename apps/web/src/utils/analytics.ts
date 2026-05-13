/** Safe wrapper around GA4 gtag — no-ops when GA hasn't loaded yet. */
function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof (window as Window & { gtag?: (...a: unknown[]) => void }).gtag === "function") {
    (window as Window & { gtag: (...a: unknown[]) => void }).gtag(...args);
  }
}

/**
 * Fired when a non-logged-in user clicks "Login to Purchase" on the plans page.
 */
export function trackLoginToPurchaseClick() {
  gtag("event", "login_to_purchase_click", {
    event_category: "monetisation",
    event_label: "plans_page",
  });
}

/**
 * Fired when a logged-in user clicks "Get Pro" and the Stripe checkout begins.
 */
export function trackBeginCheckout(planCode: string) {
  gtag("event", "begin_checkout", {
    event_category: "monetisation",
    event_label: planCode,
    currency: "USD",
    value: 9.99,
    items: [{ item_id: planCode, item_name: "Pro Lifetime", price: 9.99 }],
  });
}
