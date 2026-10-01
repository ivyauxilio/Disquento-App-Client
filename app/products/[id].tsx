// app/products/[id].tsx

import { productAPI } from "@/api/products";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getImageUrl } from "../../utils/image";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await productAPI.show(id);
        setProduct(res.data.product);
      } catch (e) {
        Alert.alert("Error", "Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#6C3DF5" size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!product) return null;

  const price = Number(product.price);
  const discountedPrice = product.discounted_price
    ? Number(product.discounted_price)
    : price;
  const hasDiscount = discountedPrice < price;

  const imageUrl = getImageUrl(product.image_url);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="heart-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageWrap}>
          {product.image_url ? (
            <Image
              source={imageUrl ? { uri: imageUrl } : undefined}
              style={styles.image}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={80} color="#c4b5fd" />
            </View>
          )}
          {hasDiscount && (
            <View style={styles.discountRibbon}>
              <Text style={styles.discountRibbonText}>
                -{Math.round(((price - discountedPrice) / price) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.meta}>
            {product.unit}
            {product.brand ? ` • ${product.brand}` : ""}
            {product.category ? ` • ${product.category}` : ""}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₱{discountedPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₱{price.toFixed(2)}</Text>
            )}
          </View>

          {/* Stock */}
          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                {
                  backgroundColor:
                    product.stock_quantity > 10
                      ? "#059669"
                      : product.stock_quantity > 0
                        ? "#d97706"
                        : "#dc2626",
                },
              ]}
            />
            <Text style={styles.stockText}>
              {product.stock_quantity > 10
                ? "In Stock"
                : product.stock_quantity > 0
                  ? `Only ${product.stock_quantity} left`
                  : "Out of Stock"}
            </Text>
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Quantity + Add to cart */}
          <View style={styles.qtyRow}>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(Math.max(1, qty - 1))}
              >
                <Ionicons name="remove" size={18} color="#6C3DF5" />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(qty + 1)}
              >
                <Ionicons name="add" size={18} color="#6C3DF5" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtotal}>
              Subtotal: ₱{(discountedPrice * qty).toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={() => {
              // TODO: dispatch(addToCart({ product, qty }))
              Alert.alert("Added", `${qty} × ${product.name} added to cart`);
              router.back();
            }}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginHorizontal: 8,
  },

  imageWrap: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f9fafb",
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  discountRibbon: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountRibbonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  body: {
    padding: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  meta: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginTop: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#6C3DF5",
  },
  originalPrice: {
    fontSize: 16,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 20,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 16,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f0ff",
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#6C3DF5",
  },
  subtotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6C3DF5",
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#6C3DF5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
