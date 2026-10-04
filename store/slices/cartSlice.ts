// src/store/slices/cartSlice.ts

import { CartItem } from "@/types/cart";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ============================================
// Helpers
// ============================================

const STORAGE_KEY = "@klickcard_cart";

function calculateTotals(items: CartItem[]) {
  let subtotal = 0;
  let savings = 0;
  let itemCount = 0;
  let points = 0;

  for (const item of items) {
    subtotal += item.discounted_price * item.quantity;
    savings += (item.price - item.discounted_price) * item.quantity;
    itemCount += item.quantity;
    points += (item.points_per_item ?? 0) * item.quantity;
  }

  return {
    subtotal: round2(subtotal),
    savings: round2(savings),
    itemCount,
    uniqueCount: items.length,
    points,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ============================================
// Slice
// ============================================

interface CartState {
  items: CartItem[];
  totals: {
    subtotal: number;
    savings: number;
    itemCount: number;
    uniqueCount: number;
    points: number;
  };
  hydrated: boolean;
}

const initialState: CartState = {
  items: [],
  totals: {
    subtotal: 0,
    savings: 0,
    itemCount: 0,
    uniqueCount: 0,
    points: 0,
  },
  hydrated: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Rehydrate from storage
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload ?? [];
      state.totals = calculateTotals(state.items);
      state.hydrated = true;
    },

    // Add product (or increment qty)
    addToCart: (
      state,
      action: PayloadAction<{ product: any; quantity?: number }>,
    ) => {
      const { product, quantity = 1 } = action.payload;
      const productId = product.product_id ?? product.id;

      const existing = state.items.find((i) => i.product_id === productId);

      if (existing) {
        // Cap at stock
        const newQty = Math.min(
          existing.quantity + quantity,
          product.stock_quantity ?? existing.stock_quantity,
        );
        existing.quantity = newQty;
      } else {
        state.items.push({
          product_id: productId,
          name: product.name,
          image_url: product.image_url ?? null,
          unit: product.unit ?? "piece",
          price: Number(product.price),
          discounted_price: Number(product.discounted_price ?? product.price),
          has_discount: !!product.has_discount,
          discount_label: product.discount_label ?? null,
          quantity: Math.min(quantity, product.stock_quantity ?? quantity),
          stock_quantity: product.stock_quantity ?? 0,
          merchant_id: product.merchant?.merchant_id ?? null,
          merchant_name: product.merchant?.business_name ?? null,
          points_per_item: product.points_per_item ?? 0,
        });
      }

      state.totals = calculateTotals(state.items);
    },

    // Set exact quantity
    setQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product_id === productId);
      if (!item) return;

      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.product_id !== productId);
      } else {
        item.quantity = Math.min(quantity, item.stock_quantity);
      }

      state.totals = calculateTotals(state.items);
    },

    // Increment
    incrementQty: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.product_id === action.payload);
      if (item && item.quantity < item.stock_quantity) {
        item.quantity += 1;
        state.totals = calculateTotals(state.items);
      }
    },

    // Decrement
    decrementQty: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.product_id === action.payload);
      if (!item) return;

      if (item.quantity <= 1) {
        state.items = state.items.filter(
          (i) => i.product_id !== action.payload,
        );
      } else {
        item.quantity -= 1;
      }
      state.totals = calculateTotals(state.items);
    },

    // Remove
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.product_id !== action.payload);
      state.totals = calculateTotals(state.items);
    },

    // Clear
    clearCart: (state) => {
      state.items = [];
      state.totals = calculateTotals([]);
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  setQuantity,
  incrementQty,
  decrementQty,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

// ============================================
// Selectors
// ============================================

export const selectCartItems = (s: any): CartItem[] => s.cart.items;
export const selectCartTotals = (s: any) => s.cart.totals;
export const selectCartCount = (s: any) => s.cart.totals.itemCount;
export const selectCartSubtotal = (s: any) => s.cart.totals.subtotal;
export const selectCartHydrated = (s: any) => s.cart.hydrated;
export const selectCartItemById = (s: any, id: number) =>
  s.cart.items.find((i: CartItem) => i.product_id === id);

export default cartSlice.reducer;
