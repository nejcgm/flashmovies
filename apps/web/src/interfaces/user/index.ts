export interface SubscriptionInfo {
  id: number;
  isLifetime: boolean;
  startsAt: string;
  expiresAt: string | null;
  planName: string;
}

export interface SubscriptionStatus {
  isPro: boolean;
  plan: string;
  subscription: SubscriptionInfo | null;
}

export interface UserProfile {
  id: number;
  email: string;
  displayName: string | null;
  role: string;
  subscription: SubscriptionStatus;
}
