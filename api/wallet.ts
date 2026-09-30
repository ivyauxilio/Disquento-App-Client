import api from "./axios";

export const walletAPI = {
  // Get wallet info
  getWallet: async () => {
    const res = await api.get("/wallet");
    return res.data;
  },

  // Get transactions with filters
  getTransactions: async (params?: {
    page?: number;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
  }) => {
    const res = await api.get("/wallet/transactions", { params });
    return res.data;
  },

  // Request withdrawal
  requestWithdrawal: async (data: {
    amount: number;
    payment_method: string;
    account_number: string;
    account_name: string;
  }) => {
    const res = await api.post("/wallet/withdraw", data);
    return res.data;
  },
};
