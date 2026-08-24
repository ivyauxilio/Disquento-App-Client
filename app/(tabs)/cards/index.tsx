import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import React, { ComponentProps, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../../api/axios";
import { useAppSelector } from "../../../store/hooks";
import { colors } from "../../../theme/colors";

// Define the status type
type CardStatus = "active" | "inactive" | "lost" | "expired";
type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface PhysicalCard {
  card_id: string;
  card_number: string;
  status: CardStatus;
  balance: number;
  points: number;
  issued_at: string;
  expires_at: string;
  is_active: boolean;
}

export default function CardsScreen() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [cards, setCards] = useState<PhysicalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await api.get("/client/cards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCards(response.data.data || []);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCards();
  };

  const getStatusColor = (status: CardStatus): string => {
    const statusColors: Record<CardStatus, string> = {
      active: "#10b981",
      inactive: "#6b7280",
      lost: "#ef4444",
      expired: "#f59e0b",
    };
    return statusColors[status] || "#6b7280";
  };

  const getStatusIcon = (status: CardStatus): IoniconName => {
    const icons: Record<CardStatus, IoniconName> = {
      active: "checkmark-circle",
      inactive: "pause-circle",
      lost: "alert-circle",
      expired: "time-outline",
    };
    return icons[status] ?? "help-circle";
  };

  const getStatusLabel = (status: CardStatus): string => {
    const labels: Record<CardStatus, string> = {
      active: "Active",
      inactive: "Inactive",
      lost: "Lost",
      expired: "Expired",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple.main} />
        <Text style={styles.loadingText}>Loading your cards...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaProvider>
        <StatusBar style="inverted" backgroundColor="#6C3DF5" />
        <SafeAreaView style={styles.container} edges={["top"]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>My Cards</Text>
              {/* <Link href="/cards/activate" style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color={colors.purple.main} />
            <Text style={styles.addButtonText}>Activate Card</Text>
          </Link> */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push("/cards/activate")}
              >
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={colors.purple.main}
                />
                <Text style={styles.addButtonText}>Activate Card</Text>
              </TouchableOpacity>
            </View>

            {/* Cards List */}
            {cards.length > 0 ? (
              cards.map((card) => (
                <TouchableOpacity
                  key={card.card_id}
                  style={styles.cardItem}
                  onPress={() => router.push(`/cards/${card.card_id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardLeft}>
                      <View style={styles.cardIcon}>
                        <Ionicons
                          name="card-outline"
                          size={24}
                          color={colors.purple.main}
                        />
                      </View>
                      <View>
                        <Text style={styles.cardNumber}>
                          {card.card_number.replace(/(.{4})/g, "$1 ")}
                        </Text>
                        <Text style={styles.cardBalance}>
                          ₱{card.balance.toLocaleString()} balance
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardRight}>
                      <View style={styles.cardStatus}>
                        <Ionicons
                          name={getStatusIcon(card.status)}
                          size={16}
                          color={getStatusColor(card.status)}
                        />
                        <Text
                          style={[
                            styles.cardStatusText,
                            { color: getStatusColor(card.status) },
                          ]}
                        >
                          {getStatusLabel(card.status)}
                        </Text>
                      </View>
                      <Text style={styles.cardPoints}>{card.points} pts</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="card-outline"
                    size={64}
                    color={colors.gray[300]}
                  />
                </View>
                <Text style={styles.emptyTitle}>No Cards Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Activate your first physical card to start earning rewards
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push("/cards/activate")}
                >
                  <Text style={styles.emptyButtonText}>Activate Your Card</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
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
    color: "#6b7280",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.purple.main,
  },
  cardItem: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.purple.light,
    justifyContent: "center",
    alignItems: "center",
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    letterSpacing: 0.5,
  },
  cardBalance: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  cardStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  cardPoints: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: colors.purple.main,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
