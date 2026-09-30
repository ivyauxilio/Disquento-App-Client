import { notificationAPI } from "@/api/notifications";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// ======================================================
// FETCH NOTIFICATIONS
// ======================================================

type NotificationFilters = {
  unread_only: boolean;
  type: string;
};
type NotificationState = {
  list: any[];
  unreadCount: number;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: NotificationFilters;
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
};

// export const fetchNotifications = createAsyncThunk(
//   "notifications/fetch",
//   async (
//     params: {
//       page?: number;
//       refresh?: boolean;
//       unread_only?: boolean;
//       type?: string;
//     } = {},
//     { rejectWithValue },
//   ) => {
//     try {
//       const page = params.page ?? 1;

//       console.log("PARAMS", params);

//       const res = await notificationAPI.getNotifications({
//         page,
//         unread_only: params.unread_only,
//         type: params.type,
//       });

//       const response = res.data;

//       const paginationData =
//         response?.data && !Array.isArray(response.data)
//           ? response.data
//           : response;

//       const notifications = Array.isArray(paginationData?.data)
//         ? paginationData.data
//         : Array.isArray(response?.data)
//           ? response.data
//           : [];

//       return {
//         data: notifications,

//         current_page: Number(
//           paginationData?.current_page ?? response?.current_page ?? page,
//         ),

//         last_page: Number(
//           paginationData?.last_page ?? response?.last_page ?? 1,
//         ),

//         total: Number(
//           paginationData?.total ?? response?.total ?? notifications.length,
//         ),

//         page,

//         refresh: !!params.refresh,
//       };
//     } catch (e: any) {
//       return rejectWithValue(
//         e?.response?.data?.message || "Failed to load notifications",
//       );
//     }
//   },
// );

// ======================================================
// FETCH UNREAD COUNT
// ======================================================
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (
    params: {
      page?: number;
      refresh?: boolean;
      unread_only?: boolean;
      type?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const page = params.page ?? 1;

      // ALWAYS send a real boolean
      const unreadOnly = params.unread_only === true;

      const res = await notificationAPI.getNotifications({
        page,
        unread_only: unreadOnly,
        type: params.type,
      });

      const response = res.data;

      const paginationData =
        response?.data && !Array.isArray(response.data)
          ? response.data
          : response;

      const notifications = Array.isArray(paginationData?.data)
        ? paginationData.data
        : Array.isArray(response?.data)
          ? response.data
          : [];

      return {
        data: notifications,

        current_page: Number(
          paginationData?.current_page ?? response?.current_page ?? page,
        ),

        last_page: Number(
          paginationData?.last_page ?? response?.last_page ?? 1,
        ),

        total: Number(
          paginationData?.total ?? response?.total ?? notifications.length,
        ),

        page,
        refresh: !!params.refresh,
      };
    } catch (e: any) {
      console.log("FETCH NOTIFICATIONS ERROR:", e?.response?.data ?? e);

      return rejectWithValue(
        e?.response?.data?.message || "Failed to load notifications",
      );
    }
  },
);
export const fetchUnreadCount = createAsyncThunk(
  "notifications/unreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationAPI.getUnreadCount();

      return res.data;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || "Failed to load unread count",
      );
    }
  },
);

// ======================================================
// MARK AS READ
// ======================================================

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: string | number, { rejectWithValue }) => {
    try {
      await notificationAPI.markAsRead(id);

      return id;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || "Failed to mark notification as read",
      );
    }
  },
);

// ======================================================
// MARK ALL AS READ
// ======================================================

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationAPI.markAllAsRead();

      return true;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || "Failed to mark notifications as read",
      );
    }
  },
);

// ======================================================
// DELETE NOTIFICATION
// ======================================================

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id: string | number, { rejectWithValue }) => {
    try {
      await notificationAPI.deleteNotification(id);

      return id;
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message || "Failed to delete notification",
      );
    }
  },
);

// ======================================================
// SLICE
// ======================================================

