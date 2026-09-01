import type {
  SubscriptionStatus,
  UserProfile,
} from "../interfaces/user/index.ts";
import { authAxios } from "./auth";

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await authAxios.get<UserProfile>("/public/users/me");
  return response.data;
};

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  const response = await authAxios.get<SubscriptionStatus>(
    "/public/users/subscription"
  );
  return response.data;
};

export const removeProStatus = async (): Promise<{ message: string }> => {
  const response = await authAxios.post<{ message: string }>(
    "/public/users/remove-pro"
  );
  return response.data;
};
