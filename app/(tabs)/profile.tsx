// app/(tabs)/profile.tsx

import { logoutUser } from "@/store/slices/authSlice";
import {
  fetchProfile,
  selectProfile,
  selectProfileLoading,
} from "@/store/slices/profileSlice";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// ============================================
// Theme
// ============================================

const COLORS = {
  primary: "#6C3DF5",
  primaryDark: "#5125D6",
  primarySoft: "#F1EDFF",

  background: "#F7F7FB",
  card: "#FFFFFF",

  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  border: "#ECECF2",

  green: "#059669",
  greenSoft: "#E8F8F1",

  blue: "#2563EB",
  blueSoft: "#EAF1FF",

  orange: "#D97706",
  orangeSoft: "#FFF4DD",

  cyan: "#0891B2",
  cyanSoft: "#E7F8FC",

  red: "#EF4444",
  redSoft: "#FEF2F2",
};
type MenuItem = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  route: string;
};
// ============================================
// Menu sections
// ============================================

const accountMenu: MenuItem[] = [
  {
    id: "edit",
    label: "Edit Profile",
    description: "Update your personal information",
    icon: "person-outline",
    color: COLORS.primary,
    background: COLORS.primarySoft,
    route: "/profile/edit",
  },
  {
    id: "addresses",
    label: "Delivery Addresses",
    description: "Manage your saved addresses",
    icon: "location-outline",
    color: COLORS.cyan,
    background: COLORS.cyanSoft,
    route: "/profile/addresses",
  },
  {
    id: "orders",
    label: "My Orders",
    description: "View your order history",
    icon: "receipt-outline",
    color: COLORS.green,
    background: COLORS.greenSoft,
    route: "/orders",
  },
  {
    id: "referrals",
    label: "Refer & Earn",
    description: "Invite friends and earn rewards",
    icon: "gift-outline",
    color: COLORS.orange,
    background: COLORS.orangeSoft,
    route: "/referrals",
  },
];

const settingsMenu: MenuItem[] = [
  {
    id: "notifications",
    label: "Notifications",
    description: "Manage your notification preferences",
    icon: "notifications-outline",
    color: COLORS.primary,
    background: COLORS.primarySoft,
    route: "/settings/notifications",
  },
  {
    id: "security",
    label: "Password & Security",
    description: "Keep your account protected",
    icon: "shield-checkmark-outline",
    color: COLORS.cyan,
    background: COLORS.cyanSoft,
    route: "/profile/security",
  },
  {
    id: "help",
    label: "Help & Support",
    description: "Get help with your account",
    icon: "help-circle-outline",
    color: COLORS.green,
    background: COLORS.greenSoft,
    route: "/help",
  },
  {
    id: "about",
    label: "About KlickCard",
    description: "Learn more about KlickCard",
    icon: "information-circle-outline",
    color: "#6B7280",
    background: "#F3F4F6",
    route: "/about",
  },
];

