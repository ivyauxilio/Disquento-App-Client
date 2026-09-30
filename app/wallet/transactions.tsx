// app/wallet/transactions.tsx

import Sidebar from "@/components/Sidebar";
import {
  fetchTransactions,
  fetchWallet,
  resetTransactions,
  setFilter,
} from "@/store/slices/transactionSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

// Filter tabs
const filters = [
  { key: "all", label: "All", icon: "list-outline" },
  { key: "referral_reward", label: "Rewards", icon: "gift-outline" },
  { key: "withdrawal", label: "Withdrawals", icon: "arrow-up-outline" },
  { key: "purchase", label: "Purchases", icon: "cart-outline" },
];

// Map type → icon + color
const getTypeStyle = (type: string) => {
  const map: Record<
    string,
    { icon: string; color: string; bg: string; label: string }
  > = {
    referral_reward: {
      icon: "gift",
      color: "#059669",
      bg: "#d1fae5",
      label: "Referral Reward",
    },
    withdrawal: {
      icon: "arrow-up",
      color: "#dc2626",
      bg: "#fee2e2",
      label: "Withdrawal",
    },
    purchase: {
      icon: "cart",
      color: "#2563eb",
      bg: "#dbeafe",
      label: "Purchase",
    },
    adjustment: {
      icon: "construct",
      color: "#6C3DF5",
      bg: "#ede9fe",
      label: "Adjustment",
    },
    reversal: {
      icon: "refresh",
      color: "#d97706",
      bg: "#fef3c7",
      label: "Reversal",
    },
  };
  return (
    map[type] ?? {
      icon: "receipt",
      color: "#6b7280",
      bg: "#f3f4f6",
      label: "Transaction",
    }
  );
};

export default function TransactionsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    list,
    wallet,
    pagination,
    filters: activeFilters,
    loading,
    loadingMore,
    refreshing,
  } = useSelector((s: any) => s.transactions);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const load = useCallback(
    (refresh = false) => {
      dispatch(
        fetchTransactions({
          page: 1,
          type: activeFilters.type,
          status: activeFilters.status,
          refresh,
        }) as any,
      );
      dispatch(fetchWallet() as any);
    },
    [dispatch, activeFilters],
  );

  useEffect(() => {
    load(true);
  }, [activeFilters.type, activeFilters.status]);

  const onRefresh = () => load(true);

  const onEndReached = () => {
    if (loadingMore || loading) return;
    if (pagination.current_page < pagination.last_page) {
      dispatch(
        fetchTransactions({
          page: pagination.current_page + 1,
          type: activeFilters.type,
          status: activeFilters.status,
        }) as any,
      );
    }
  };

  const handleFilterPress = (key: string) => {
    dispatch(setFilter({ type: key }));
    dispatch(resetTransactions());
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
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

  const renderItem = ({ item }: { item: any }) => {
    const ts = getTypeStyle(item.type);
    const isPositive = Number(item.amount) > 0;

    return (
      <View style={styles.txRow}>
        <View style={[styles.txIcon, { backgroundColor: ts.bg }]}>
          <Ionicons name={ts.icon as any} size={20} color={ts.color} />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.txTitle} numberOfLines={1}>
            {item.description || ts.label}
          </Text>
          <Text style={styles.txDate}>{formatDate(item.created_at)}</Text>
          {item.payment_status && (
            <View style={styles.statusWrap}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      item.payment_status === "paid"
                        ? "#059669"
                        : item.payment_status === "pending"
                          ? "#d97706"
                          : "#dc2626",
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {item.payment_status.charAt(0).toUpperCase() +
                  item.payment_status.slice(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={[
              styles.txAmount,
              { color: isPositive ? "#059669" : "#dc2626" },
            ]}
          >
            {isPositive ? "+" : "-"}₱{Math.abs(Number(item.amount)).toFixed(2)}
          </Text>
          <Text style={styles.txBalance}>
            ₱{Number(item.balance_after).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>No transactions yet</Text>
        <Text style={styles.emptySubtext}>
          Your referral rewards and withdrawals will appear here
        </Text>
      </View>
    );
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
          <Text style={styles.headerTitle}>Transactions</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setSidebarOpen(true)}
          >
            <Ionicons name="menu" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Wallet summary card */}
        {wallet && (
          <View style={styles.walletCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
              <Text style={styles.walletValue}>
                ₱{Number(wallet.balance ?? 0).toFixed(2)}
              </Text>
              <View style={styles.walletStats}>
                <View style={styles.walletStat}>
                  <Ionicons name="time-outline" size={12} color="#d97706" />
                  <Text style={styles.walletStatText}>
                    Pending: ₱{Number(wallet.pending_balance ?? 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.walletStat}>
                  <Ionicons
                    name="trending-up-outline"
                    size={12}
                    color="#059669"
                  />
                  <Text style={styles.walletStatText}>
                    Earned: ₱{Number(wallet.total_earned ?? 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.withdrawBtn}
              // onPress={() => router.push("/wallet/withdraw")}
            >
              <Ionicons name="cash-outline" size={16} color="#fff" />
              <Text style={styles.withdrawBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {filters.map((f) => {
              const active = activeFilters.type === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => handleFilterPress(f.key)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Ionicons
                    name={f.icon as any}
                    size={14}
                    color={active ? "#fff" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      active && styles.filterTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List */}
        {loading && list.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color="#6C3DF5" size="large" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => String(item.transaction_id ?? item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
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
                <View style={{ paddingVertical: 20 }}>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  // Wallet card
  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    backgroundColor: "#6C3DF5",
    borderRadius: 18,
  },
  walletLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  walletValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginTop: 4,
  },
  walletStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  walletStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  walletStatText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
  },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  withdrawBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  // Filters
  filterWrap: {
    marginBottom: 14,
  },
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
  filterChipActive: {
    backgroundColor: "#6C3DF5",
    borderColor: "#6C3DF5",
  },
  filterText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },

  // Transaction row
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  txDate: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "800",
  },
  txBalance: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 2,
  },

  // Empty
  empty: {
    alignItems: "center",
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
