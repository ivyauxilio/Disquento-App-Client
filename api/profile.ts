// src/api/profile.ts

import api from "./axios";

export const profileAPI = {
  // Get profile with all stats
  me: async () => {
    const res = await api.get("/profile");
    return res.data;
  },

  // Update profile
  update: async (payload: {
    firstname?: string;
    lastname?: string;
    phone?: string;
    birthdate?: string;
    gender?: "male" | "female" | "other";
    avatar_url?: string;
  }) => {
    const res = await api.put("/profile", payload);
    return res.data;
  },

  // Change password
  changePassword: async (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => {
    const res = await api.post("/profile/change-password", payload);
    return res.data;
  },

  // Upload avatar (multipart)
  uploadAvatar: async (formData: FormData) => {
    const res = await api.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Addresses
  addresses: async () => {
    const res = await api.get("/profile/addresses");
    return res.data;
  },

  addAddress: async (payload: any) => {
    const res = await api.post("/profile/addresses", payload);
    return res.data;
  },

  updateAddress: async (id: string | number, payload: any) => {
    const res = await api.put(`/profile/addresses/${id}`, payload);
    return res.data;
  },

  deleteAddress: async (id: string | number) => {
    const res = await api.delete(`/profile/addresses/${id}`);
    return res.data;
  },

  setDefaultAddress: async (id: string | number) => {
    const res = await api.post(`/profile/addresses/${id}/default`);
    return res.data;
  },

  // Deactivate account
  deactivate: async () => {
    const res = await api.post("/profile/deactivate");
    return res.data;
  },

  // Delete account
  deleteAccount: async (password: string) => {
    const res = await api.post("/profile/delete-account", { password });
    return res.data;
  },
};
