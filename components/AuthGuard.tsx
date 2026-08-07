import { useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { useAppSelector } from "../store/hooks";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    console.log("AuthGuard:", {
      isAuthenticated,
      inAuthGroup,
      inTabsGroup,
      segments,
    });

    // If not authenticated and trying to access protected routes
    if (!isAuthenticated && !inAuthGroup) {
      // router.replace("/(auth)/login");
      router.replace("/login");
      return;
    }

    // If authenticated and trying to access auth routes
    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/dashboard");
      return;
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show nothing while checking auth
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
