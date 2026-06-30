export interface WishlistItem {
  id: string;
  user_id: string;
  name: string;
  qty: number;
  price: number;
  target_date: string | null;
  description: string | null;
  is_purchased: boolean;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}
