import { authAxios } from './auth';

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

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await authAxios.get<UserProfile>('/public/users/me');
  return response.data;
};

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  const response = await authAxios.get<SubscriptionStatus>('/public/users/subscription');
  return response.data;
};

/**
 * TEST ONLY: Remove pro status from current user
 */
export const removeProStatus = async (): Promise<{ message: string }> => {
  const response = await authAxios.post<{ message: string }>('/public/users/remove-pro');
  return response.data;
};
