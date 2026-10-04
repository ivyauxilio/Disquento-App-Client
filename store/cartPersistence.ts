// src/store/cartPersistence.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { store } from "./index";
import { hydrateCart } from "./slices/cartSlice";

const STORAGE_KEY = "@klickcard_cart";

// Hydrate on app start
export async function hydrateCartFromStorage() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const items = JSON.parse(raw);
      store.dispatch(hydrateCart(items));
    } else {
      store.dispatch(hydrateCart([]));
    }
  } catch (e) {
    console.warn("Failed to hydrate cart:", e);
    store.dispatch(hydrateCart([]));
  }
}

// Save on every change
let lastSaved = "";

export function subscribeToCartChanges(): () => void {
  return store.subscribe(() => {
    const state = store.getState();
    const items = state.cart.items;
    const serialized = JSON.stringify(items);

    if (serialized !== lastSaved) {
      lastSaved = serialized;

      AsyncStorage.setItem(STORAGE_KEY, serialized).catch((e) =>
        console.warn("Failed to save cart:", e),
      );
    }
  });
}
