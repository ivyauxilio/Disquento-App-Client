import { Stack } from "expo-router";

import { useState } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AuthGuard } from "../components/AuthGuard";
import CustomSplashScreen from "../components/CustomSplashScreen";
import { OnboardingCheck } from "../components/OnboardingCheck";
import { persistor, store } from "./../store";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [isSplashVisible, setIsSplashVisible] = useState(true);

  if (isSplashVisible) {
    return <CustomSplashScreen onFinish={() => setIsSplashVisible(false)} />;
  }

  return (
    <Provider store={store}>
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
            </Stack>
          </AuthGuard>
        </OnboardingCheck>
      </PersistGate>
    </Provider>
  );
}
