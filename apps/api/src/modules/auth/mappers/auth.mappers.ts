import { AuthUserRow } from '../interfaces/auth.interfaces';

export function mapAuthUser(user: AuthUserRow) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
  };
}

export function mapAuthResponse(user: AuthUserRow, accessToken: string) {
  return {
    user: mapAuthUser(user),
    accessToken,
  };
}

export function mapLogoutResponse(message: string) {
  return { message };
}
