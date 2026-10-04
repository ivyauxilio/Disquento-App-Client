import { Stack } from "expo-router";

import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AuthGuard } from "../components/AuthGuard";
import CustomSplashScreen from "../components/CustomSplashScreen";
import { OnboardingCheck } from "../components/OnboardingCheck";
import { persistor, store } from "./../store";

import {
  hydrateCartFromStorage,
  subscribeToCartChanges,
} from "@/store/cartPersistence";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeCart = async () => {
      await hydrateCartFromStorage();

      unsubscribe = subscribeToCartChanges();
    };

    initializeCart();

    return () => {
      unsubscribe?.();
    };
  }, []);

  if (isSplashVisible) {
    return <CustomSplashScreen onFinish={() => setIsSplashVisible(false)} />;
  }

  return (
    <Provider store={store}>
      <CartPersistence />
      <PersistGate loading={null} persistor={persistor}>
        <OnboardingCheck>
          <AuthGuard>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#fff" },
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="referrals"
                options={{
                  presentation: "card",
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="wallet/withdraw"
                options={{ animation: "slide_from_bottom" }} // ✅ nicer UX
              />

              {/* Referral */}
              {/* <Stack.Screen
                name="referrals/index"
                options={{ animation: "slide_from_right" }}
              /> */}
              {/* <Stack.Screen name="wallet/transactions" /> */}
              {/* <Stack.Screen name="wallet/withdraw" /> */}
              <Stack.Screen name="notifications" />
              <Stack.Screen
                name="checkout"
                options={{ animation: "slide_from_bottom" }}
              />
              <Stack.Screen
                name="orders"
                options={{ animation: "slide_from_right" }}
              />
              <Stack.Screen
                name="orders/[id]"
                options={{ animation: "slide_from_right" }}
              />
            </Stack>
          </AuthGuard>
        </OnboardingCheck>
      </PersistGate>
    </Provider>
  );
}

function CartPersistence() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      await hydrateCartFromStorage();
      unsubscribe = subscribeToCartChanges();
    };

    initialize();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return null;
}
