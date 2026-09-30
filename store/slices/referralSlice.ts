import { referralAPI } from "@/api/referrals";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ReferralState {
  stats: any | null;
  list: any[];
  pagination: {
    current_page: number;
    last_page: number;
  };
  loading: boolean;
  loadingList: boolean;
  error: string | null;
}

const initialState: ReferralState = {
  stats: null,
  list: [],
  pagination: {
    current_page: 1,
    last_page: 1,
  },
  loading: false,
  loadingList: false,
  error: null,
};

export const fetchMyReferrals = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("referrals/fetchMe", async (_, { rejectWithValue }) => {
  try {
    return await referralAPI.getMyReferrals();
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || "Failed to load");
  }
});

export const fetchReferralList = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>("referrals/fetchList", async (page = 1, { rejectWithValue }) => {
  try {
    return await referralAPI.getReferralList(page);
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || "Failed to load");
  }
});

const referralSlice = createSlice({
  name: "referrals",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReferrals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyReferrals.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })

      .addCase(fetchMyReferrals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load referrals";
      })

      .addCase(fetchReferralList.pending, (state) => {
        state.loadingList = true;
      })

      .addCase(fetchReferralList.fulfilled, (state, action) => {
        state.loadingList = false;

        const payload = action.payload.data;

        state.list = payload.data ?? payload;

        state.pagination = {
          current_page: payload.current_page ?? 1,
          last_page: payload.last_page ?? 1,
        };
      })

      .addCase(fetchReferralList.rejected, (state) => {
        state.loadingList = false;
      });
  },
});

export default referralSlice.reducer;
