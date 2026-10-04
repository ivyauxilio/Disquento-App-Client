// src/types/cart.ts

export interface CartItem {
  product_id: number;
  name: string;
  image_url: string | null;
  unit: string;
  price: number; // original price
  discounted_price: number; // after discount
  has_discount: boolean;
  discount_label: string | null;
  quantity: number;
  stock_quantity: number;
  merchant_id: string | null;
  merchant_name: string | null;
  points_per_item: number;
}

export interface CartTotals {
  subtotal: number; // sum of (discounted_price * qty)
  savings: number; // sum of (price - discounted_price) * qty
  itemCount: number; // total quantity
  uniqueCount: number; // unique products
  points: number; // total points to earn
}
