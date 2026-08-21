import { Stack } from "expo-router";

export default function CardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Card",
        }}
      />

      <Stack.Screen
        name="activate"
        options={{
          title: "Activate Card",
        }}
      />

      <Stack.Screen
        name="[id]"
        options={{
          title: "Card Details",
        }}
      />
    </Stack>
  );
}
