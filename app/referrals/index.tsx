import Sidebar from "@/components/Sidebar";
import {
  fetchMyReferrals,
  fetchReferralList,
} from "@/store/slices/referralSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

export default function ReferralScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((s: any) => s.auth);

  const {
    stats,
    list = [],
    loading,
    loadingList,
  } = useSelector((s: any) => s.referrals);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchMyReferrals() as any),
        dispatch(fetchReferralList(1) as any),
      ]);
    } catch (error) {
      console.error("Failed to load referrals:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const referralCode = stats?.referral_code ?? user?.referral_code ?? "";

  const referralUrl =
    stats?.referral_url ?? `https://klickcard.app/ref/${referralCode}`;

  const handleCopy = async () => {
    if (!referralUrl) {
      Alert.alert("Error", "Referral link is not available.");
      return;
    }

    try {
      await Clipboard.setStringAsync(referralUrl);

      Alert.alert("Copied!", "Your referral link is copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy referral link:", error);
      Alert.alert("Error", "Unable to copy referral link.");
    }
  };

  const handleShare = async () => {
    if (!referralUrl) {
      Alert.alert("Error", "Referral link is not available.");
      return;
    }

    try {
      await Share.share({
        message: `Join KlickCard and start saving! Use my referral link: ${referralUrl}`,
        url: referralUrl,
      });
    } catch (error) {
      // User cancelled or sharing failed.
      console.log("Share cancelled or failed:", error);
    }
  };

  const getStatusStyle = (status?: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      pending: {
        bg: "#fef3c7",
        text: "#92400e",
        label: "Pending",
      },
      qualified: {
        bg: "#dbeafe",
        text: "#1e40af",
        label: "Qualified",
      },
      approved: {
        bg: "#d1fae5",
        text: "#065f46",
        label: "Approved",
      },
      rejected: {
        bg: "#fee2e2",
        text: "#991b1b",
        label: "Rejected",
      },
    };

    return map[status ?? "pending"] ?? map.pending;
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Expo StatusBar */}
        <StatusBar style="inverted" backgroundColor="#6C3DF5" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Refer & Earn</Text>

          <TouchableOpacity
            onPress={() => setSidebarOpen(true)}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6C3DF5"]}
              tintColor="#6C3DF5"
            />
          }
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="gift" size={32} color="#fff" />
            </View>

            <Text style={styles.heroTitle}>Invite & Earn</Text>

            <Text style={styles.heroSubtitle}>
              Share your link. Your friend gets{" "}
              <Text style={styles.heroHighlight}>
                ₱{stats?.referee_reward ?? 25}
              </Text>{" "}
              instantly, and you earn{" "}
              <Text style={styles.heroHighlight}>
                ₱{stats?.referrer_reward ?? 50}
              </Text>{" "}
              when they activate their card.
            </Text>

            {/* Referral Code */}
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>

              <Text style={styles.codeValue}>{referralCode || "—"}</Text>
            </View>

            {/* Actions */}
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={[styles.heroBtn, styles.heroBtnPrimary]}
                onPress={handleCopy}
                activeOpacity={0.8}
              >
                <Ionicons name="copy-outline" size={18} color="#6C3DF5" />

                <Text style={styles.heroBtnPrimaryText}>Copy Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroBtn, styles.heroBtnSecondary]}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons name="share-social-outline" size={18} color="#fff" />

                <Text style={styles.heroBtnSecondaryText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[styles.statIconWrap, { backgroundColor: "#ede9fe" }]}
              >
                <Ionicons name="people" size={18} color="#6C3DF5" />
              </View>

              <Text style={styles.statLabel}>Total Referrals</Text>

              <Text style={styles.statValue}>
                {stats?.total_referrals ?? 0}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[styles.statIconWrap, { backgroundColor: "#fef3c7" }]}
              >
                <Ionicons name="time" size={18} color="#d97706" />
              </View>

              <Text style={styles.statLabel}>Pending</Text>

              <Text style={[styles.statValue, { color: "#d97706" }]}>
                {stats?.pending ?? 0}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[styles.statIconWrap, { backgroundColor: "#d1fae5" }]}
              >
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
              </View>

              <Text style={styles.statLabel}>Approved</Text>

              <Text style={[styles.statValue, { color: "#059669" }]}>
                {stats?.approved ?? 0}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[styles.statIconWrap, { backgroundColor: "#dbeafe" }]}
              >
                <Ionicons name="cash" size={18} color="#2563eb" />
              </View>

              <Text style={styles.statLabel}>Total Earned</Text>

              <Text style={[styles.statValue, { color: "#2563eb" }]}>
                ₱{Number(stats?.total_earnings ?? 0).toFixed(0)}
              </Text>
            </View>
          </View>

          {/* Wallet */}
          <View style={styles.walletCard}>
            <View style={styles.walletLeft}>
              <Text style={styles.walletLabel}>Wallet Balance</Text>

              <Text style={styles.walletValue}>
                ₱{Number(stats?.wallet_balance ?? 0).toFixed(2)}
              </Text>

              <Text style={styles.walletPending}>
                ₱{Number(stats?.pending_earnings ?? 0).toFixed(2)} pending
                approval
              </Text>
            </View>

            <TouchableOpacity
              style={styles.walletBtn}
              // onPress={() => router.push("/wallet")}
              activeOpacity={0.8}
            >
              <Text style={styles.walletBtnText}>View</Text>

              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* How It Works */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share your link</Text>

                <Text style={styles.stepDesc}>
                  Send your referral code to friends and family
                </Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Friend signs up & buys</Text>

                <Text style={styles.stepDesc}>
                  They get ₱{stats?.referee_reward ?? 25} welcome bonus
                  instantly
                </Text>
              </View>
            </View>

            <View style={[styles.stepRow, { marginBottom: 0 }]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>They activate their card</Text>

                <Text style={styles.stepDesc}>
                  You earn ₱{stats?.referrer_reward ?? 50} once approved
                </Text>
              </View>
            </View>
          </View>

          {/* Referral List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
                Your Referrals
              </Text>

              <Text style={styles.sectionCount}>{list.length}</Text>
            </View>

            {loadingList && list.length === 0 ? (
              <ActivityIndicator color="#6C3DF5" style={{ marginTop: 20 }} />
            ) : list.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={48} color="#d1d5db" />

                <Text style={styles.emptyText}>No referrals yet</Text>

                <Text style={styles.emptySubtext}>
                  Share your link to get started!
                </Text>
              </View>
            ) : (
              list.map((ref: any) => {
                const status = getStatusStyle(ref?.status);

                const firstName = ref?.referee?.firstname ?? "";

                const lastName = ref?.referee?.lastname ?? "";

                const initials = firstName?.[0]?.toUpperCase() ?? "U";

                const displayName = lastName
                  ? `${firstName} ${lastName[0]}.`
                  : firstName || "User";

                return (
                  <View
                    key={ref?.referral_id ?? `${ref?.created_at}-${firstName}`}
                    style={styles.refRow}
                  >
                    <View style={styles.refAvatar}>
                      <Text style={styles.refAvatarText}>{initials}</Text>
                    </View>

                    <View style={styles.refInfo}>
                      <Text style={styles.refName}>{displayName}</Text>

                      <Text style={styles.refDate}>
                        {ref?.created_at
                          ? new Date(ref.created_at).toLocaleDateString()
                          : "—"}
                      </Text>
                    </View>

                    <View style={styles.refRight}>
                      <Text style={styles.refReward}>
                        ₱{Number(ref?.reward_amount ?? 0).toFixed(0)}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: status.bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: status.text,
                            },
                          ]}
                        >
                          {status.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  backButton: {
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

  hero: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#6C3DF5",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },

  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },

  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 8,
  },

  heroHighlight: {
    color: "#fde047",
    fontWeight: "800",
  },

  codeBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  codeLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    fontWeight: "700",
  },

  codeValue: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 4,
  },

  heroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },

  heroBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },

  heroBtnPrimary: {
    backgroundColor: "#fff",
  },

  heroBtnPrimaryText: {
    color: "#6C3DF5",
    fontWeight: "700",
    fontSize: 14,
  },

  heroBtnSecondary: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  heroBtnSecondaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    marginTop: 16,
  },

  statCard: {
    width: "46%",
    backgroundColor: "#fff",
    marginHorizontal: "2%",
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },

  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },

  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  walletCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 4,
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },

  walletLeft: {
    flex: 1,
  },

  walletLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },

  walletValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#6C3DF5",
  },

  walletPending: {
    fontSize: 12,
    color: "#d97706",
    marginTop: 2,
  },

  walletBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6C3DF5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  walletBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  sectionCount: {
    fontSize: 13,
    color: "#6C3DF5",
    fontWeight: "700",
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },

  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6C3DF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  stepNumberText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  stepDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    lineHeight: 17,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    borderRadius: 14,
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    marginTop: 8,
  },

  emptySubtext: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },

  refRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },

  refAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f0ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  refAvatarText: {
    color: "#6C3DF5",
    fontWeight: "800",
    fontSize: 15,
  },

  refInfo: {
    flex: 1,
  },

  refName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  refDate: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },

  refRight: {
    alignItems: "flex-end",
  },

  refReward: {
    fontSize: 15,
    fontWeight: "800",
    color: "#059669",
    marginBottom: 4,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
