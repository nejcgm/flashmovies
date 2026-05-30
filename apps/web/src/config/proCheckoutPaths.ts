/** Post-auth return URLs for Stripe auto-checkout (encoded for query params). */
export const PLANS_AUTO_CHECKOUT_LOGIN = encodeURIComponent(
  '/payments/plans?autoCheckout=1&checkout_origin=login',
);
export const PLANS_AUTO_CHECKOUT_REGISTER = encodeURIComponent(
  '/payments/plans?autoCheckout=1&checkout_origin=register',
);

export const PRO_PRICE = 6.99;
export const PRO_COMPARE_AT = 14.99;
