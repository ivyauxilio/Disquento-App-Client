// app/cart.tsx

import {
  clearCart,
  decrementQty,
  incrementQty,
  removeFromCart,
  selectCartItems,
  selectCartTotals,
} from "@/store/slices/cartSlice";
import { getImageUrl } from "@/utils/image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function CartScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalMessage, setModalMessage] = React.useState("");
  const [modalConfirmText, setModalConfirmText] = React.useState("Confirm");
  const [modalDestructive, setModalDestructive] = React.useState(false);
  const [modalAction, setModalAction] = React.useState<(() => void) | null>(
    null,
  );

  const handleIncrement = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(incrementQty(id));
  };

  const handleDecrement = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(decrementQty(id));
  };

  const showConfirmModal = ({
    title,
    message,
    confirmText = "Confirm",
    destructive = false,
    onConfirm,
  }: {
    title: string;
    message: string;
    confirmText?: string;
    destructive?: boolean;
    onConfirm: () => void;
  }) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalConfirmText(confirmText);
    setModalDestructive(destructive);
    setModalAction(() => onConfirm);
    setModalVisible(true);
  };

  const handleRemove = (id: number, name: string) => {
    showConfirmModal({
      title: "Remove Item",
      message: `Remove "${name}" from cart?`,
      confirmText: "Remove",
      destructive: true,
      onConfirm: () => {
        dispatch(removeFromCart(id));
      },
    });
  };

  const handleClearCart = () => {
    if (items.length === 0) return;

    showConfirmModal({
      title: "Clear Cart",
      message: "Remove all items from cart?",
      confirmText: "Clear",
      destructive: true,
      onConfirm: () => {
        dispatch(clearCart());
      },
    });
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      showConfirmModal({
        title: "Cart is Empty",
        message: "Add items to cart before checking out.",
        confirmText: "OK",
        onConfirm: () => {},
      });

      return;
    }

    router.push("/checkout");
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = getImageUrl(item.image_url);
    const price = Number(item.price);
    const discountedPrice = item.discounted_price
      ? Number(item.discounted_price)
      : price;
    return (
      <View style={styles.itemRow}>
        {/* Image */}
        <View style={styles.itemImageWrap}>
          {item.image_url ? (
            <Image
              source={imageUrl ? { uri: imageUrl } : undefined}
              style={styles.itemImage}
            />
          ) : (
            <View style={[styles.itemImage, styles.itemPlaceholder]}>
              <Ionicons name="image-outline" size={28} color="#c4b5fd" />
            </View>
          )}

          {item.has_discount && (
            <View style={styles.itemDiscountBadge}>
              <Text style={styles.itemDiscountText}>
                {/* {item.discount_label} */}
                {Math.round(((price - discountedPrice) / price) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemUnit}>
            {item.unit}
            {item.merchant_name ? ` • ${item.merchant_name}` : ""}
          </Text>

          <View style={styles.itemPriceRow}>
            <Text style={styles.itemPrice}>
              ₱{item.discounted_price.toFixed(2)}
            </Text>
            {item.has_discount && (
              <Text style={styles.itemOriginalPrice}>
                ₱{item.price.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Quantity control */}
          <View style={styles.qtyRow}>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => handleDecrement(item.product_id)}
              >
                <Ionicons name="remove" size={16} color="#6C3DF5" />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.qtyBtn,
                  item.quantity >= item.stock_quantity && { opacity: 0.4 },
                ]}
                onPress={() => handleIncrement(item.product_id)}
                disabled={item.quantity >= item.stock_quantity}
              >
                <Ionicons name="add" size={16} color="#6C3DF5" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(item.product_id, item.name)}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="cart-outline" size={64} color="#c4b5fd" />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtext}>
        Add products from the grocery store to get started
      </Text>
      <TouchableOpacity
        style={styles.shopBtn}
        onPress={() => router.replace("/(tabs)/products")}
      >
        <Ionicons name="basket-outline" size={18} color="#fff" />
        <Text style={styles.shopBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="inverted" backgroundColor="#6C3DF5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>My Cart</Text>
          {totals.itemCount > 0 && (
            <Text style={styles.headerSub}>
              {totals.itemCount} item{totals.itemCount > 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {items.length > 0 ? (
          <TouchableOpacity style={styles.iconBtn} onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {items.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          {/* Items */}
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.product_id)}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 240,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            showsVerticalScrollIndicator={false}
          />

          {/* Sticky Bottom Bar */}
          <View style={styles.bottomBar}>
            {/* Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ₱{totals.subtotal.toFixed(2)}
                </Text>
              </View>

              {totals.savings > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>You save</Text>
                  <Text style={[styles.summaryValue, { color: "#059669" }]}>
                    -₱{totals.savings.toFixed(2)}
                  </Text>
                </View>
              )}

              {totals.points > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Points to earn</Text>
                  <Text style={[styles.summaryValue, { color: "#d97706" }]}>
                    +{totals.points} pts
                  </Text>
                </View>
              )}

              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>
                  ₱{totals.subtotal.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Checkout button */}
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
              <View style={styles.checkoutRight}>
                <Text style={styles.checkoutAmount}>
                  ₱{totals.subtotal.toFixed(2)}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Icon */}
            <View
              style={[
                styles.modalIcon,
                modalDestructive && styles.modalIconDanger,
              ]}
            >
              <Ionicons
                name={
                  modalDestructive ? "trash-outline" : "information-outline"
                }
                size={28}
                color={modalDestructive ? "#ef4444" : "#6C3DF5"}
              />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>{modalTitle}</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  modalDestructive && styles.modalConfirmDanger,
                ]}
                onPress={() => {
                  setModalVisible(false);

                  // Execute action after closing modal
                  setTimeout(() => {
                    modalAction?.();
                  }, 100);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmText}>{modalConfirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  headerSub: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
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

  // Item row
  itemRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  itemImageWrap: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
    position: "relative",
  },
  itemImage: { width: "100%", height: "100%" },
  itemPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  itemDiscountBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemDiscountText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  itemUnit: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6C3DF5",
  },
  itemOriginalPrice: {
    fontSize: 11,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f0ff",
    borderRadius: 10,
    padding: 3,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    minWidth: 32,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: "#6C3DF5",
  },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f3f0ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
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
  shopBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  summary: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "700",
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6C3DF5",
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#6C3DF5",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#6C3DF5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  checkoutRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkoutAmount: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modalContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",

    // Android
    elevation: 10,

    // iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },

  modalIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#f3f0ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  modalIconDanger: {
    backgroundColor: "#fef2f2",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  modalMessage: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  modalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },

  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },

  modalConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#6C3DF5",
    alignItems: "center",
    justifyContent: "center",
  },

  modalConfirmDanger: {
    backgroundColor: "#ef4444",
  },

  modalConfirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
});
