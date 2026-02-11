import axios from 'axios';
import { authAxios } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_PREFIX = '/api/v1';

export interface Plan {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string | null;
  isLifetime: boolean;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// Get all available plans (public endpoint)
export const getPlans = async (): Promise<Plan[]> => {
  const response = await axios.get<Plan[]>(
    `${API_BASE_URL}${API_PREFIX}/public/payments/plans`
  );
  return response.data;
};

// Create a Stripe checkout session (requires auth)
export const createCheckoutSession = async (planCode: string): Promise<CreateCheckoutSessionResponse> => {
  const response = await authAxios.post<CreateCheckoutSessionResponse>(
    '/public/payments/create-checkout-session',
    { planCode }
  );
  return response.data;
};
