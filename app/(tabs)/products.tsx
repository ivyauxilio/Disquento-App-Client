// app/(tabs)/products.tsx

import ProductCard from "@/components/ProductCard";
import Sidebar from "@/components/Sidebar";
import {
  fetchCategories,
  fetchProducts,
  resetProducts,
  setProductFilter,
} from "@/store/slices/productSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useDispatch, useSelector } from "react-redux";

export default function GroceryTab() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((s: any) => s.auth);
  const {
    list,
    featured,
    categories,
    pagination,
    filters,
    loading,
    loadingMore,
    refreshing,
  } = useSelector((s: any) => s.products);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cartCount] = useState(3); // TODO: wire to cart slice

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load categories once
  useEffect(() => {
    dispatch(fetchCategories() as any);
    dispatch(
      fetchProducts({ page: 1, featured: true, per_page: 8 } as any) as any,
    );
  }, [dispatch]);

  // Load products on filter/search change
  const load = useCallback(
    (refresh = false) => {
      dispatch(
        fetchProducts({
          page: 1,
          category: filters.category === "all" ? undefined : filters.category,
          search: debouncedSearch || undefined,
          sort: filters.sort,
          refresh,
        } as any) as any,
      );
    },
    [dispatch, filters.category, filters.sort, debouncedSearch],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const onRefresh = () => {
    load(true);
    dispatch(fetchProducts({ page: 1, featured: true } as any) as any);
  };

  const onEndReached = () => {
    if (loadingMore || loading) return;
    if (pagination.current_page < pagination.last_page) {
      dispatch(
        fetchProducts({
          page: pagination.current_page + 1,
          category: filters.category === "all" ? undefined : filters.category,
          search: debouncedSearch || undefined,
          sort: filters.sort,
        } as any) as any,
      );
    }
  };

  const handleCategoryChange = (cat: string) => {
    dispatch(setProductFilter({ category: cat }));
    dispatch(resetProducts());
  };

  const goToProduct = (id: string | number) => {
    router.push({
      pathname: "/products/[id]",
      params: { id: String(id) },
    });
  };
  const addToCart = (product: any) => {
    // TODO: dispatch(addToCart(product))
    console.log("Add to cart:", product.name);
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="inverted" backgroundColor="#6C3DF5" />

        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerEyebrow}>Deliver to</Text>
            <TouchableOpacity
              style={styles.addressRow}
              onPress={() => {
                /* open address picker */
              }}
            >
              <Ionicons name="location" size={14} color="#6C3DF5" />
              <Text style={styles.addressText} numberOfLines={1}>
                Home • 123 Main St
              </Text>
              <Ionicons name="chevron-down" size={14} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Cart */}
          <TouchableOpacity
            style={styles.iconBtn}
            // onPress={() => router.push("/cart")}
          >
            <Ionicons name="cart-outline" size={22} color="#111827" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Menu */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setSidebarOpen(true)}
          >
            <Ionicons name="menu" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* ============================================ */}
        {/* SEARCH */}
        {/* ============================================ */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search fruits, vegetables, meat..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* ============================================ */}
        {/* CONTENT */}
        {/* ============================================ */}
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.product_id ?? item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6C3DF5"
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            <>
              {/* Promo banner */}
              <View style={styles.promoBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoTag}>🎉 LIMITED OFFER</Text>
                  <Text style={styles.promoTitle}>₱50 OFF</Text>
                  <Text style={styles.promoSub}>
                    On your first grocery order
                  </Text>
                </View>
                <View style={styles.promoIcon}>
                  <Ionicons name="gift" size={40} color="#fff" />
                </View>
              </View>

              {/* Categories */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Categories</Text>
                  <TouchableOpacity>
                    <Text style={styles.sectionLink}>See all</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingRight: 16 }}
                >
                  {["all", ...categories].map((cat) => {
                    const active = filters.category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.catChip, active && styles.catChipActive]}
                        onPress={() => handleCategoryChange(cat)}
                      >
                        <Text
                          style={[
                            styles.catText,
                            active && styles.catTextActive,
                          ]}
                        >
                          {cat === "all"
                            ? "All"
                            : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Featured */}
              {featured.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>🔥 Featured</Text>
                    <TouchableOpacity>
                      <Text style={styles.sectionLink}>See all</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12, paddingRight: 16 }}
                  >
                    {featured.map((p: any) => (
                      <TouchableOpacity
                        key={p.product_id}
                        style={styles.featuredCard}
                        onPress={() => goToProduct(p.product_id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.featuredImageWrap}>
                          {p.image_url ? (
                            <Image
                              source={{ uri: p.image_url }}
                              style={styles.featuredImage}
                            />
                          ) : (
                            <View
                              style={[
                                styles.featuredImage,
                                styles.imagePlaceholder,
                              ]}
                            >
                              <Ionicons
                                name="image-outline"
                                size={32}
                                color="#c4b5fd"
                              />
                            </View>
                          )}

                          {p.discounted_price &&
                            Number(p.discounted_price) < Number(p.price) && (
                              <View style={styles.featuredDiscount}>
                                <Text style={styles.featuredDiscountText}>
                                  -
                                  {Math.round(
                                    ((Number(p.price) -
                                      Number(p.discounted_price)) /
                                      Number(p.price)) *
                                      100,
                                  )}
                                  %
                                </Text>
                              </View>
                            )}
                        </View>

                        <Text style={styles.featuredName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={styles.featuredPrice}>
                          ₱
                          {p.discounted_price
                            ? Number(p.discounted_price).toFixed(2)
                            : Number(p.price).toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* All products header */}
              <View style={[styles.section, { marginBottom: 8 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {filters.category === "all"
                      ? "All Products"
                      : filters.category.charAt(0).toUpperCase() +
                        filters.category.slice(1)}
                  </Text>
                  <TouchableOpacity
                    style={styles.sortBtn}
                    onPress={() => {
                      /* open sort sheet */
                    }}
                  >
                    <Ionicons name="swap-vertical" size={14} color="#6b7280" />
                    <Text style={styles.sortText}>Sort</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.center}>
                <ActivityIndicator color="#6C3DF5" size="large" />
                <Text style={styles.loadingText}>Loading products...</Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="basket-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>
                  Try a different category or search term
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => goToProduct(item.product_id)}
              onAdd={() => addToCart(item)}
            />
          )}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator color="#6C3DF5" />
              </View>
            ) : null
          }
        />
      </SafeAreaView>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerEyebrow: {
    fontSize: 10,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "700",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  addressText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    maxWidth: 180,
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
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  // Promo banner
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 18,
    backgroundColor: "#6C3DF5",
    borderRadius: 16,
  },
  promoTag: {
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    letterSpacing: 1,
  },
  promoTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginTop: 4,
  },
  promoSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  promoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Sections
  section: {
    marginBottom: 20,
    paddingLeft: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingRight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  sectionLink: {
    fontSize: 12,
    color: "#6C3DF5",
    fontWeight: "700",
  },

  // Categories
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  catChipActive: {
    backgroundColor: "#6C3DF5",
    borderColor: "#6C3DF5",
  },
  catText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  catTextActive: {
    color: "#fff",
  },

  // Featured
  featuredCard: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    padding: 8,
  },
  featuredImageWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  featuredDiscount: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featuredDiscountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  featuredName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6C3DF5",
    marginTop: 2,
  },

  // Sort
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sortText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },

  // Empty / loading
  center: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    color: "#6b7280",
    marginTop: 10,
    fontSize: 13,
  },
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
  },
});
