// app/orders/index.tsx

import {
  fetchOrders,
  resetOrders,
  selectOrderLoading,
  selectOrderLoadingMore,
  selectOrderPagination,
  selectOrderRefreshing,
  selectOrders,
  setOrderFilter,
} from "@/store/slices/orderSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const filters = [
  { key: "all", label: "All", icon: "list-outline" },
  { key: "pending", label: "Pending", icon: "time-outline" },
  { key: "preparing", label: "Preparing", icon: "restaurant-outline" },
  { key: "out_for_delivery", label: "On the way", icon: "bicycle-outline" },
  { key: "completed", label: "Completed", icon: "checkmark-done-outline" },
  { key: "cancelled", label: "Cancelled", icon: "close-circle-outline" },
];

const statusMeta: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7", icon: "time" },
  confirmed: {
    label: "Confirmed",
    color: "#2563eb",
    bg: "#dbeafe",
    icon: "checkmark-circle",
  },
  preparing: {
    label: "Preparing",
    color: "#6C3DF5",
    bg: "#ede9fe",
    icon: "restaurant",
  },
  ready: { label: "Ready", color: "#059669", bg: "#d1fae5", icon: "bag-check" },
  out_for_delivery: {
    label: "On the way",
    color: "#0891b2",
    bg: "#cffafe",
    icon: "bicycle",
  },
  completed: {
    label: "Completed",
    color: "#059669",
    bg: "#d1fae5",
    icon: "checkmark-done",
  },
  cancelled: {
    label: "Cancelled",
    color: "#dc2626",
    bg: "#fee2e2",
    icon: "close-circle",
  },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export default function OrdersScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const orders = useSelector(selectOrders);
  const pagination = useSelector(selectOrderPagination);
  const loading = useSelector(selectOrderLoading);
  const loadingMore = useSelector(selectOrderLoadingMore);
  const refreshing = useSelector(selectOrderRefreshing);
  const activeFilters = useSelector((s: any) => s.orders.filters);

  const load = useCallback(
    (refresh = false) => {
      dispatch(
        fetchOrders({
          page: 1,
          status:
            activeFilters.status === "all" ? undefined : activeFilters.status,
          refresh,
        } as any) as any,
      );
    },
    [dispatch, activeFilters.status],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const onRefresh = () => load(true);

  const onEndReached = () => {
    if (loadingMore || loading) return;
    if (pagination.current_page < pagination.last_page) {
      dispatch(
        fetchOrders({
          page: pagination.current_page + 1,
          status:
            activeFilters.status === "all" ? undefined : activeFilters.status,
        } as any) as any,
      );
    }
  };

  const handleFilterPress = (key: string) => {
    dispatch(setOrderFilter({ status: key }));
    dispatch(resetOrders());
  };

  const renderOrder = ({ item }: { item: any }) => {
    const status = statusMeta[item.status] ?? statusMeta.pending;
    const itemCount = item.items?.length ?? 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        // onPress={() => router.push(`/orders/${item.order_id}`)}
        activeOpacity={0.85}
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderNumber}>#{item.order_number}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <Ionicons
              name={status.icon as any}
              size={12}
              color={status.color}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Items preview */}
        <View style={styles.itemsPreview}>
          {item.items?.slice(0, 3).map((orderItem: any, idx: number) => (
            <View key={idx} style={styles.previewThumb}>
              {orderItem.product?.image_url ? (
                <Image
                  source={{ uri: orderItem.product.image_url }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={[styles.previewImage, styles.previewPlaceholder]}>
                  <Ionicons name="image-outline" size={16} color="#c4b5fd" />
                </View>
              )}
            </View>
          ))}

          {itemCount > 3 && (
            <View style={[styles.previewThumb, styles.moreThumb]}>
              <Text style={styles.moreText}>+{itemCount - 3}</Text>
            </View>
          )}

          <View style={{ flex: 1 }} />

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₱{Number(item.total_amount).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.orderFooter}>
          <Text style={styles.itemCountText}>
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity
            style={styles.viewBtn}
            // onPress={() => router.push(`/orders/${item.order_id}`)}
          >
            <Text style={styles.viewBtnText}>
              {item.status === "completed" ? "View Details" : "Track Order"}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#6C3DF5" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="receipt-outline" size={64} color="#c4b5fd" />
        </View>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtext}>
          {activeFilters.status !== "all"
            ? "No orders match this filter."
            : "Your order history will appear here."}
        </Text>
        {activeFilters.status === "all" && (
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.replace("/(tabs)/products")}
          >
            <Ionicons name="basket-outline" size={18} color="#fff" />
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="inverted" backgroundColor="#6C3DF5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/(tabs)/products")}
        >
          <Ionicons name="basket-outline" size={20} color="#6C3DF5" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={{ marginBottom: 14 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {filters.map((f) => {
            const active = activeFilters.status === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => handleFilterPress(f.key)}
              >
                <Ionicons
                  name={f.icon as any}
                  size={13}
                  color={active ? "#fff" : "#6b7280"}
                />
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {loading && orders.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color="#6C3DF5" size="large" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.order_id)}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator color="#6C3DF5" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#6b7280", marginTop: 10, fontSize: 13 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipActive: { backgroundColor: "#6C3DF5", borderColor: "#6C3DF5" },
  filterText: { fontSize: 13, color: "#6b7280", fontWeight: "600" },
  filterTextActive: { color: "#fff" },

  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: { fontSize: 14, fontWeight: "800", color: "#111827" },
  orderDate: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: "700" },

  itemsPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  previewThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  previewImage: { width: "100%", height: "100%" },
  previewPlaceholder: { alignItems: "center", justifyContent: "center" },
  moreThumb: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f0ff",
  },
  moreText: { fontSize: 12, fontWeight: "800", color: "#6C3DF5" },
  totalLabel: { fontSize: 10, color: "#9ca3af" },
  totalValue: { fontSize: 16, fontWeight: "800", color: "#6C3DF5" },

  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  itemCountText: { fontSize: 12, color: "#6b7280" },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewBtnText: { fontSize: 13, fontWeight: "700", color: "#6C3DF5" },

  empty: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f3f0ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  emptySubtext: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 19,
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#6C3DF5",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
