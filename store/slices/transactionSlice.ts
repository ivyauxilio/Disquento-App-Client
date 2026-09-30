// src/store/slices/transactionSlice.ts

import { walletAPI } from "@/api/wallet";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchTransactions = createAsyncThunk(
  "transactions/fetch",
  async (
    params: {
      page?: number;
      type?: string;
      status?: string;
      refresh?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await walletAPI.getTransactions(params);
      return { ...res.data, page: params.page ?? 1, refresh: !!params.refresh };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load");
    }
  },
);

export const fetchWallet = createAsyncThunk(
  "transactions/fetchWallet",
  async (_, { rejectWithValue }) => {
    try {
      const res = await walletAPI.getWallet();
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load");
    }
  },
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState: {
    list: [] as any[],
    wallet: null as any,
    pagination: { current_page: 1, last_page: 1, total: 0 },
    filters: { type: "all", status: "all" },
    loading: false,
    loadingMore: false,
    refreshing: false,
    error: null as string | null,
  },
  reducers: {
    setFilter: (s, a) => {
      s.filters = { ...s.filters, ...a.payload };
    },
    resetTransactions: (s) => {
      s.list = [];
      s.pagination = { current_page: 1, last_page: 1, total: 0 };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (s, a) => {
        const { page, refresh } = a.meta.arg;
        if (refresh) s.refreshing = true;
        else if (page && page > 1) s.loadingMore = true;
        else s.loading = true;
        s.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (s, a) => {
        s.loading = false;
        s.loadingMore = false;
        s.refreshing = false;

        const { data, current_page, last_page, total } = a.payload;

        const isFirstPage = current_page === 1;

        s.list = isFirstPage ? data : [...s.list, ...data];

        s.pagination = {
          current_page,
          last_page,
          total: total ?? s.list.length,
        };
      })
      .addCase(fetchTransactions.rejected, (s, a) => {
        s.loading = false;
        s.loadingMore = false;
        s.refreshing = false;
        s.error = a.payload as string;
      })
      .addCase(fetchWallet.fulfilled, (s, a) => {
        s.wallet = a.payload.data;
      });
  },
});

export const { setFilter, resetTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;
