import { authAxios } from './auth';

export interface Subscription {
  isActive: boolean;
  planCode: string | null;
  planName: string | null;
  isLifetime: boolean;
  expiresAt: string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  displayName: string | null;
  role: string;
  subscription: Subscription | null;
}

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await authAxios.get<UserProfile>('/public/users/me');
  return response.data;
};

export const getSubscriptionStatus = async (): Promise<Subscription | null> => {
  const response = await authAxios.get<Subscription | null>('/public/users/subscription');
  return response.data;
};
