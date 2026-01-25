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

export interface CreateOrderResponse {
  orderId: string;
  status: string;
}

export interface CaptureOrderResponse {
  status: string;
  orderId: string;
}

// Get all available plans (public endpoint)
export const getPlans = async (): Promise<Plan[]> => {
  const response = await axios.get<Plan[]>(
    `${API_BASE_URL}${API_PREFIX}/public/payments/plans`
  );
  return response.data;
};

// Create a PayPal order (requires auth)
export const createPayPalOrder = async (planCode: string): Promise<CreateOrderResponse> => {
  const response = await authAxios.post<CreateOrderResponse>(
    '/public/payments/create-order',
    { planCode }
  );
  return response.data;
};

// Capture a PayPal order (requires auth)
export const capturePayPalOrder = async (orderId: string): Promise<CaptureOrderResponse> => {
  const response = await authAxios.post<CaptureOrderResponse>(
    '/public/payments/capture-order',
    { orderId }
  );
  return response.data;
};

// Get PayPal Client ID for SDK
export const getPayPalClientId = (): string => {
  return import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
};
