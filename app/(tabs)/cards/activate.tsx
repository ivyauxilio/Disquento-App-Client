import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../../api/axios";
import { useAppSelector } from "../../../store/hooks";
import { colors } from "../../../theme/colors";

export default function ActivateCardScreen() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"enter" | "confirm" | "success">("enter");
  const [cardDetails, setCardDetails] = useState<any>(null);
  const inputRef = useRef<TextInput>(null);

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Format as XXXX XXXX XXXX XXXX
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };

  const handleActivate = async () => {
    const cleanedNumber = cardNumber.replace(/\s/g, "");
    if (cleanedNumber.length < 10) {
      Alert.alert("Invalid Card", "Please enter a valid card number.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        "/client/cards/activate",
        {
          card_number: cleanedNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCardDetails(response.data.data);
      setStep("success");
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Activation Failed",
        error.response?.data?.message ||
          "Unable to activate card. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push("/");
    // router.replace("/(tabs)/cards");
  };

  const copyCardNumber = async () => {
    await Clipboard.setStringAsync(cardDetails?.card_number || "");
    Alert.alert("Copied!", "Card number copied to clipboard");
  };

  if (step === "success") {
    return (
      <SafeAreaView style={styles.successContainer} edges={["top"]}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Card Activated! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Your physical card is now ready to use. Start earning rewards at
            partner merchants.
          </Text>

          <View style={styles.cardPreview}>
            <View style={styles.cardPreviewHeader}>
              <Text style={styles.cardPreviewLabel}>Card Number</Text>
              <TouchableOpacity onPress={copyCardNumber}>
                <Ionicons
                  name="copy-outline"
                  size={20}
                  color={colors.purple.main}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardPreviewNumber}>
              {cardDetails?.card_number.replace(/(.{4})/g, "$1 ")}
            </Text>
            <View style={styles.cardPreviewRow}>
              <View>
                <Text style={styles.cardPreviewLabel}>Balance</Text>
                <Text style={styles.cardPreviewValue}>
                  ₱{cardDetails?.balance || 0}
                </Text>
              </View>
              <View>
                <Text style={styles.cardPreviewLabel}>Points</Text>
                <Text style={styles.cardPreviewValue}>
                  {cardDetails?.points || 0}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.successButton}
            onPress={handleContinue}
          >
            <Text style={styles.successButtonText}>Go to My Cards</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Activate Card</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Steps */}
          <View style={styles.stepsContainer}>
            <View style={styles.stepIndicator}>
              <View
                style={[
                  styles.stepDot,
                  step === "enter" && styles.stepDotActive,
                ]}
              />
              <View
                style={[
                  styles.stepLine,
                  step === "enter" && styles.stepLineActive,
                ]}
              />
              <View
                style={[
                  styles.stepDot,
                  step === "confirm" && styles.stepDotActive,
                ]}
              />
            </View>
            <View style={styles.stepLabels}>
              <Text
                style={[
                  styles.stepLabel,
                  step === "enter" && styles.stepLabelActive,
                ]}
              >
                Enter Card
              </Text>
              <Text
                style={[
                  styles.stepLabel,
                  step === "confirm" && styles.stepLabelActive,
                ]}
              >
                Confirm
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="card-outline"
                  size={48}
                  color={colors.purple.main}
                />
              </View>
            </View>

            <Text style={styles.title}>Enter Your Card Number</Text>
            <Text style={styles.subtitle}>
              Enter the 16-digit card number printed on your physical card. You
              can find it on the front of your card.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="XXXX XXXX XXXX XXXX"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                maxLength={19}
                autoFocus
                editable={!loading}
              />
              {cardNumber.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setCardNumber("")}
                >
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.cardSample}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#6b7280"
              />
              <Text style={styles.cardSampleText}>
                Card number is on the front of your physical card
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.activateButton,
                loading && styles.activateButtonDisabled,
              ]}
              onPress={handleActivate}
              disabled={loading || cardNumber.replace(/\s/g, "").length < 10}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.activateButtonText}>Activate Card</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => {
                Alert.alert(
                  "Need Help?",
                  "Contact support at support@disquento.com",
                );
              }}
            >
              <Text style={styles.helpButtonText}>
                Need help finding your card number?
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  headerPlaceholder: {
    width: 40,
  },
  stepsContainer: {
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  stepDotActive: {
    backgroundColor: colors.purple.main,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.purple.main,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  stepLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  stepLabelActive: {
    color: colors.purple.main,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.purple.light,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: "#1f2937",
    letterSpacing: 2,
    textAlign: "center",
  },
  clearButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  cardSample: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  cardSampleText: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
  },
  activateButton: {
    backgroundColor: colors.purple.main,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  activateButtonDisabled: {
    opacity: 0.6,
  },
  activateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  helpButton: {
    marginTop: 16,
    alignItems: "center",
  },
  helpButtonText: {
    color: colors.purple.main,
    fontSize: 14,
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  successContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  cardPreview: {
    width: "100%",
    backgroundColor: colors.purple.light,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  cardPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardPreviewLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  cardPreviewNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    letterSpacing: 1,
    marginBottom: 16,
  },
  cardPreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardPreviewValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 2,
  },
  successButton: {
    backgroundColor: colors.purple.main,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: "100%",
  },
  successButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
