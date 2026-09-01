import type { CreateCheckoutSessionResponse } from "../interfaces/payments/index.ts";
import { authAxios } from "./auth";

export const createCheckoutSession = async (
  planCode: string
): Promise<CreateCheckoutSessionResponse> => {
  const response = await authAxios.post<CreateCheckoutSessionResponse>(
    "/public/payments/create-checkout-session",
    { planCode }
  );
  return response.data;
};
