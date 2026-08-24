import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../api/axios";
import { useAppSelector } from "../../store/hooks";
import { colors } from "../../theme/colors";
import { getImageUrl } from "../../utils/image";

const { width } = Dimensions.get("window");

// ============================================
// TYPES
// ============================================

interface Promotion {
  promotion_id: string;
  title: string;
  description: string;
  promo_type: string;
  value: string | number;
  merchant_name?: string;
  merchant_logo?: string;
  distance?: string;
  category?: string;
  is_verified?: boolean;
  poster_image?: string;
  poster_thumbnail?: string;
  discount_text?: string;
  qr_code?: string;
  usage_limit?: number;
  total_usage_limit?: number;
  used_count?: number;
}

// ============================================
// PROMO TYPE CONFIGURATION
// ============================================

const PROMO_TYPES = [
  { id: "all", label: "All Deals", icon: "view-grid-outline" },
  { id: "percentage", label: "Percentage", icon: "percent-outline" },
  { id: "fixed", label: "Fixed Amount", icon: "cash" },
  { id: "bogo", label: "BOGO", icon: "gift-outline" },
  { id: "free_gift", label: "Free Gift", icon: "gift-outline" },
  { id: "free_shipping", label: "Free Shipping", icon: "truck-outline" },
];

const PROMO_TYPE_ICONS: Record<string, string> = {
  percentage: "percent-outline",
  fixed: "cash",
  bogo: "gift-outline",
  free_gift: "gift-outline",
  free_shipping: "truck-outline",
};

const PROMO_TYPE_COLORS: Record<string, string> = {
  percentage: "#8b5cf6",
  fixed: "#3b82f6",
  bogo: "#10b981",
  free_gift: "#f59e0b",
  free_shipping: "#06b6d4",
};

// ============================================
// COMPONENT
// ============================================

