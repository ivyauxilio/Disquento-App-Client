// app/checkout.tsx

import { promotionAPI } from "@/api/promotions";
import { useAppDispatch } from "@/store/hooks";
import {
  clearCart,
  selectCartItems,
  selectCartTotals,
} from "@/store/slices/cartSlice";
import { placeOrder, selectOrderPlacing } from "@/store/slices/orderSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const paymentMethods = [
  {
    id: "cod",
    label: "Cash on Delivery",
    icon: "cash-outline",
    color: "#059669",
  },
  {
    id: "gcash",
    label: "GCash",
    icon: "phone-portrait-outline",
    color: "#007DFE",
  },
  { id: "maya", label: "Maya", icon: "wallet-outline", color: "#00C853" },
  {
    id: "card",
    label: "Credit/Debit Card",
    icon: "card-outline",
    color: "#6C3DF5",
  },
];

const deliverySlots = [
  { id: "asap", label: "ASAP", sub: "30-45 min" },
  { id: "1h", label: "Within 1 hour", sub: "" },
  { id: "2h", label: "Within 2 hours", sub: "" },
];

export default function CheckoutScreen() {
  const router = useRouter();
  // const dispatch = useDispatch();
  const dispatch = useAppDispatch();
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const placing = useSelector(selectOrderPlacing);

  // Reusable modal - works on Android and Expo Web
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmText, setModalConfirmText] = useState("OK");
  const [modalCancelText, setModalCancelText] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [modalDestructive, setModalDestructive] = useState(false);

  const showModal = ({
    title,
    message,
    confirmText = "OK",
    cancelText = null,
    onConfirm = null,
    destructive = false,
  }: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string | null;
    onConfirm?: (() => void) | null;
    destructive?: boolean;
  }) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalConfirmText(confirmText);
    setModalCancelText(cancelText);
    setModalAction(() => onConfirm);
    setModalDestructive(destructive);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalAction(null);
  };

  const handleModalConfirm = () => {
    const action = modalAction;
    closeModal();
    action?.();
  };

  // Address
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zip, setZip] = useState("");
  const [landmark, setLandmark] = useState("");

  // Contact
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Delivery
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [deliverySlot, setDeliverySlot] = useState("asap");
  const [instructions, setInstructions] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Promo
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  // Totals
  const deliveryFee = deliveryType === "delivery" ? 49 : 0;
  const discount = appliedPromo?.discount ?? 0;
  const grandTotal = Math.max(0, totals.subtotal + deliveryFee - discount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError(null);

    try {
      const res = await promotionAPI.validate(
        promoCode.trim().toUpperCase(),
        totals.subtotal,
      );

      if (res.success) {
        setAppliedPromo(res.data);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setPromoError(res.message || "Invalid promo code");
        setAppliedPromo(null);
      }
    } catch (e: any) {
      setPromoError(e.response?.data?.message || "Failed to validate promo");
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError(null);
  };

  const validate = () => {
    if (items.length === 0) {
      showModal({
        title: "Cart is empty",
        message: "Add items before checking out.",
      });
      return false;
    }

    if (deliveryType === "delivery") {
      if (!street.trim()) {
        showModal({
          title: "Missing address",
          message: "Please enter your street address.",
        });
        return false;
      }
      if (!barangay.trim() || !city.trim()) {
        showModal({
          title: "Missing address",
          message: "Please complete your address.",
        });
        return false;
      }
    }

    if (!contactName.trim()) {
      showModal({
        title: "Missing name",
        message: "Please enter the recipient name.",
      });
      return false;
    }

    if (!contactPhone.trim() || contactPhone.trim().length < 10) {
      showModal({
        title: "Invalid phone",
        message: "Please enter a valid phone number.",
      });
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const payload = {
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
        delivery_address: {
          street: street.trim(),
          barangay: barangay.trim(),
          city: city.trim(),
          province: province.trim(),
          zip: zip.trim(),
          landmark: landmark.trim(),
        },
        delivery_contact_name: contactName.trim(),
        delivery_contact_phone: contactPhone.trim(),
        delivery_instructions: instructions.trim(),
        delivery_type: deliveryType,
        payment_method: paymentMethod,
        promo_code: appliedPromo?.code,
        notes: instructions,
      };

      const res = await dispatch(placeOrder(payload as any)).unwrap();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch(clearCart());

      router.replace({
        pathname: "/orders/[id]",
        params: { id: res.data.order_id, justPlaced: "1" },
      });
    } catch (e: any) {
      showModal({
        title: "Order Failed",
        message:
          typeof e === "string"
            ? e
            : e?.message || "Could not place order. Try again.",
        destructive: true,
      });
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Cart is empty</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.replace("/(tabs)/products")}
          >
            <Text style={styles.emptyBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 200 }}
          >
            {/* Delivery Type Toggle */}
            <View style={styles.section}>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    deliveryType === "delivery" && styles.typeBtnActive,
                  ]}
                  onPress={() => setDeliveryType("delivery")}
                >
                  <Ionicons
                    name="bicycle-outline"
                    size={18}
                    color={deliveryType === "delivery" ? "#fff" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      deliveryType === "delivery" && styles.typeTextActive,
                    ]}
                  >
                    Delivery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    deliveryType === "pickup" && styles.typeBtnActive,
                  ]}
                  onPress={() => setDeliveryType("pickup")}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={18}
                    color={deliveryType === "pickup" ? "#fff" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      deliveryType === "pickup" && styles.typeTextActive,
                    ]}
                  >
                    Pickup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Address */}
            {deliveryType === "delivery" && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location" size={18} color="#6C3DF5" />
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Street / House No. *"
                  value={street}
                  onChangeText={setStreet}
                  placeholderTextColor="#9ca3af"
                />

                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Barangay *"
                    value={barangay}
                    onChangeText={setBarangay}
                    placeholderTextColor="#9ca3af"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="City *"
                    value={city}
                    onChangeText={setCity}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Province"
                    value={province}
                    onChangeText={setProvince}
                    placeholderTextColor="#9ca3af"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="ZIP Code"
                    value={zip}
                    onChangeText={setZip}
                    keyboardType="number-pad"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Landmark (optional)"
                  value={landmark}
                  onChangeText={setLandmark}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            )}

            {/* Delivery Time */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={18} color="#6C3DF5" />
                <Text style={styles.sectionTitle}>
                  {deliveryType === "delivery"
                    ? "Delivery Time"
                    : "Pickup Time"}
                </Text>
              </View>

              <View style={styles.slotRow}>
                {deliverySlots.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.slotChip,
                      deliverySlot === s.id && styles.slotChipActive,
                    ]}
                    onPress={() => setDeliverySlot(s.id)}
                  >
                    <Text
                      style={[
                        styles.slotLabel,
                        deliverySlot === s.id && styles.slotLabelActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                    {s.sub ? (
                      <Text
                        style={[
                          styles.slotSub,
                          deliverySlot === s.id && styles.slotSubActive,
                        ]}
                      >
                        {s.sub}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[
                  styles.input,
                  { height: 80, textAlignVertical: "top", paddingTop: 12 },
                ]}
                placeholder="Delivery instructions (optional)"
                value={instructions}
                onChangeText={setInstructions}
                multiline
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Contact */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={18} color="#6C3DF5" />
                <Text style={styles.sectionTitle}>Contact Info</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Full name *"
                value={contactName}
                onChangeText={setContactName}
                placeholderTextColor="#9ca3af"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone number *"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card" size={18} color="#6C3DF5" />
                <Text style={styles.sectionTitle}>Payment Method</Text>
              </View>

              {paymentMethods.map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  style={[
                    styles.paymentRow,
                    paymentMethod === pm.id && styles.paymentRowActive,
                  ]}
                  onPress={() => setPaymentMethod(pm.id)}
                >
                  <View
                    style={[
                      styles.paymentIcon,
                      { backgroundColor: `${pm.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={pm.icon as any}
                      size={20}
                      color={pm.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.paymentLabel,
                      paymentMethod === pm.id && styles.paymentLabelActive,
                    ]}
                  >
                    {pm.label}
                  </Text>
                  {paymentMethod === pm.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#6C3DF5"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Promo Code */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="pricetag" size={18} color="#6C3DF5" />
                <Text style={styles.sectionTitle}>Promo Code</Text>
              </View>

              {appliedPromo ? (
                <View style={styles.promoApplied}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.promoAppliedCode}>
                      {appliedPromo.code}
                    </Text>
                    <Text style={styles.promoAppliedText}>
                      You save ₱{appliedPromo.discount.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleRemovePromo}>
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.promoInputRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChangeText={(t) => setPromoCode(t.toUpperCase())}
                      autoCapitalize="characters"
                      placeholderTextColor="#9ca3af"
                    />
                    <TouchableOpacity
                      style={[
                        styles.promoBtn,
                        (!promoCode.trim() || promoLoading) && { opacity: 0.5 },
                      ]}
                      onPress={handleApplyPromo}
                      disabled={!promoCode.trim() || promoLoading}
                    >
                      {promoLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.promoBtnText}>Apply</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  {promoError && (
                    <Text style={styles.promoError}>{promoError}</Text>
                  )}
                </>
              )}
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="receipt" size={18} color="#6C3DF5" />
                <Text style={styles.sectionTitle}>Order Summary</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Subtotal ({totals.itemCount} item
                  {totals.itemCount > 1 ? "s" : ""})
                </Text>
                <Text style={styles.summaryValue}>
                  ₱{totals.subtotal.toFixed(2)}
                </Text>
              </View>

              {totals.savings > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Product savings</Text>
                  <Text style={[styles.summaryValue, { color: "#059669" }]}>
                    -₱{totals.savings.toFixed(2)}
                  </Text>
                </View>
              )}

              {deliveryType === "delivery" && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery fee</Text>
                  <Text style={styles.summaryValue}>
                    ₱{deliveryFee.toFixed(2)}
                  </Text>
                </View>
              )}

              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Promo discount</Text>
                  <Text style={[styles.summaryValue, { color: "#059669" }]}>
                    -₱{discount.toFixed(2)}
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

              <View style={styles.divider} />

              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>
                  ₱{grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Place Order Sticky Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomLeft}>
              <Text style={styles.bottomLabel}>Total</Text>
              <Text style={styles.bottomAmount}>₱{grandTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.placeBtn, placing && { opacity: 0.7 }]}
              onPress={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.placeBtnText}>Place Order</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View
                style={[
                  styles.modalIcon,
                  modalDestructive && styles.modalIconDanger,
                ]}
              >
                <Ionicons
                  name={
                    modalDestructive ? "alert-circle" : "information-circle"
                  }
                  size={26}
                  color={modalDestructive ? "#ef4444" : "#6C3DF5"}
                />
              </View>

              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>

              <View style={styles.modalActions}>
                {modalCancelText && (
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={closeModal}
                  >
                    <Text style={styles.modalCancelText}>
                      {modalCancelText}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.modalConfirmBtn,
                    modalCancelText ? { flex: 1 } : { width: "100%" },
                    modalDestructive && styles.modalConfirmBtnDanger,
                  ]}
                  onPress={handleModalConfirm}
                >
                  <Text style={styles.modalConfirmText}>
                    {modalConfirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
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

  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#111827" },

  // Toggle
  typeToggle: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 9,
  },
  typeBtnActive: { backgroundColor: "#6C3DF5" },
  typeText: { fontSize: 14, fontWeight: "700", color: "#6b7280" },
  typeTextActive: { color: "#fff" },

  // Inputs
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 14,
    color: "#111827",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },

  // Slots
  slotRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  slotChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    alignItems: "center",
  },
  slotChipActive: {
    borderColor: "#6C3DF5",
    backgroundColor: "#faf5ff",
  },
  slotLabel: { fontSize: 13, fontWeight: "700", color: "#6b7280" },
  slotLabelActive: { color: "#6C3DF5" },
  slotSub: { fontSize: 10, color: "#9ca3af", marginTop: 2 },
  slotSubActive: { color: "#6C3DF5" },

  // Payment
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 10,
  },
  paymentRowActive: {
    borderColor: "#6C3DF5",
    backgroundColor: "#faf5ff",
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: "#374151" },
  paymentLabelActive: { color: "#6C3DF5" },

  // Promo
  promoInputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  promoBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#6C3DF5",
    borderRadius: 12,
    minWidth: 90,
    alignItems: "center",
  },
  promoBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  promoError: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "600",
  },
  promoApplied: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#d1fae5",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#059669",
  },
  promoAppliedCode: { fontSize: 14, fontWeight: "800", color: "#065f46" },
  promoAppliedText: { fontSize: 12, color: "#059669", marginTop: 2 },

  // Summary
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 13, color: "#6b7280" },
  summaryValue: { fontSize: 13, color: "#111827", fontWeight: "700" },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 10,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTotalLabel: { fontSize: 15, fontWeight: "800", color: "#111827" },
  summaryTotalValue: { fontSize: 22, fontWeight: "800", color: "#6C3DF5" },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomLeft: { flex: 1 },
  bottomLabel: { fontSize: 12, color: "#6b7280" },
  bottomAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6C3DF5",
    marginTop: 2,
  },
  placeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#6C3DF5",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#6C3DF5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  placeBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 16,
  },
  emptyBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#6C3DF5",
    borderRadius: 12,
  },
  emptyBtnText: { color: "#fff", fontWeight: "800" },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f3e8ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalIconDanger: {
    backgroundColor: "#fee2e2",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 22,
  },
  modalActions: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalCancelText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
  },
  modalConfirmBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#6C3DF5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmBtnDanger: {
    backgroundColor: "#ef4444",
  },
  modalConfirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
});
