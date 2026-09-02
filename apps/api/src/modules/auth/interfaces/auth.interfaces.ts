export type AuthUserRow = {
  id: number;
  email: string;
  display_name: string | null;
  role_id: number;
  created_at: Date;
};

export type LoginUserRow = {
  id: number;
  email: string;
  password_hash: string;
  display_name: string | null;
  role_id: number;
  status_id: number;
  status_code: string;
  created_at: Date;
};
