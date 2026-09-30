// app/wallet/withdraw.tsx

import { walletAPI } from "@/api/wallet";
import Sidebar from "@/components/Sidebar";
import { fetchWallet } from "@/store/slices/transactionSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

// Payment methods
const paymentMethods = [
  {
    id: "gcash",
    label: "GCash",
    icon: "phone-portrait-outline",
    color: "#007DFE",
    bg: "#e0f2fe",
    placeholder: "09XX XXX XXXX",
    accountLabel: "GCash Number",
  },
  {
    id: "maya",
    label: "Maya",
    icon: "wallet-outline",
    color: "#00C853",
    bg: "#dcfce7",
    placeholder: "09XX XXX XXXX",
    accountLabel: "Maya Number",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    icon: "business-outline",
    color: "#6C3DF5",
    bg: "#ede9fe",
    placeholder: "Account number",
    accountLabel: "Account Number",
  },
];

// Quick amounts
const quickAmounts = [100, 250, 500, 1000];

export default function WithdrawScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { wallet } = useSelector((s: any) => s.transactions);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    payment_method: "gcash",
    account_number: "",
    account_name: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedMethod =
    paymentMethods.find((m) => m.id === form.payment_method) ??
    paymentMethods[0];

  const balance = Number(wallet?.balance ?? 0);
  const minWithdrawal = 500; // TODO: pull from settings

  useEffect(() => {
    dispatch(fetchWallet() as any);
  }, [dispatch]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};

    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      e.amount = "Enter a valid amount";
    } else if (amount < minWithdrawal) {
      e.amount = `Minimum withdrawal is ₱${minWithdrawal.toLocaleString()}`;
    } else if (amount > balance) {
      e.amount = `Insufficient balance. Available: ₱${balance.toFixed(2)}`;
    }

    if (!form.account_number.trim()) {
      e.account_number = "Account number is required";
    } else if (
      form.payment_method !== "bank_transfer" &&
      !/^09\d{9}$/.test(form.account_number.replace(/\s/g, ""))
    ) {
      e.account_number = "Enter a valid mobile number (09XXXXXXXXX)";
    }

    if (!form.account_name.trim()) {
      e.account_name = "Account name is required";
    } else if (form.account_name.trim().length < 3) {
      e.account_name = "Enter your full name";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    Alert.alert(
      "Confirm Withdrawal",
      `Withdraw ₱${parseFloat(form.amount).toFixed(2)} to your ${
        selectedMethod.label
      } account?\n\nAccount: ${form.account_number}\nName: ${form.account_name}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "default",
          onPress: doSubmit,
        },
      ],
    );
  };

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await walletAPI.requestWithdrawal({
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        account_number: form.account_number,
        account_name: form.account_name,
      });

      if (response.success) {
        Alert.alert(
          "Request Submitted 🎉",
          "Your withdrawal request is pending approval. You'll receive a notification once it's processed.",
          [
            {
              text: "View Transactions",
              onPress: () => router.replace("/wallet/transactions"),
            },
          ],
        );

        dispatch(fetchWallet() as any);
      } else {
        Alert.alert("Failed", response.message || "Please try again.");
      }
    } catch (err: any) {
      Alert.alert(
        "Failed",
        err.response?.data?.message || "Unable to submit withdrawal request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          <Text style={styles.headerTitle}>Withdraw Funds</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setSidebarOpen(true)}
          >
            <Ionicons name="menu" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Balance card */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceIconWrap}>
                <Ionicons name="wallet" size={24} color="#fff" />
              </View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue}>₱{balance.toFixed(2)}</Text>
              {wallet?.pending_balance > 0 && (
                <Text style={styles.balancePending}>
                  + ₱{Number(wallet.pending_balance).toFixed(2)} pending
                </Text>
              )}
            </View>

            {/* Amount input */}
            <View style={styles.section}>
              <Text style={styles.label}>Amount to Withdraw</Text>
              <View
                style={[styles.amountInput, errors.amount && styles.inputError]}
              >
                <Text style={styles.currency}>₱</Text>
                <TextInput
                  style={styles.amountField}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={form.amount}
                  onChangeText={(v) =>
                    handleChange("amount", v.replace(/[^0-9.]/g, ""))
                  }
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => handleChange("amount", balance.toFixed(2))}
                >
                  <Text style={styles.maxBtn}>MAX</Text>
                </TouchableOpacity>
              </View>
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}

              {/* Quick amounts */}
              <View style={styles.quickAmounts}>
                {quickAmounts.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.quickBtn}
                    onPress={() => handleChange("amount", String(amt))}
                  >
                    <Text style={styles.quickBtnText}>
                      ₱{amt.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#6C3DF5"
                />
                <Text style={styles.infoText}>
                  Minimum withdrawal: ₱{minWithdrawal.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Payment method */}
            <View style={styles.section}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.methodsWrap}>
                {paymentMethods.map((m) => {
                  const active = form.payment_method === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.methodCard,
                        active && styles.methodCardActive,
                      ]}
                      onPress={() => handleChange("payment_method", m.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[styles.methodIcon, { backgroundColor: m.bg }]}
                      >
                        <Ionicons
                          name={m.icon as any}
                          size={22}
                          color={m.color}
                        />
                      </View>
                      <Text
                        style={[
                          styles.methodLabel,
                          active && styles.methodLabelActive,
                        ]}
                      >
                        {m.label}
                      </Text>
                      {active && (
                        <View style={styles.methodCheck}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#6C3DF5"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Account details */}
            <View style={styles.section}>
              <Text style={styles.label}>{selectedMethod.accountLabel}</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.account_number && styles.inputError,
                ]}
                placeholder={selectedMethod.placeholder}
                keyboardType={
                  form.payment_method === "bank_transfer"
                    ? "default"
                    : "phone-pad"
                }
                value={form.account_number}
                onChangeText={(v) => handleChange("account_number", v)}
                placeholderTextColor="#9ca3af"
              />
              {errors.account_number && (
                <Text style={styles.errorText}>{errors.account_number}</Text>
              )}

              <Text style={[styles.label, { marginTop: 16 }]}>
                Account Name
              </Text>
              <TextInput
                style={[styles.input, errors.account_name && styles.inputError]}
                placeholder="Juan Dela Cruz"
                value={form.account_name}
                onChangeText={(v) => handleChange("account_name", v)}
                autoCapitalize="words"
                placeholderTextColor="#9ca3af"
              />
              {errors.account_name && (
                <Text style={styles.errorText}>{errors.account_name}</Text>
              )}
            </View>

            {/* Summary */}
            {form.amount && parseFloat(form.amount) >= minWithdrawal && (
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount</Text>
                  <Text style={styles.summaryValue}>
                    ₱{parseFloat(form.amount).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fee</Text>
                  <Text style={styles.summaryValue}>₱0.00</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>You'll receive</Text>
                  <Text style={styles.summaryTotalValue}>
                    ₱{parseFloat(form.amount).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {/* Info */}
            <View style={styles.notesBox}>
              <View style={styles.noteRow}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.noteText}>
                  Withdrawals are processed within 1-3 business days.
                </Text>
              </View>
              <View style={styles.noteRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color="#6b7280"
                />
                <Text style={styles.noteText}>
                  Make sure your account details are correct. Incorrect info may
                  delay the payout.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Submit button — fixed at bottom */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="arrow-up-circle" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>Request Withdrawal</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  // Balance card
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    padding: 22,
    backgroundColor: "#6C3DF5",
    borderRadius: 20,
    alignItems: "center",
  },
  balanceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginTop: 4,
  },
  balancePending: {
    fontSize: 12,
    color: "#fde047",
    marginTop: 6,
    fontWeight: "600",
  },

  // Section
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },

  // Amount input
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 64,
  },
  currency: {
    fontSize: 22,
    fontWeight: "800",
    color: "#6b7280",
    marginRight: 8,
  },
  amountField: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  maxBtn: {
    color: "#6C3DF5",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  quickAmounts: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f5f3ff",
    borderRadius: 10,
  },
  infoText: {
    fontSize: 12,
    color: "#6C3DF5",
    fontWeight: "600",
  },

  // Methods
  methodsWrap: {
    gap: 10,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  methodCardActive: {
    borderColor: "#6C3DF5",
    backgroundColor: "#faf5ff",
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  methodLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },
  methodLabelActive: {
    color: "#6C3DF5",
  },
  methodCheck: {
    marginLeft: 8,
  },

  // Inputs
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: "#111827",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 6,
    fontWeight: "600",
  },

  // Summary
  summary: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLabel: { fontSize: 13, color: "#6b7280" },
  summaryValue: { fontSize: 13, color: "#111827", fontWeight: "700" },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 6,
    paddingTop: 12,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6C3DF5",
  },

  // Notes
  notesBox: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 14,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    gap: 10,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 17,
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6C3DF5",
    height: 56,
    borderRadius: 16,
    shadowColor: "#6C3DF5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
