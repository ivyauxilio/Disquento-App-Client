// src/store/slices/profileSlice.ts

import { profileAPI } from "@/api/profile";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await profileAPI.me();
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to load");
    }
  },
);

export const updateProfile = createAsyncThunk(
  "profile/update",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await profileAPI.update(payload);
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to update");
    }
  },
);

export const fetchAddresses = createAsyncThunk(
  "profile/addresses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await profileAPI.addresses();
      return res.data;
    } catch (e: any) {
      return rejectWithValue("Failed to load addresses");
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null as any,
    addresses: [] as any[],
    loading: false,
    updating: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(updateProfile.pending, (s) => {
        s.updating = true;
      })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.updating = false;
        s.data = { ...s.data, ...a.payload };
      })
      .addCase(updateProfile.rejected, (s) => {
        s.updating = false;
      })
      .addCase(fetchAddresses.fulfilled, (s, a) => {
        s.addresses = a.payload;
      });
  },
});

export const selectProfile = (s: any) => s.profile.data;
export const selectProfileLoading = (s: any) => s.profile.loading;
export const selectProfileUpdating = (s: any) => s.profile.updating;
export const selectAddresses = (s: any) => s.profile.addresses;

export default profileSlice.reducer;
