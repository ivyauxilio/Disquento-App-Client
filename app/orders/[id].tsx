// app/orders/[id].tsx

import { fetchOrderById, selectCurrentOrder } from "@/store/slices/orderSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const statusMeta: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  pending: { label: "Pending", color: "#d97706", icon: "time-outline" },
  confirmed: {
    label: "Confirmed",
    color: "#2563eb",
    icon: "checkmark-circle-outline",
  },
  preparing: {
    label: "Preparing",
    color: "#6C3DF5",
    icon: "restaurant-outline",
  },
  ready: { label: "Ready", color: "#059669", icon: "bag-check-outline" },
  out_for_delivery: {
    label: "On the way",
    color: "#0891b2",
    icon: "bicycle-outline",
  },
  completed: { label: "Completed", color: "#059669", icon: "checkmark-done" },
  cancelled: { label: "Cancelled", color: "#dc2626", icon: "close-circle" },
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id, justPlaced } = useLocalSearchParams<{
    id: string;
    justPlaced?: string;
  }>();
  const dispatch = useDispatch();
  const order = useSelector(selectCurrentOrder);

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id) as any);
  }, [id, dispatch]);

  useEffect(() => {
    if (justPlaced === "1") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [justPlaced]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#6C3DF5" size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const status = statusMeta[order.status] ?? statusMeta.pending;
  const isJustPlaced = justPlaced === "1";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="inverted" backgroundColor="#6C3DF5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.replace("/(tabs)")}
        >
          <Ionicons name="close" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isJustPlaced ? "Order Placed!" : "Order Details"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Hero (only when just placed) */}
        {isJustPlaced && (
          <View style={styles.successHero}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark" size={48} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Thank you!</Text>
            <Text style={styles.successSub}>
              Your order has been placed successfully.
            </Text>
            <View style={styles.orderNumberPill}>
              <Text style={styles.orderNumberLabel}>ORDER #</Text>
              <Text style={styles.orderNumberValue}>{order.order_number}</Text>
            </View>
          </View>
        )}

        {/* Status card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: `${status.color}15` },
              ]}
            >
              <Ionicons
                name={status.icon as any}
                size={24}
                color={status.color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusValue, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          {order.estimated_delivery && (
            <View style={styles.estimateBox}>
              <Ionicons name="time-outline" size={16} color="#6C3DF5" />
              <Text style={styles.estimateText}>
                Estimated arrival: {order.estimated_delivery}
              </Text>
            </View>
          )}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Items ({order.items?.length ?? 0})
          </Text>

          {order.items?.map((item: any) => (
            <View
              key={item.order_item_id ?? item.product_id}
              style={styles.itemRow}
            >
              <View style={styles.itemImageWrap}>
                {item.product?.image_url ? (
                  <Image
                    source={{ uri: item.product.image_url }}
                    style={styles.itemImage}
                  />
                ) : (
                  <View style={[styles.itemImage, styles.itemPlaceholder]}>
                    <Ionicons name="image-outline" size={22} color="#c4b5fd" />
                  </View>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product?.name ?? "Product"}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} × ₱{Number(item.unit_price).toFixed(2)}
                </Text>
              </View>

              <Text style={styles.itemTotal}>
                ₱{Number(item.subtotal).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {order.delivery_address?.street ?? ""}
                {order.delivery_address?.barangay
                  ? `, ${order.delivery_address.barangay}`
                  : ""}
                {order.delivery_address?.city
                  ? `, ${order.delivery_address.city}`
                  : ""}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#6b7280" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoLabel}>Recipient</Text>
              <Text style={styles.infoValue}>
                {order.delivery_contact_name ?? "—"}
              </Text>
              <Text style={styles.infoSub}>
                {order.delivery_contact_phone ?? ""}
              </Text>
            </View>
          </View>

          {order.delivery_instructions ? (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.infoLabel}>Instructions</Text>
                <Text style={styles.infoValue}>
                  {order.delivery_instructions}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ₱{Number(order.subtotal).toFixed(2)}
            </Text>
          </View>

          {Number(order.discount_amount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Discount
                {order.promotion ? ` (${order.promotion.code})` : ""}
              </Text>
              <Text style={[styles.summaryValue, { color: "#059669" }]}>
                -₱{Number(order.discount_amount).toFixed(2)}
              </Text>
            </View>
          )}

          {Number(order.delivery_fee) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery fee</Text>
              <Text style={styles.summaryValue}>
                ₱{Number(order.delivery_fee).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₱{Number(order.total_amount).toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentBadge}>
            <Ionicons name="card-outline" size={14} color="#6C3DF5" />
            <Text style={styles.paymentText}>
              {order.payment_method === "cod"
                ? "Cash on Delivery"
                : order.payment_method === "gcash"
                  ? "GCash"
                  : order.payment_method === "maya"
                    ? "Maya"
                    : "Card"}
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/orders/index")}
        >
          <Ionicons name="receipt-outline" size={18} color="#6C3DF5" />
          <Text style={styles.secondaryBtnText}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/products")}
        >
          <Ionicons name="basket-outline" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Shop Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

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

  successHero: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: "#6C3DF5",
    marginBottom: 16,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  successSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 6,
  },
  orderNumberPill: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
  },
  orderNumberLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  orderNumberValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: 1,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: { fontSize: 11, color: "#6b7280", fontWeight: "600" },
  statusValue: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  estimateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    padding: 12,
    backgroundColor: "#f5f3ff",
    borderRadius: 10,
  },
  estimateText: {
    fontSize: 12,
    color: "#6C3DF5",
    fontWeight: "700",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  itemImageWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  itemImage: { width: "100%", height: "100%" },
  itemPlaceholder: { alignItems: "center", justifyContent: "center" },
  itemName: { fontSize: 13, fontWeight: "700", color: "#111827" },
  itemMeta: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  itemTotal: { fontSize: 13, fontWeight: "800", color: "#6C3DF5" },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoLabel: { fontSize: 11, color: "#9ca3af" },
  infoValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
    marginTop: 2,
  },
  infoSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 13, color: "#6b7280" },
  summaryValue: { fontSize: 13, color: "#111827", fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 10 },
  totalLabel: { fontSize: 15, fontWeight: "800", color: "#111827" },
  totalValue: { fontSize: 20, fontWeight: "800", color: "#6C3DF5" },

  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f5f3ff",
    borderRadius: 999,
  },
  paymentText: { fontSize: 12, fontWeight: "700", color: "#6C3DF5" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f5f3ff",
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryBtnText: { color: "#6C3DF5", fontWeight: "800", fontSize: 14 },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#6C3DF5",
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