export default function ClientDashboard() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [featuredDeals, setFeaturedDeals] = useState<Promotion[]>([]);
  const [nearbyOffers, setNearbyOffers] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPromoType, setSelectedPromoType] = useState("all");

  // Fetch promotions from API
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/client/promotions");
      const data = response.data.data || [];

      const mappedPromotions: Promotion[] = data.map((item: any) => ({
        promotion_id: item.promotion_id,
        title: item.title,
        description: item.description || "",
        promo_type: item.promo_type,
        value: item.value,
        merchant_name: item.merchant?.business_name || "Merchant",
        merchant_logo: item.merchant?.logo_url || null,
        category: item.category || item.merchant?.category || "General",
        is_verified: item.status === "active",
        poster_image: item.poster_image || null,
        poster_thumbnail: item.poster_thumbnail || null,
        discount_text: getDiscountText(item),
        qr_code: item.qr_code || null,
        usage_limit: item.usage_limit,
        total_usage_limit: item.usage_limit,
        used_count: item.usage_limit,
      }));

      setPromotions(mappedPromotions);

      // Featured deals (first 3)
      const featured = mappedPromotions.slice(0, 3);
      // Nearby offers (next 5)
      const nearby = mappedPromotions.slice(3, 8);

      setFeaturedDeals(featured);
      setNearbyOffers(nearby);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      useMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mock data for development
  const useMockData = () => {
    const mockPromotions: Promotion[] = [
      {
        promotion_id: "1",
        title: "Brew & Co. Artisanal Coffee",
        description: "Get 50% off your first order",
        promo_type: "percentage",
        value: 50,
        merchant_name: "Brew & Co.",
        distance: "0.2 mi away",
        category: "Food",
        is_verified: true,
        discount_text: "50% OFF",
      },
      {
        promotion_id: "2",
        title: "SoundWav Headphones",
        description: "₱500 off premium headphones",
        promo_type: "fixed",
        value: 500,
        merchant_name: "SoundWav",
        distance: "1.5 mi away",
        category: "Retail",
        is_verified: true,
        discount_text: "₱500 OFF",
      },
      {
        promotion_id: "3",
        title: "Buy 1 Get 1 Pizza",
        description: "Buy one pizza, get one free",
        promo_type: "bogo",
        value: 0,
        merchant_name: "Luigi's Pizzeria",
        distance: "0.5 mi",
        category: "Food",
        is_verified: true,
        discount_text: "BOGO",
      },
      {
        promotion_id: "4",
        title: "Free Gym Trial Class",
        description: "Try our premium fitness class for free",
        promo_type: "free_gift",
        value: 0,
        merchant_name: "Core Fitness Studio",
        distance: "1.2 mi",
        category: "Health",
        is_verified: true,
        discount_text: "Free Class",
      },
      {
        promotion_id: "5",
        title: "Urban Threads",
        description: "15% off all apparel",
        promo_type: "percentage",
        value: 15,
        merchant_name: "Urban Threads",
        distance: "2.0 mi",
        category: "Fashion",
        is_verified: true,
        discount_text: "15% OFF",
      },
      {
        promotion_id: "6",
        title: "Free Shipping on Orders ₱1000+",
        description: "No delivery fee on qualifying orders",
        promo_type: "free_shipping",
        value: 0,
        merchant_name: "ShopMart",
        distance: "3.0 mi",
        category: "Retail",
        is_verified: true,
        discount_text: "Free Shipping",
      },
    ];

    setPromotions(mockPromotions);
    setFeaturedDeals(mockPromotions.slice(0, 3));
    setNearbyOffers(mockPromotions.slice(3, 8));
  };

  const getDiscountText = (item: any): string => {
    switch (item.promo_type) {
      case "percentage":
        return `${item.value}% OFF`;
      case "fixed":
        return `₱${item.value} OFF`;
      case "bogo":
        return "Buy 1 Get 1";
      case "free_gift":
        return "Free Gift";
      case "free_shipping":
        return "Free Shipping";
      default:
        return `${item.value}% OFF`;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPromotions();
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Filter promotions by selected promo type
  const getFilteredPromotions = () => {
    if (selectedPromoType === "all") {
      return promotions;
    }
    return promotions.filter((p) => p.promo_type === selectedPromoType);
  };

  const filteredPromotions = getFilteredPromotions();

  // Render promo type chip
  const renderPromoTypeChip = (type: (typeof PROMO_TYPES)[0]) => {
    const isActive = selectedPromoType === type.id;
    const color = isActive ? colors.purple.main : "#6b7280";

    return (
      <TouchableOpacity
        key={type.id}
        style={[styles.promoTypeChip, isActive && styles.promoTypeChipActive]}
        onPress={() => setSelectedPromoType(type.id)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={type.icon as any}
          size={16}
          color={color}
          style={styles.promoTypeIcon}
        />
        <Text
          style={[
            styles.promoTypeChipText,
            isActive && styles.promoTypeChipTextActive,
          ]}
        >
          {type.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render promotion card
  const renderPromotionCard = ({ item }: { item: Promotion }) => {
    const typeColor = PROMO_TYPE_COLORS[item.promo_type] || colors.purple.main;
    const typeIcon = PROMO_TYPE_ICONS[item.promo_type] || "tag";
    const imageUrl = getImageUrl(item.poster_thumbnail || item.poster_image);

    return (
      <TouchableOpacity
        style={styles.promotionCard}
        onPress={() =>
          router.push({
            pathname: "/promotion/[id]",
            params: { id: item.promotion_id },
          })
        }
        activeOpacity={0.9}
      >
        <View style={styles.cardImageContainer}>
          {/* {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardImagePlaceholderText}>🛍️</Text>
            </View>
          )} */}
          {item.poster_thumbnail || item.poster_image ? (
            <Image
              source={imageUrl ? { uri: imageUrl } : undefined}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardImagePlaceholderText}>🛍️</Text>
            </View>
          )}
          <View style={[styles.discountBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.discountBadgeText}>{item.discount_text}</Text>
          </View>
          {item.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardMerchant}>{item.merchant_name}</Text>
          {item.distance && (
            <Text style={styles.cardDistance}>{item.distance}</Text>
          )}
          <View style={styles.cardTypeTag}>
            <Text style={styles.cardTypeTagText}>
              {item.promo_type.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render featured deal
  const renderFeaturedDeal = ({ item }: { item: Promotion }) => {
    const typeColor = PROMO_TYPE_COLORS[item.promo_type] || colors.purple.main;
    const typeIcon = PROMO_TYPE_ICONS[item.promo_type] || "tag";

    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() =>
          router.push({
            pathname: "/promotion/[id]",
            params: { id: item.promotion_id },
          })
        }
        activeOpacity={0.9}
      >
        <View style={styles.featuredImageContainer}>
          {/* {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.featuredImage}
            />
          ) : (
            <View style={styles.featuredImagePlaceholder}>
              <Text style={styles.featuredImagePlaceholderText}>🛍️</Text>
            </View>
          )} */}
          {item.poster_thumbnail || item.poster_image ? (
            <Image
              source={{ uri: item.poster_thumbnail || item.poster_image }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.featuredImagePlaceholder}>
              <Text style={styles.featuredImagePlaceholderText}>🛍️</Text>
            </View>
          )}
          <View
            style={[
              styles.featuredDiscountBadge,
              { backgroundColor: typeColor },
            ]}
          >
            <Ionicons name={typeIcon as any} size={12} color="#fff" />
            <Text style={styles.featuredDiscountText}>
              {item.discount_text}
            </Text>
          </View>
        </View>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.featuredMerchant}>{item.merchant_name}</Text>
          <View style={styles.featuredFooter}>
            {item.distance && (
              <Text style={styles.featuredDistance}>{item.distance}</Text>
            )}
            <View style={styles.featuredTypeTag}>
              <Text style={styles.featuredTypeTagText}>
                {item.promo_type.replace("_", " ").toUpperCase()}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.getDealButton}>
            <Text style={styles.getDealButtonText}>Get Deal</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple.main} />
        <Text style={styles.loadingText}>Loading deals...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="inverted" backgroundColor="#6C3DF5" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hey, {user?.firstname || "Shopper"} 👋
            </Text>
            <Text style={styles.location}>New York City</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#1f2937" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for deals, brands..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Featured Deals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Deals</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {featuredDeals.length > 0 && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={featuredDeals}
            renderItem={renderFeaturedDeal}
            keyExtractor={(item) => item.promotion_id}
            contentContainerStyle={styles.featuredList}
            style={styles.featuredFlatList}
          />
        )}

        {/* Promo Type Filters */}
        <View style={styles.promoTypesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoTypesScroll}
          >
            {PROMO_TYPES.map(renderPromoTypeChip)}
          </ScrollView>
        </View>

        {/* Nearby Offers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Offers</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Promotions Grid */}
        <View style={styles.promotionsGrid}>
          {filteredPromotions.length > 0 ? (
            filteredPromotions.map((item) => (
              <View key={item.promotion_id} style={styles.gridItemWrapper}>
                {renderPromotionCard({ item })}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No deals found</Text>
            </View>
          )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  location: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1f2937",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.purple.main,
  },
  featuredFlatList: {
    marginBottom: 8,
  },
  featuredList: {
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: width * 0.7,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImageContainer: {
    position: "relative",
    height: 140,
    backgroundColor: "#f1f5f9",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
  featuredImagePlaceholderText: {
    fontSize: 40,
  },
  featuredDiscountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featuredDiscountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    marginLeft: 4,
  },
  featuredContent: {
    padding: 14,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  featuredMerchant: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  featuredDistance: {
    fontSize: 12,
    color: "#6b7280",
  },
  featuredTypeTag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  featuredTypeTagText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748b",
  },
  getDealButton: {
    marginTop: 10,
    backgroundColor: colors.purple.main,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  getDealButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  promoTypesContainer: {
    marginVertical: 12,
  },
  promoTypesScroll: {
    paddingHorizontal: 16,
  },
  promoTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  promoTypeChipActive: {
    backgroundColor: colors.purple.main,
  },
  promoTypeIcon: {
    marginRight: 6,
  },
  promoTypeChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  promoTypeChipTextActive: {
    color: "#ffffff",
  },
  promotionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  gridItemWrapper: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  promotionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageContainer: {
    position: "relative",
    height: 120,
    backgroundColor: "#f1f5f9",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
  cardImagePlaceholderText: {
    fontSize: 28,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    marginLeft: 3,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedBadgeText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 3,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  cardMerchant: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  cardDistance: {
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 2,
  },
  cardTypeTag: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  cardTypeTagText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#64748b",
  },
  emptyState: {
    width: "100%",
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
  },
});
