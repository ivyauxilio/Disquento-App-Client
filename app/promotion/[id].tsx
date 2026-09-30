import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { default as api } from "../../api/axios";
import { useAppSelector } from "../../store/hooks";
import { colors } from "../../theme/colors";
import { getImageUrl } from "../../utils/image";

export default function PromotionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const [promotion, setPromotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Generate QR code data
  const qrData = JSON.stringify({
    promotion_id: promotion?.promotion_id,
    qr_code: promotion?.qr_code,
    title: promotion?.title,
    user_id: user?.id, // Current user ID
    timestamp: Date.now(),
  });

  const getRedemptionUrl = () => {
    if (!promotion || !user) return "";

    // Base URL for the merchant app (Next.js)
    // const baseUrl = getApiUrl;
    const baseUrl = "http://localhost:3000";
    // process.env.EXPO_PUBLIC_MERCHANT_URL || "https://merchant.disquento.com";

    // Create a unique redemption token
    const token = btoa(
      JSON.stringify({
        promotion_id: promotion.promotion_id,
        user_id: user.uuid,
        user_email: user.email,
        timestamp: Date.now(),
      }),
    );

    return `${baseUrl}/merchant/scan/redeem?token=${encodeURIComponent(token)}`;
  };

  const qrUrl = getRedemptionUrl();

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `Redeem your promotion: ${qrUrl}`,
        title: "Promotion QR Code",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(qrUrl);
    Alert.alert("Copied!", "Redemption URL copied to clipboard");
  };

  const handleRedeemQR = () => {
    setShowQR(!showQR);
    Alert.alert(
      "Show to Merchant",
      "Please show this QR code to the merchant to redeem your promotion.",
      [{ text: "OK" }],
    );
  };

  useEffect(() => {
    const fetchPromotion = async () => {
      if (!id) {
        setError("Promotion ID is missing");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching promotion:", id);
        const response = await api.get(`/client/promotions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API Response:", response.data);

        if (response.data && response.data.data) {
          setPromotion(response.data.data);
        } else {
          setError("Promotion not found");
        }
      } catch (err: any) {
        console.error("Error fetching promotion:", err);
        if (err.response?.status === 404) {
          setError("Promotion not found");
        } else if (err.response?.status === 401) {
          setError("Please login to view this promotion");
        } else {
          setError("Failed to load promotion details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [id, token]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple.main} />
        <Text style={styles.loadingText}>Loading deal...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={["top"]}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!promotion) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>🔍</Text>
          <Text style={styles.errorTitle}>Promotion Not Found</Text>
          <Text style={styles.errorText}>
            This deal may have expired or been removed.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getDiscountText = () => {
    if (promotion.promo_type === "percentage") {
      return `${promotion.value}% OFF`;
    } else if (promotion.promo_type === "fixed") {
      return `₱${promotion.value} OFF`;
    } else if (promotion.promo_type === "bogo") {
      return "Buy 1 Get 1 Free";
    } else if (promotion.promo_type === "free_gift") {
      return "Free Gift";
    }
    return "Special Offer";
  };

  const imageUrl = getImageUrl(
    promotion.poster_thumbnail || promotion.poster_image,
  );

  const remainingUses = promotion?.usage_limit
    ? promotion.usage_limit - (promotion?.used_count || 0)
    : "∞";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#6C3DF5" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        // }
      >
        {/* <ScrollView showsVerticalScrollIndicator={false}> */}
        {/* Header */}
        <View style={[styles.header, { flexDirection: "row" }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deal Details</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        {/* Image */}
        <View style={styles.imageContainer}>
          {promotion.poster_thumbnail || promotion.poster_image ? (
            <Image
              source={imageUrl ? { uri: imageUrl } : undefined}
              style={styles.image}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🛍️</Text>
            </View>
          )}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{getDiscountText()}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{promotion.title}</Text>
          <Text style={styles.merchant}>
            {promotion.merchant?.business_name || "Merchant"}
          </Text>

          {promotion.description && (
            <Text style={styles.description}>{promotion.description}</Text>
          )}

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              <Text style={styles.detailText}>
                {promotion.end_date
                  ? `Valid until ${new Date(promotion.end_date).toLocaleDateString()}`
                  : "No expiry date"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <Text style={styles.detailText}>Available at this merchant</Text>
            </View>
            {promotion.min_order_amount && (
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={20} color="#6b7280" />
                <Text style={styles.detailText}>
                  Min. order: ₱{promotion.min_order_amount}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={20} color="#6b7280" />
              <Text style={styles.detailText}>
                {remainingUses === 0
                  ? "No vouchers remaining"
                  : `${remainingUses} remaining vouchers`}
              </Text>
            </View>
          </View>

          {/* <TouchableOpacity style={styles.redeemButton}>
            <Text style={styles.redeemButtonText}>Redeem Deal</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.redeemButton}
            onPress={handleRedeemQR}
          >
            <Text style={styles.redeemButtonText}>
              {showQR ? "Hide QR Code" : "Redeem at Store"}
            </Text>
          </TouchableOpacity>

          {/* QR Code Display */}
          {showQR && promotion && (
            <View style={styles.qrContainer}>
              <QRCode
                // value={qrData}
                value={qrUrl}
                size={250}
                color="#000"
                backgroundColor="#fff"
              />
              <Text style={styles.qrTitle}>{promotion.title}</Text>
              <Text style={styles.qrSubtitle}>
                Show this to the merchant to redeem
              </Text>
              <Text style={styles.qrCodeText}>Code: {promotion.qr_code}</Text>

              <Text style={styles.urlLabel}>Redemption URL:</Text>
              <Text style={styles.urlText} numberOfLines={1}>
                {qrUrl}
              </Text>
            </View>
          )}

          <View style={styles.qrActions}>
            <TouchableOpacity
              style={styles.qrActionButton}
              onPress={copyToClipboard}
            >
              <Ionicons
                name="copy-outline"
                size={20}
                color={colors.purple.main}
              />
              <Text style={styles.qrActionText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.qrActionButton}
              onPress={handleShareQR}
            >
              <Ionicons
                name="share-outline"
                size={20}
                color={colors.purple.main}
              />
              <Text style={styles.qrActionText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.redeemInfo}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#6b7280"
            />
            <Text style={styles.redeemInfoText}>
              The merchant will scan this QR code to confirm your redemption
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  errorContent: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    height: 56,
    // paddingTop: 50,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.purple.main,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  headerPlaceholder: {
    width: 40,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 250,
    backgroundColor: "#f1f5f9",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  discountBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: colors.purple.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  discountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  merchant: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: "#4b5563",
    marginTop: 12,
    lineHeight: 22,
  },
  detailsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 8,
  },
  redeemButton: {
    marginTop: 24,
    backgroundColor: colors.purple.main,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  qrContainer: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  qrSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  qrCodeText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
    fontFamily: "monospace",
  },

  urlLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  urlText: { fontSize: 12, color: "#1f2937", fontFamily: "monospace" },
  qrActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  qrActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  qrActionText: { color: colors.purple.main, fontSize: 14 },
  redeemInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    width: "100%",
  },
  redeemInfoText: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
  },
});
