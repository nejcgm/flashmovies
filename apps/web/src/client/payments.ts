import { authAxios } from './auth';

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// Create a Stripe checkout session (requires auth)
export const createCheckoutSession = async (planCode: string): Promise<CreateCheckoutSessionResponse> => {
  const response = await authAxios.post<CreateCheckoutSessionResponse>(
    '/public/payments/create-checkout-session',
    { planCode }
  );
  return response.data;
};
