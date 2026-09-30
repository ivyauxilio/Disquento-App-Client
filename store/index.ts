import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import { PersistPartial } from "redux-persist/es/persistReducer";
import authReducer from "./slices/authSlice";
import notificationReducer from "./slices/notificationSlice";
import productReducer from "./slices/productSlice";
import referralReducer from "./slices/referralSlice";
import transactionReducer from "./slices/transactionSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  // wallet: walletReducer,
  referrals: referralReducer,
  transactions: transactionReducer,
  notifications: notificationReducer,
  products: productReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

// export type RootState = ReturnType<typeof store.getState>;
export type RootState = ReturnType<typeof rootReducer> & PersistPartial;
export type AppDispatch = typeof store.dispatch;
