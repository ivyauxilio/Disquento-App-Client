import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../../components/Button";
import { colors } from "../../theme/colors";

const { width, height } = Dimensions.get("window");

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: string;
  backgroundColor: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Discover Amazing Deals",
    description:
      "Find the best discounts and promotions from your favorite local merchants",
    image: "🎯",
    backgroundColor: "#f5f3ff",
  },
  {
    id: "2",
    title: "Scan & Save Money",
    description:
      "Simply scan the QR code at the merchant to redeem your discount instantly",
    image: "📷",
    backgroundColor: "#ede9fe",
  },
  {
    id: "3",
    title: "Track Your Savings",
    description:
      "Keep track of all your redeemed deals and see how much you've saved",
    image: "💰",
    backgroundColor: "#ddd6fe",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleContinue = async () => {
    // Mark onboarding as completed
    await AsyncStorage.setItem("onboardingCompleted", "true");
    router.replace("/login");
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleContinue();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("onboardingCompleted", "true");
    router.replace("/login");
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageEmoji}>{item.image}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  const isLastSlide = currentIndex === onboardingData.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        {renderPagination()}
        <Button
          title={isLastSlide ? "Get Started" : "Next"}
          onPress={handleNext}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: colors.gray[500],
    fontSize: 16,
    fontWeight: "500",
  },
  imageContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  imageEmoji: {
    fontSize: 120,
  },
  textContainer: {
    flex: 0.4,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.gray[900],
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.purple.main,
  },
});
