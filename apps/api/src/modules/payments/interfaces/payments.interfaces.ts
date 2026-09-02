export type PlanRow = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  interval_type: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
};
