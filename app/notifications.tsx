// app/notifications.tsx

// import Sidebar from "@/components/Sidebar";
// import {
//   deleteNotification,
//   fetchNotifications,
//   markAllAsRead,
//   markAsRead,
// } from "@/store/slices/notificationSlice";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   FlatList,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { Swipeable } from "react-native-gesture-handler";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useDispatch, useSelector } from "react-redux";
// app/notifications.tsx

import Sidebar from "@/components/Sidebar";
import {
  deleteNotification,
  fetchNotifications,
  markAllAsRead,
  markAsRead,
  resetNotifications,
  setFilter,
} from "@/store/slices/notificationSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

// --------------------------------------------------
// Notification icon/style
// --------------------------------------------------

const getNotifStyle = (type: string) => {
  const map: Record<string, { icon: string; color: string; bg: string }> = {
    referral_reward: {
      icon: "gift",
      color: "#059669",
      bg: "#d1fae5",
    },

    referral_signup: {
      icon: "person-add",
      color: "#6C3DF5",
      bg: "#ede9fe",
    },

    referral_approved: {
      icon: "checkmark-circle",
      color: "#059669",
      bg: "#d1fae5",
    },

    withdrawal_requested: {
      icon: "arrow-up-circle",
      color: "#d97706",
      bg: "#fef3c7",
    },

    withdrawal_approved: {
      icon: "checkmark-done",
      color: "#059669",
      bg: "#d1fae5",
    },

    withdrawal_rejected: {
      icon: "close-circle",
      color: "#dc2626",
      bg: "#fee2e2",
    },

    promotion: {
      icon: "pricetag",
      color: "#6C3DF5",
      bg: "#ede9fe",
    },

    order: {
      icon: "cart",
      color: "#2563eb",
      bg: "#dbeafe",
    },

    card_activated: {
      icon: "card",
      color: "#059669",
      bg: "#d1fae5",
    },

    system: {
      icon: "information-circle",
      color: "#6b7280",
      bg: "#f3f4f6",
    },
  };

  return (
    map[type] ?? {
      icon: "notifications",
      color: "#6b7280",
      bg: "#f3f4f6",
    }
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    list: rawList,
    unreadCount,
    pagination,
    filters,
    loading,
    loadingMore,
    refreshing,
  } = useSelector((s: any) => s.notifications);

  // Always make sure FlatList receives an array.
  const list = Array.isArray(rawList) ? rawList : [];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --------------------------------------------------
  // Current filter
  // --------------------------------------------------

  const unreadOnly = Boolean(filters?.unread_only);

  // --------------------------------------------------
  // Fetch notifications
  // --------------------------------------------------

  const load = useCallback(
    (refresh = false) => {
      dispatch(
        fetchNotifications({
          page: 1,
          refresh,
          unread_only: filters?.unread_only === true,
          type: filters?.type === "all" ? undefined : filters?.type,
        }) as any,
      );
    },
    [dispatch, filters?.unread_only, filters?.type],
  );
  // Fetch whenever the filter changes.
  useEffect(() => {
    load(true);
  }, [load]);

  // --------------------------------------------------
  // Pull to refresh
  // --------------------------------------------------

  const onRefresh = useCallback(() => {
    load(true);
  }, [load]);

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  // const onEndReached = useCallback(() => {
  //   if (loadingMore || loading) return;

  //   const currentPage = Number(pagination?.current_page ?? 1);

  //   const lastPage = Number(pagination?.last_page ?? 1);

  //   if (currentPage >= lastPage) return;

  //   dispatch(
  //     fetchNotifications({
  //       page: currentPage + 1,
  //       unread_only: filters?.unread_only ?? false,
  //       type: filters?.type === "all" ? undefined : filters?.type,
  //     }) as any,
  //   );
  // }, [
  //   dispatch,
  //   filters?.unread_only,
  //   filters?.type,
  //   loading,
  //   loadingMore,
  //   pagination?.current_page,
  //   pagination?.last_page,
  // ]);

  const onEndReached = useCallback(() => {
    if (loadingMore || loading) return;

    const currentPage = Number(pagination?.current_page ?? 1);
    const lastPage = Number(pagination?.last_page ?? 1);

    if (currentPage >= lastPage) return;

    dispatch(
      fetchNotifications({
        page: currentPage + 1,
        unread_only: filters?.unread_only === true,
        type: filters?.type === "all" ? undefined : filters?.type,
      }) as any,
    );
  }, [
    dispatch,
    filters?.unread_only,
    filters?.type,
    loading,
    loadingMore,
    pagination?.current_page,
    pagination?.last_page,
  ]);
  // --------------------------------------------------
  // Filter change
  // --------------------------------------------------
  const handleFilterChange = (key: "all" | "unread") => {
    const unread_only = key === "unread";

    console.log("FILTER CHANGED:", {
      key,
      unread_only,
      type: "all",
      unreadType: typeof unread_only,
    });

    dispatch(
      setFilter({
        unread_only,
        type: "all",
      }),
    );

    dispatch(resetNotifications());
  };
  // --------------------------------------------------
  // Mark all as read
  // --------------------------------------------------

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;

    Alert.alert(
      "Mark all as read?",
      "This will clear all unread notifications.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Mark All",
          onPress: () => dispatch(markAllAsRead() as any),
        },
      ],
    );
  };

  // --------------------------------------------------
  // Delete notification
  // --------------------------------------------------

  const handleDelete = (id: string | number) => {
    dispatch(deleteNotification(id) as any);
  };

  // --------------------------------------------------
  // Notification press
  // --------------------------------------------------

  const handlePress = (item: any) => {
    // Mark as read first.
    if (!item.read_at) {
      dispatch(markAsRead(item.id) as any);
    }

    const data =
      typeof item.data === "object" && item.data !== null ? item.data : {};

    switch (item.type) {
      case "referral_reward":
      case "referral_signup":
      case "referral_approved":
        router.push("/referrals");
        break;

      case "withdrawal_approved":
      case "withdrawal_rejected":
      case "withdrawal_requested":
        router.push("/wallet/transactions");
        break;

      case "promotion":
        if (data.promotion_id) {
          router.push(`/promotion/${data.promotion_id}`);
        }
        break;

      case "card_activated":
        router.push("/cards/details");
        break;

      case "order":
        if (data.order_id) {
          // Uncomment when your orders route exists.
          // router.push(`/orders/${data.order_id}`);
        }
        break;

      default:
        break;
    }
  };

  // --------------------------------------------------
  // Format time
  // --------------------------------------------------

  const formatTime = (date?: string) => {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    const now = new Date();

    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diff < 60) {
      return "Just now";
    }

    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    }

    if (diff < 604800) {
      return `${Math.floor(diff / 86400)}d ago`;
    }

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // --------------------------------------------------
  // Swipe delete
  // --------------------------------------------------

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: any,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(item.id)}
      >
        <Animated.View
          style={{
            transform: [{ scale }],
          }}
        >
          <Ionicons name="trash" size={22} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // --------------------------------------------------
  // Notification item
  // --------------------------------------------------

  const renderItem = ({ item }: { item: any }) => {
    const ns = getNotifStyle(item?.type);

    const isUnread = !item?.read_at;

    return (
      <Swipeable
        renderRightActions={(p, d) => renderRightActions(p, d, item)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={[styles.notifRow, isUnread && styles.notifRowUnread]}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
        >
          {/* Icon */}
          <View
            style={[
              styles.notifIcon,
              {
                backgroundColor: ns.bg,
              },
            ]}
          >
            <Ionicons name={ns.icon as any} size={22} color={ns.color} />
          </View>

          {/* Content */}
          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <View style={styles.notifTop}>
              <Text
                style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}
                numberOfLines={1}
              >
                {item?.title || "Notification"}
              </Text>

              {isUnread && <View style={styles.unreadDot} />}
            </View>

            <Text style={styles.notifBody} numberOfLines={2}>
              {item?.body || item?.message || ""}
            </Text>

            <Text style={styles.notifTime}>{formatTime(item?.created_at)}</Text>
          </View>

          <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // --------------------------------------------------
  // Empty state
  // --------------------------------------------------

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.empty}>
        <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />

        <Text style={styles.emptyText}>
          {unreadOnly ? "No unread notifications" : "No notifications yet"}
        </Text>

        <Text style={styles.emptySubtext}>
          {unreadOnly
            ? "You're all caught up!"
            : "You'll see updates about your rewards, referrals, and orders here"}
        </Text>
      </View>
    );
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="inverted" backgroundColor="#6C3DF5" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>

            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <Ionicons
              name="checkmark-done"
              size={22}
              color={unreadCount === 0 ? "#d1d5db" : "#6C3DF5"}
            />
          </TouchableOpacity>
        </View>

        {/* All / Unread tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, !unreadOnly && styles.tabActive]}
            onPress={() => handleFilterChange("all")}
          >
            <Ionicons
              name="notifications-outline"
              size={15}
              color={!unreadOnly ? "#6C3DF5" : "#6b7280"}
            />

            <Text style={[styles.tabText, !unreadOnly && styles.tabTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, unreadOnly && styles.tabActive]}
            onPress={() => handleFilterChange("unread")}
          >
            <Ionicons
              name="mail-unread-outline"
              size={15}
              color={unreadOnly ? "#6C3DF5" : "#6b7280"}
            />

            <Text style={[styles.tabText, unreadOnly && styles.tabTextActive]}>
              Unread
              {unreadCount > 0 ? ` (${unreadCount})` : ""}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading && list.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color="#6C3DF5" size="large" />

            <Text style={styles.loadingText}>
              {unreadOnly
                ? "Loading unread notifications..."
                : "Loading notifications..."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 40,
              flexGrow: list.length === 0 ? 1 : 0,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6C3DF5"
              />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loadingMore ? (
                <View
                  style={{
                    paddingVertical: 20,
                  }}
                >
                  <ActivityIndicator color="#6C3DF5" />
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

// --------------------------------------------------
// Styles
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#6b7280",
    marginTop: 10,
    fontSize: 13,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  badge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 22,
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
  },

  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },

  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  tabText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#6C3DF5",
    fontWeight: "700",
  },

  // Notification row
  notifRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },

  notifRowUnread: {
    backgroundColor: "#faf5ff",
    borderColor: "#e9d5ff",
  },

  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  notifTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },

  notifTitleUnread: {
    fontWeight: "800",
    color: "#111827",
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C3DF5",
  },

  notifBody: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 17,
    marginTop: 3,
  },

  notifTime: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 4,
  },

  // Swipe delete
  deleteAction: {
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginLeft: 8,
    borderRadius: 14,
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },

  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6b7280",
    marginTop: 12,
  },

  emptySubtext: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
  },
});
