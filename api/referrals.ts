import api from "./axios";

export const referralAPI = {
  // Get referral dashboard data
  getMyReferrals: async () => {
    const res = await api.get("/referrals/me");
    return res.data;
  },

  // Get list of people you referred
  getReferralList: async (page = 1) => {
    const res = await api.get("/referrals/list", { params: { page } });
    return res.data;
  },

  // Get wallet
  getWallet: async () => {
    const res = await api.get("/wallet");
    return res.data;
  },

  // Get wallet transactions
  getWalletTransactions: async (page = 1) => {
    const res = await api.get("/wallet/transactions", { params: { page } });
    return res.data;
  },
};
