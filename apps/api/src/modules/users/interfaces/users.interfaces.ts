export type UserRow = {
  id: number;
  email: string;
  display_name: string | null;
  role_id: number;
  stripe_customer_id: string | null;
  created_at: Date;
  role_code: string;
  role_name: string;
};

export type ActiveSubscriptionRow = {
  id: number;
  is_lifetime: boolean;
  starts_at: Date;
  expires_at: Date | null;
  plan_code: string;
  plan_name: string;
  status_code: string;
};

export type SubscriptionStatus = {
  isPro: boolean;
  plan: string;
  subscription: {
    id: number;
    isLifetime: boolean;
    startsAt: Date;
    expiresAt: Date | null;
    planName: string;
  } | null;
};
