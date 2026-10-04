// src/store/slices/orderSlice.ts

import { orderAPI, PlaceOrderPayload } from "@/api/orders";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const placeOrder = createAsyncThunk(
  "orders/place",
  async (payload: PlaceOrderPayload, { rejectWithValue }) => {
    try {
      const res = await orderAPI.place(payload);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(
        e.response?.data?.message || "Failed to place order",
      );
    }
  },
);

export const fetchOrders = createAsyncThunk(
  "orders/fetch",
  async (
    params: { page?: number; status?: string; refresh?: boolean } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await orderAPI.list(params);
      return { ...res, ...params };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load");
    }
  },
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOne",
  async (id: string | number, { rejectWithValue }) => {
    try {
      const res = await orderAPI.show(id);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load");
    }
  },
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    list: [] as any[],
    current: null as any,
    pagination: { current_page: 1, last_page: 1, total: 0 },
    filters: { status: "all" },
    loading: false,
    loadingMore: false,
    refreshing: false,
    placing: false,
    error: null as string | null,
  },
  reducers: {
    setOrderFilter: (s, a) => {
      s.filters = { ...s.filters, ...a.payload };
    },
    resetOrders: (s) => {
      s.list = [];
      s.pagination = { current_page: 1, last_page: 1, total: 0 };
    },
    clearCurrentOrder: (s) => {
      s.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place order
      .addCase(placeOrder.pending, (s) => {
        s.placing = true;
        s.error = null;
      })
      .addCase(placeOrder.fulfilled, (s, a) => {
        s.placing = false;
        s.current = a.payload.data;
      })
      .addCase(placeOrder.rejected, (s, a) => {
        s.placing = false;
        s.error = a.payload as string;
      })

      // List
      .addCase(fetchOrders.pending, (s, a) => {
        const { page, refresh } = a.meta.arg;
        if (refresh) s.refreshing = true;
        else if (page && page > 1) s.loadingMore = true;
        else s.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (s, a) => {
        s.loading = false;
        s.loadingMore = false;
        s.refreshing = false;
        const { data } = a.payload.data;
        const isFirst = (a.payload.page ?? 1) === 1;
        s.list = isFirst ? data : [...s.list, ...data];
        s.pagination = {
          current_page: a.payload.data.current_page,
          last_page: a.payload.data.last_page,
          total: a.payload.data.total,
        };
      })
      .addCase(fetchOrders.rejected, (s, a) => {
        s.loading = false;
        s.loadingMore = false;
        s.refreshing = false;
        s.error = a.payload as string;
      })

      // Show
      .addCase(fetchOrderById.fulfilled, (s, a) => {
        s.current = a.payload.data;
      });
  },
});

export const { setOrderFilter, resetOrders, clearCurrentOrder } =
  orderSlice.actions;

export const selectOrders = (s: any) => s.orders.list;
export const selectCurrentOrder = (s: any) => s.orders.current;
export const selectOrderPagination = (s: any) => s.orders.pagination;
export const selectOrderLoading = (s: any) => s.orders.loading;
export const selectOrderLoadingMore = (s: any) => s.orders.loadingMore;
export const selectOrderRefreshing = (s: any) => s.orders.refreshing;
export const selectOrderPlacing = (s: any) => s.orders.placing;

export default orderSlice.reducer;
