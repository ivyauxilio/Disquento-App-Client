import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAppSelector } from "../store/hooks";
import { colors } from "../theme/colors";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const isOnboarding = segments[1] === "onboarding";

    console.log("AuthGuard Debug:", {
      isAuthenticated,
      isLoading,
      inAuthGroup,
      inTabsGroup,
      isOnboarding,
      segments,
    });

    // If not authenticated and trying to access protected routes
    if (!isAuthenticated && !inAuthGroup && !isOnboarding) {
      console.log("Redirecting to login...");
      router.replace("/(auth)/login");
      return;
    }

    // If authenticated and trying to access auth routes (login/register)
    if (isAuthenticated && inAuthGroup && !isOnboarding) {
      console.log("Redirecting to dashboard...");
      router.replace("/");
      return;
    }

    setIsReady(true);
  }, [isAuthenticated, isLoading, segments]);

  // Show loading while checking auth
  if (isLoading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.purple.main} />
      </View>
    );
  }

  return <>{children}</>;
}