const notificationSlice = createSlice({
  name: "notifications",

  initialState: {
    // Notifications
    list: [] as any[],

    // Unread count
    unreadCount: 0,

    // Filters
    filters: {
      unread_only: false,
      type: "all",
    },

    // Pagination
    pagination: {
      current_page: 1,
      last_page: 1,
      total: 0,
    },

    // Loading states
    loading: false,
    loadingMore: false,
    refreshing: false,

    // Error
    error: null as string | null,
  },

  reducers: {
    // --------------------------------------------------
    // Increment unread count
    // --------------------------------------------------

    incrementUnread: (state) => {
      state.unreadCount += 1;
    },

    // --------------------------------------------------
    // Set notification filters
    // --------------------------------------------------

    // setFilter: (
    //   state,
    //   action: {
    //     payload: {
    //       unread_only?: boolean;
    //       type?: string;
    //     };
    //   },
    // ) => {
    //   state.filters = {
    //     ...state.filters,
    //     ...action.payload,
    //   };
    // },

    setFilter: (
      state,
      action: {
        payload: {
          unread_only?: boolean;
          type?: string;
        };
      },
    ) => {
      if (action.payload.unread_only !== undefined) {
        state.filters.unread_only = action.payload.unread_only === true;
      }

      if (action.payload.type !== undefined) {
        state.filters.type = action.payload.type;
      }
    },

    // --------------------------------------------------
    // Reset notifications
    // --------------------------------------------------

    resetNotifications: (state) => {
      state.list = [];

      state.pagination = {
        current_page: 1,
        last_page: 1,
        total: 0,
      };

      state.loading = false;
      state.loadingMore = false;
      state.refreshing = false;
      state.error = null;
    },

    // --------------------------------------------------
    // Clear everything
    // --------------------------------------------------

    clearNotifications: (state) => {
      state.list = [];

      state.unreadCount = 0;

      state.pagination = {
        current_page: 1,
        last_page: 1,
        total: 0,
      };

      state.filters = {
        unread_only: false,
        type: "all",
      };

      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==================================================
      // FETCH NOTIFICATIONS - PENDING
      // ==================================================

      .addCase(fetchNotifications.pending, (state, action) => {
        const page = action.meta.arg?.page ?? 1;

        const refresh = action.meta.arg?.refresh ?? false;

        if (refresh) {
          state.refreshing = true;
        } else if (page > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }

        state.error = null;
      })

      // ==================================================
      // FETCH NOTIFICATIONS - SUCCESS
      // ==================================================

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.refreshing = false;

        /*
         * IMPORTANT:
         *
         * The thunk already normalized the API response.
         *
         * action.payload.data is now ALWAYS supposed
         * to be an array.
         */

        const notifications = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];

        const currentPage = Number(action.payload?.current_page ?? 1);

        const lastPage = Number(action.payload?.last_page ?? 1);

        const total = Number(action.payload?.total ?? notifications.length);

        // ----------------------------------------------
        // First page / refresh
        // ----------------------------------------------

        if (currentPage === 1) {
          state.list = notifications;
        }

        // ----------------------------------------------
        // Load more
        // ----------------------------------------------
        else {
          const existingList = Array.isArray(state.list) ? state.list : [];

          const merged = [...existingList, ...notifications];

          /*
           * Remove duplicate notifications.
           */

          state.list = Array.from(
            new Map(
              merged.map((notification) => [
                String(notification?.id),
                notification,
              ]),
            ).values(),
          );
        }

        // ----------------------------------------------
        // Update pagination
        // ----------------------------------------------

        state.pagination = {
          current_page: currentPage,
          last_page: lastPage,
          total,
        };
      })

      // ==================================================
      // FETCH NOTIFICATIONS - ERROR
      // ==================================================

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.refreshing = false;

        state.error =
          (action.payload as string) ||
          action.error?.message ||
          "Failed to load notifications";
      })

      // ==================================================
      // UNREAD COUNT
      // ==================================================

      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount =
          action.payload?.data?.count ?? action.payload?.count ?? 0;
      })

      // ==================================================
      // MARK AS READ
      // ==================================================

      .addCase(markAsRead.fulfilled, (state, action) => {
        const id = action.payload;

        const item = state.list.find((notification) => notification.id === id);

        if (item && !item.read_at) {
          item.read_at = new Date().toISOString();

          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // ==================================================
      // MARK ALL AS READ
      // ==================================================

      .addCase(markAllAsRead.fulfilled, (state) => {
        const readAt = new Date().toISOString();

        state.list = state.list.map((notification) => ({
          ...notification,
          read_at: notification.read_at || readAt,
        }));

        state.unreadCount = 0;
      })

      // ==================================================
      // DELETE NOTIFICATION
      // ==================================================

      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;

        const item = state.list.find((notification) => notification.id === id);

        if (item && !item.read_at) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.list = state.list.filter(
          (notification) => notification.id !== id,
        );
      });
  },
});

// ======================================================
// ACTIONS
// ======================================================

export const {
  incrementUnread,
  setFilter,
  resetNotifications,
  clearNotifications,
} = notificationSlice.actions;

// ======================================================
// REDUCER
// ======================================================

export default notificationSlice.reducer;
