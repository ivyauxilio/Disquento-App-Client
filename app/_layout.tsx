import { Stack } from "expo-router";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AuthGuard } from "../components/AuthGuard";
import { OnboardingCheck } from "../components/OnboardingCheck";
import { persistor, store } from "./../store";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
            </Stack>
          </AuthGuard>
        </OnboardingCheck>
      </PersistGate>
    </Provider>
  );
}
