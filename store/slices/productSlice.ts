// src/store/slices/productSlice.ts

import { productAPI } from "@/api/products";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// ============================================
// THUNKS
// ============================================

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (
    params: {
      page?: number;
      per_page?: number;
      category?: string;
      search?: string;
      featured?: boolean;
      sort?:
        | "price_asc"
        | "price_desc"
        | "name_asc"
        | "name_desc"
        | "newest"
        | "popular";
      refresh?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { refresh, ...apiParams } = params;

      const res = await productAPI.list(apiParams);

      console.log("PRODUCT RESPONSE:", JSON.stringify(res, null, 2));

      return {
        ...res,
        page: params.page ?? 1,
        refresh: !!refresh,
      };
    } catch (e: any) {
      // console.log("========== PRODUCT API ERROR ==========");
      // console.log("STATUS:", e.response?.status);
      console.log("DATA:", JSON.stringify(e.response?.data, null, 2));
      // console.log("URL:", e.config?.url);
      // console.log("PARAMS:", e.config?.params);
      // console.log("MESSAGE:", e.message);
      // console.log("=======================================");

      return rejectWithValue(
        e.response?.data?.message || "Failed to load products",
      );
    }
  },
);

export const fetchCategories = createAsyncThunk(
  "products/categories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productAPI.categories();
      return res.data;
    } catch (e: any) {
      return rejectWithValue("Failed");
    }
  },
);

// ============================================
// SLICE
// ============================================

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: [] as any[],
    featured: [] as any[],
    categories: [] as string[],
    pagination: { current_page: 1, last_page: 1, total: 0 },
    filters: {
      category: "all",
      search: "",
      sort: "newest",
    },
    loading: false,
    loadingMore: false,
    refreshing: false,
    error: null as string | null,
  },
  reducers: {
    setProductFilter: (s, a) => {
      s.filters = { ...s.filters, ...a.payload };
    },
    resetProducts: (s) => {
      s.list = [];
      s.pagination = { current_page: 1, last_page: 1, total: 0 };
    },
    // For featured section
    setFeatured: (s, a) => {
      s.featured = a.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s, a) => {
        const { page, refresh } = a.meta.arg;
        if (refresh) s.refreshing = true;
        else if (page && page > 1) s.loadingMore = true;
        else s.loading = true;
        s.error = null;
      })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false;
        s.loadingMore = false;
        s.refreshing = false;

        const response = a.payload?.data;

        const data = Array.isArray(response?.data) ? response.data : [];

        const currentPage = response?.current_page ?? 1;
        const lastPage = response?.last_page ?? 1;
        const total = response?.total ?? data.length;

        const isFirst = (a.payload.page ?? 1) === 1;

        if (isFirst) {
          s.list = data;
        } else {
          s.list = [...s.list, ...data];
        }

        s.pagination = {
          current_page: currentPage,
          last_page: lastPage,
          total,
        };

        if (a.meta.arg.featured) {
          s.featured = data;
        }
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        s.loading = false;
        s.loadingMore = false;
        s.refreshing = false;
        s.error = a.payload as string;
      })
      .addCase(fetchCategories.fulfilled, (s, a) => {
        s.categories = a.payload.data ?? a.payload;
      });
  },
});

export const { setProductFilter, resetProducts, setFeatured } =
  productSlice.actions;
export default productSlice.reducer;
