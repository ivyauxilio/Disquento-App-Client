import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAppSelector } from "../store/hooks";
import { colors } from "../theme/colors";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState<
    boolean | null
  >(null);
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem(
          "onboardingCompleted",
        );
        const isCompleted = onboardingCompleted === "true";

        // Check if we're already on the onboarding screen
        const isOnboardingScreen = segments[1] === "onboarding";

        console.log("OnboardingCheck Debug:", {
          isCompleted,
          isOnboardingScreen,
          isAuthenticated,
          segments,
        });

        // If onboarding is not completed and we're not on the onboarding screen
        if (!isCompleted && !isOnboardingScreen && !isAuthenticated) {
          setShouldShowOnboarding(true);
        } else {
          setShouldShowOnboarding(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setShouldShowOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [segments, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && shouldShowOnboarding) {
      console.log("Redirecting to onboarding...");
      router.replace("/onboarding");
    }
  }, [isLoading, shouldShowOnboarding]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.purple.main} />
      </View>
    );
  }

  // Don't render children if we're going to show onboarding
  if (shouldShowOnboarding) {
    return null;
  }

  return <>{children}</>;
}
