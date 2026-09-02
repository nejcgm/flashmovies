import { SubscriptionStatus, UserRow } from '../interfaces/users.interfaces';

export function mapSubscriptionStatus(status: SubscriptionStatus) {
  return status;
}

export function mapUserProfile(user: UserRow, subscription: SubscriptionStatus) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role_code,
    subscription: mapSubscriptionStatus(subscription),
  };
}

export function mapRemoveProResponse(message: string) {
  return { message };
}
