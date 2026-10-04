import { logoutUser } from "@/store/slices/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.78;

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    label: "Home",
    icon: "home-outline",
    route: "/(tabs)",
  },
  {
    label: "My Wallet",
    icon: "wallet-outline",
    route: "/(tabs)/wallet",
  },
  { label: "Withdraw", icon: "cash-outline", route: "/wallet/withdraw" },
  { label: "Refer & Earn", icon: "gift-outline", route: "/referrals/index" },
  {
    label: "Transactions",
    icon: "swap-horizontal-outline",
    route: "/wallet/transactions",
  },
  {
    label: "Notifications",
    icon: "notifications-outline",
    route: "/notifications",
  },
  {
    label: "Promotions",
    icon: "pricetags-outline",
    route: "/promotions",
  },
  {
    label: "My Card",
    icon: "card-outline",
    route: "/cards",
  },
  {
    label: "My Orders",
    icon: "receipt-outline",
    route: "/orders",
  },
  { label: "My Cart", icon: "cart-outline", route: "/cart" },
];

const secondaryItems = [
  {
    label: "Profile",
    icon: "person-outline",
    route: "/profile",
  },
  {
    label: "Settings",
    icon: "settings-outline",
    route: "/settings",
  },
  {
    label: "Help & Support",
    icon: "help-circle-outline",
    route: "/help",
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((s: any) => s.auth);

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),

      Animated.timing(backdropOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen, translateX, backdropOpacity]);

  const navigateTo = (route: string) => {
    onClose();

    setTimeout(() => {
      router.push(route as any);
    }, 260);
  };

  const handleLogout = async () => {
    onClose();

    setTimeout(async () => {
      try {
        await dispatch(logoutUser() as any);
        router.replace("/(auth)/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }, 260);
  };

  const handleClose = () => {
    console.log("Sidebar close pressed");
    onClose();
  };

  return (
    <View style={styles.overlay} pointerEvents={isOpen ? "auto" : "none"}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          {/* User Header */}
          <View style={styles.userHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.firstname?.[0] || "U").toUpperCase()}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.firstname || "User"} {user?.lastname || ""}
              </Text>

              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || ""}
              </Text>
            </View>

            {/* CLOSE BUTTON */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{
                top: 15,
                bottom: 15,
                left: 15,
                right: 15,
              }}
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Wallet */}
          <View style={styles.walletMini}>
            <View>
              <Text style={styles.walletLabel}>Wallet Balance</Text>

              <Text style={styles.walletValue}>
                ₱{Number(user?.wallet_balance ?? 0).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.walletAction}
              onPress={() => navigateTo("/(tabs)/wallet")}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-forward" size={16} color="#6C3DF5" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
          >
            {/* Main Menu */}
            <Text style={styles.sectionLabel}>MENU</Text>

            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItem}
                onPress={() => navigateTo(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon as any} size={20} color="#6C3DF5" />
                </View>

                <Text style={styles.menuLabel}>{item.label}</Text>

                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            ))}

            {/* Account */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
              ACCOUNT
            </Text>

            {secondaryItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.menuItem}
                onPress={() => navigateTo(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon as any} size={20} color="#6C3DF5" />
                </View>

                <Text style={styles.menuLabel}>{item.label}</Text>

                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </TouchableOpacity>
            ))}

            {/* Logout */}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  {
                    backgroundColor: "#fee2e2",
                  },
                ]}
              >
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              </View>

              <Text style={[styles.menuLabel, { color: "#dc2626" }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>KlickCard v1.0.0</Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 9999,
    elevation: 9999,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,

    width: SIDEBAR_WIDTH,

    backgroundColor: "#fff",

    zIndex: 2,
    elevation: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  safeArea: {
    flex: 1,
  },

  userHeader: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#6C3DF5",

    paddingHorizontal: 16,
    paddingVertical: 20,

    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  avatar: {
    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor: "rgba(255,255,255,0.25)",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },

  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  userInfo: {
    flex: 1,
    marginLeft: 12,
  },

  userName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  userEmail: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
  },

  closeButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.15)",
  },

  walletMini: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#f3f0ff",

    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 12,

    padding: 14,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: "#e9d5ff",
  },

  walletLabel: {
    fontSize: 11,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  walletValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#6C3DF5",
    marginTop: 2,
  },

  walletAction: {
    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: "#fff",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#e9d5ff",
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 1,

    paddingHorizontal: 20,

    marginTop: 12,
    marginBottom: 6,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 20,
    paddingVertical: 14,

    marginHorizontal: 8,

    borderRadius: 12,
  },

  menuIconWrap: {
    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor: "#f3f0ff",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  menuLabel: {
    flex: 1,

    fontSize: 15,
    color: "#1f2937",
    fontWeight: "600",
  },

  logoutItem: {
    marginTop: 12,
  },

  footer: {
    paddingVertical: 12,

    alignItems: "center",

    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },

  footerText: {
    fontSize: 11,
    color: "#9ca3af",
  },
});
