import { getImageUrl } from "@/utils/image";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  product: any;
  onPress: () => void;
  onAdd: () => void;
  cartQty?: number;
}

export default function ProductCard({
  product,
  onPress,
  onAdd,
  cartQty = 0,
}: Props) {
  const price = Number(product.price);
  const discountedPrice = product.discounted_price
    ? Number(product.discounted_price)
    : price;
  const hasDiscount = discountedPrice < price;
  const discountPct = hasDiscount
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  const stock = Number(product.stock_quantity ?? 0);
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock === 0;

  const imageUrl = getImageUrl(product.image_url);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isOutOfStock}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        {product.image_url ? (
          <Image
            source={imageUrl ? { uri: imageUrl } : undefined}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={40} color="#c4b5fd" />
          </View>
        )}

        {/* Discount ribbon */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPct}%</Text>
          </View>
        )}

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        {/* Low stock pill */}
        {isLowStock && !isOutOfStock && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Only {stock} left</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₱{discountedPrice.toFixed(2)} </Text>
              <Text style={styles.unit} numberOfLines={1}>
                / {product.unit}
                {product.brand ? ` • ${product.brand}` : ""}
              </Text>
            </View>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₱{price.toFixed(2)}</Text>
            )}
          </View>

          {/* Add button */}
          <TouchableOpacity
            style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
            onPress={onAdd}
            disabled={isOutOfStock}
            activeOpacity={0.7}
          >
            {cartQty > 0 ? (
              <Text style={styles.addBtnQty}>{cartQty}</Text>
            ) : (
              <Ionicons name="add" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 12,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f9fafb",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStockText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  lowStockBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowStockText: {
    color: "#92400e",
    fontSize: 10,
    fontWeight: "700",
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  unit: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6C3DF5",
  },
  originalPrice: {
    fontSize: 11,
    color: "#9ca3af",
    textDecorationLine: "line-through",
    marginTop: 1,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6C3DF5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6C3DF5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  addBtnDisabled: {
    backgroundColor: "#d1d5db",
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtnQty: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
});
