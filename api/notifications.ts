// import api from "./axios";

// export const notificationAPI = {
//   // List notifications
//   getNotifications: async (params?: {
//     page?: number;
//     unread_only?: boolean;
//     type?: string;
//   }) => {
//     const res = await api.get("/notifications", { params });
//     return res.data;
//   },

//   // Get unread count
//   getUnreadCount: async () => {
//     const res = await api.get("/notifications/unread-count");
//     return res.data;
//   },

//   // Mark one as read
//   markAsRead: async (id: string | number) => {
//     const res = await api.post(`/notifications/${id}/read`);
//     return res.data;
//   },

//   // Mark all as read
//   markAllAsRead: async () => {
//     const res = await api.post("/notifications/read-all");
//     return res.data;
//   },

//   // Delete a notification
//   deleteNotification: async (id: string | number) => {
//     const res = await api.delete(`/notifications/${id}`);
//     return res.data;
//   },
// };

import api from "./axios";

export const notificationAPI = {
  getNotifications: async (params?: {
    page?: number;
    unread_only?: boolean;
    type?: string;
  }) => {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params?.page !== undefined) {
      queryParams.page = params.page;
    }

    // Only send this parameter for the Unread filter.
    if (params?.unread_only === true) {
      queryParams.unread_only = true;
    }

    if (params?.type) {
      queryParams.type = params.type;
    }

    console.log("NOTIFICATION QUERY PARAMS:", queryParams);

    const res = await api.get("/notifications", {
      params: queryParams,
    });

    console.log("NOTIFICATION REQUEST:", res.config.url);

    return res.data;
  },

  getUnreadCount: async () => {
    const res = await api.get("/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id: string | number) => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.post("/notifications/read-all");
    return res.data;
  },

  deleteNotification: async (id: string | number) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};
