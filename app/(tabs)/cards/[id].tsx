import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../../api/axios";
import { useAppSelector } from "../../../store/hooks";
import { colors } from "../../../theme/colors";

// Define the status type
type CardStatus = "active" | "inactive" | "lost" | "expired";

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchCardDetails();
  }, [id]);

  const fetchCardDetails = async () => {
    try {
      const response = await api.get(`/client/cards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCardDetails(response.data.data);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("Error fetching card details:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCardDetails();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My Card Number: ${cardDetails.card?.full_card_number}`,
        title: "KlickCard",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const getStatusColorAlt = (status: string): string => {
    const statusColors = {
      active: "#10b981",
      inactive: "#6b7280",
      lost: "#ef4444",
      expired: "#f59e0b",
    };
    return (statusColors as Record<string, string>)[status] || "#6b7280";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple.main} />
      </SafeAreaView>
    );
  }

  if (!cardDetails.card) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="card-outline" size={64} color="#9ca3af" />
          <Text style={styles.errorText}>Card not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.errorButton}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Card Details</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.cardContainer}>
          <View
            style={[
              styles.cardWrapper,
              { backgroundColor: colors.purple.main },
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardBrand}>KlickCard</Text>
              <View style={styles.cardStatus}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: getStatusColorAlt(
                        cardDetails.card.status,
                      ),
                    },
                  ]}
                />
                <Text style={styles.cardStatusText}>
                  {cardDetails.card.status}
                </Text>
              </View>
            </View>

            <Text style={styles.cardNumber}>
              {cardDetails.card.card_number}
            </Text>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardLabel}>Balance</Text>
                <Text style={styles.cardValue}>
                  ₱{cardDetails.card.balance}
                </Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Points</Text>
                <Text style={styles.cardValue}>{cardDetails.card.points}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowQR(!showQR)}
          >
            <Ionicons
              name="qr-code-outline"
              size={24}
              color={colors.purple.main}
            />
            <Text style={styles.actionButtonText}>Show QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDisabled]}
            onPress={() =>
              Alert.alert("Coming Soon", "Lock card feature coming soon")
            }
          >
            <Ionicons name="lock-closed-outline" size={24} color="#9ca3af" />
            <Text
              style={[styles.actionButtonText, styles.actionButtonTextDisabled]}
            >
              Lock Card
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR Code */}
        {showQR && (
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={cardDetails.card.card_qr_code}
                size={200}
                color="#1a1a2e"
                backgroundColor="#fff"
              />
            </View>
            <Text style={styles.qrLabel}>Scan to view card details</Text>
            <Text style={styles.qrSubtext}>
              Share this QR code with merchants
            </Text>
          </View>
        )}

        {/* Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((txn) => (
              <View key={txn.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionIcon}>
                    <Ionicons
                      name="receipt-outline"
                      size={20}
                      color="#6b7280"
                    />
                  </View>
                  <View>
                    <Text style={styles.transactionTitle}>
                      {txn.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(txn.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      txn.type === "credit" ? styles.credit : styles.debit,
                    ]}
                  >
                    {txn.type === "credit" ? "+" : "-"}₱{txn.amount}
                  </Text>
                  <Text style={styles.transactionPoints}>
                    +{txn.points} pts
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyTransactionsText}>
                No recent activity
              </Text>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 16,
  },
  errorButton: {
    color: colors.purple.main,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  shareButton: {
    padding: 4,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardWrapper: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardBrand: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cardStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardStatusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  cardNumber: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  cardValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtonTextDisabled: {
    color: "#9ca3af",
  },
  qrContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginTop: 12,
  },
  qrSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  transactionsContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  transactionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  viewAllText: {
    fontSize: 14,
    color: colors.purple.main,
    fontWeight: "500",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  transactionDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  credit: {
    color: "#10b981",
  },
  debit: {
    color: "#ef4444",
  },
  transactionPoints: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "right",
  },
  emptyTransactions: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyTransactionsText: {
    color: "#6b7280",
    fontSize: 14,
  },
});
