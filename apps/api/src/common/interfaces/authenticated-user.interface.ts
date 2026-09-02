export type UserRole = 'user' | 'pro' | 'admin';

export interface AuthenticatedUser {
  id: number;
  email: string;
  displayName: string | null;
  role: UserRole;
  stripeCustomerId: string | null;
}
