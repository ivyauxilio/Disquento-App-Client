import api from "./axios";

export interface PlaceOrderPayload {
  items: Array<{ product_id: number; quantity: number }>;
  delivery_address: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    zip?: string;
    landmark?: string;
  };
  delivery_contact_name: string;
  delivery_contact_phone: string;
  delivery_instructions?: string;
  delivery_type: "delivery" | "pickup";
  pickup_time?: string;
  payment_method: "cash" | "gcash" | "maya" | "card";
  promo_code?: string;
  use_points?: boolean;
  notes?: string;
}

export const orderAPI = {
  // Place order
  place: async (payload: PlaceOrderPayload) => {
    const res = await api.post("/orders", payload);
    return res.data;
  },

  // List my orders
  list: async (params?: { page?: number; status?: string }) => {
    const res = await api.get("/orders", { params });
    return res.data;
  },

  // Show single order
  show: async (id: string | number) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  // Cancel order
  cancel: async (id: string | number, reason: string) => {
    const res = await api.post(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  // Validate promo code
  validatePromo: async (code: string, subtotal: number) => {
    const res = await api.post("/promotions/validate", {
      code,
      subtotal,
    });
    return res.data;
  },
};
