import api from "./axios";

export const promotionAPI = {
  // Validate promo code
  validate: async (code: string, subtotal: number) => {
    const res = await api.post("/promotions/validate", {
      code,
      subtotal,
    });
    return res.data;
  },
};