// ============================================
// Screen
// ============================================

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const profile = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile() as any);
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await dispatch(fetchProfile() as any);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            await dispatch(logoutUser() as any);
            router.replace("/(auth)/login");
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. Are you sure you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          style: "destructive",
          // onPress: () => router.push("/profile/delete-account"),
        },
      ],
    );
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons name="person-outline" size={24} color={COLORS.primary} />
          </View>

          <ActivityIndicator color={COLORS.primary} size="small" />

          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const user = profile?.user ?? profile ?? {};
  const stats = profile?.stats ?? {};

  const firstName = user.firstname || "User";
  const lastName = user.lastname || "";
  const initial = firstName.charAt(0).toUpperCase();

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ============================================ */}
        {/* Purple Hero */}
        {/* ============================================ */}

        <LinearGradient
          colors={[COLORS.primary, "#8158F7", "#9A7AFB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Decorative circles */}
          <View style={styles.heroCircleOne} />
          <View style={styles.heroCircleTwo} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={21} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>My Profile</Text>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/profile/edit")}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              {user.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.avatarEdit}
              onPress={() => router.push("/profile/edit")}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* User info */}
          <Text style={styles.name}>
            {firstName} {lastName}
          </Text>

          <Text style={styles.email}>{user.email}</Text>

          {user.phone ? (
            <View style={styles.phoneRow}>
              <Ionicons
                name="call-outline"
                size={12}
                color="rgba(255,255,255,0.75)"
              />
              <Text style={styles.phone}>{user.phone}</Text>
            </View>
          ) : null}

          {/* Badges */}
          <View style={styles.badges}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#C8F8E1" />
              <Text style={styles.verifiedText}>Verified account</Text>
            </View>

            {memberSince ? (
              <View style={styles.memberBadge}>
                <Ionicons name="calendar-outline" size={13} color="#fff" />
                <Text style={styles.memberText}>{memberSince}</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* ============================================ */}
        {/* Stats */}
        {/* ============================================ */}

        <View style={styles.statsContainer}>
          <StatCard
            icon="bag-handle"
            iconColor={COLORS.blue}
            iconBackground={COLORS.blueSoft}
            value={stats.total_orders ?? 0}
            label="Orders"
            onPress={() => router.push("/orders")}
          />

          <StatCard
            icon="wallet"
            iconColor={COLORS.green}
            iconBackground={COLORS.greenSoft}
            value={`₱${Number(stats.wallet_balance ?? 0).toFixed(0)}`}
            label="Wallet"
            onPress={() => router.push("/wallet/transactions")}
          />

          <StatCard
            icon="people"
            iconColor={COLORS.primary}
            iconBackground={COLORS.primarySoft}
            value={stats.total_referrals ?? 0}
            label="Referrals"
            onPress={() => router.push("/referrals")}
          />

          <StatCard
            icon="star"
            iconColor={COLORS.orange}
            iconBackground={COLORS.orangeSoft}
            value={stats.loyalty_points ?? 0}
            label="Points"
          />
        </View>

        {/* ============================================ */}
        {/* Referral Banner */}
        {/* ============================================ */}

        <TouchableOpacity
          style={styles.referralCard}
          onPress={() => router.push("/referrals")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#F3EEFF", "#EDE7FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.referralGradient}
          >
            <View style={styles.referralIcon}>
              <Ionicons name="gift" size={22} color={COLORS.primary} />
            </View>

            <View style={styles.referralContent}>
              <Text style={styles.referralEyebrow}>REFER & EARN</Text>

              <Text style={styles.referralTitle}>Earn ₱50 per referral</Text>

              <Text style={styles.referralSub}>
                Invite friends and earn rewards together.
              </Text>
            </View>

            <View style={styles.referralArrow}>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ============================================ */}
        {/* Account */}
        {/* ============================================ */}

        <MenuSection
          title="Account"
          items={accountMenu}
          onPress={(route) => router.push(route as any)}
        />

        {/* ============================================ */}
        {/* Settings */}
        {/* ============================================ */}

        <MenuSection
          title="Settings"
          items={settingsMenu}
          onPress={(route) => router.push(route as any)}
        />

        {/* ============================================ */}
        {/* Logout */}
        {/* ============================================ */}

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={19} color={COLORS.red} />
            </View>

            <Text style={styles.logoutText}>Sign out</Text>

            <Ionicons name="chevron-forward" size={17} color="#FCA5A5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color={COLORS.textMuted} />

            <Text style={styles.deleteText}>Delete account</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <View style={styles.versionLine} />
          <Text style={styles.version}>KlickCard • v1.0.0</Text>
          <View style={styles.versionLine} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// Stat Card
// ============================================

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  value: string | number;
  label: string;
  onPress?: () => void;
};

function StatCard({
  icon,
  iconColor,
  iconBackground,
  value,
  label,
  onPress,
}: StatCardProps) {
  const content = (
    <>
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>

      <Text style={styles.statLabel}>{label}</Text>
    </>
  );

  if (!onPress) {
    return <View style={styles.statCard}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {content}
    </TouchableOpacity>
  );
}

// ============================================
// Menu Section
// ============================================

function MenuSection({
  title,
  items,
  onPress,
}: {
  title: string;
  items: MenuItem[];
  onPress: (route: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.menuCard}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, !isLast && styles.menuItemBorder]}
              onPress={() => onPress(item.route)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: item.background,
                  },
                ]}
              >
                <Ionicons name={item.icon} size={19} color={item.color} />
              </View>

              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>

              <View style={styles.chevronContainer}>
                <Ionicons name="chevron-forward" size={16} color="#C4C7D0" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 36,
  },

  // ==========================================
  // Loading
  // ==========================================

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  // ==========================================
  // Hero
  // ==========================================

  hero: {
    minHeight: 350,
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: "hidden",
  },

  heroCircleOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -100,
    right: -70,
  },

  heroCircleTwo: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -90,
    left: -80,
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  // ==========================================
  // Avatar
  // ==========================================

  avatarContainer: {
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 13,
    position: "relative",
  },

  avatarBorder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },

  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitial: {
    color: COLORS.primary,
    fontSize: 38,
    fontWeight: "900",
  },

  avatarEdit: {
    position: "absolute",
    right: -2,
    bottom: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#8764F8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },

  // ==========================================
  // User info
  // ==========================================

  name: {
    color: "#fff",
    textAlign: "center",
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  email: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontSize: 13,
    marginTop: 4,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 4,
  },

  phone: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },

  // ==========================================
  // Badges
  // ==========================================

  badges: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(16,185,129,0.2)",
    borderWidth: 1,
    borderColor: "rgba(200,248,225,0.2)",
  },

  verifiedText: {
    color: "#E7FFF4",
    fontSize: 11,
    fontWeight: "700",
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  memberText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "600",
  },

  // ==========================================
  // Stats
  // ==========================================

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    marginTop: -22,
    zIndex: 10,
    gap: 8,
  },

  statCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: "#1F2937",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  statIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  // ==========================================
  // Referral
  // ==========================================

  referralCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    overflow: "hidden",

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },

  referralGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },

  referralIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  referralContent: {
    flex: 1,
  },

  referralEyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  referralTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },

  referralSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  referralArrow: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // ==========================================
  // Sections
  // ==========================================

  section: {
    marginTop: 23,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
    marginLeft: 2,
  },

  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",

    shadowColor: "#1F2937",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },

  menuItem: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F5",
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuContent: {
    flex: 1,
  },

  menuLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  menuDescription: {
    color: COLORS.textMuted,
    fontSize: 10.5,
    marginTop: 3,
  },

  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F7F7FA",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // ==========================================
  // Bottom actions
  // ==========================================

  bottomSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },

  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  logoutText: {
    flex: 1,
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "800",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 15,
  },

  deleteText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  // ==========================================
  // Version
  // ==========================================

  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: 8,
    gap: 10,
  },

  versionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  version: {
    color: "#C4C7D0",
    fontSize: 10,
    fontWeight: "600",
  },
});
