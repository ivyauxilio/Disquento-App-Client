// Replace with your actual Laravel API URL
// For Android emulator: http://10.0.2.2:8000/api
// For iOS simulator: http://localhost:8000/api
// const API_URL = "http://10.0.2.2:8000/api";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// IMPORTANT: Use the correct URL for your environment
// For Android Emulator: http://10.0.2.2:8000/api
// For iOS Simulator: http://localhost:8000/api
// For Physical Device: http://YOUR_COMPUTER_IP:8000/api

// Let's use a configurable approach
const getApiUrl = () => {
  // You can set this based on environment
  // For now, using Android emulator URL
  return "http://10.0.2.2:8000/api";
};

const API_URL = getApiUrl();

console.log("API URL:", API_URL); // Debug log

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request:", config.method?.toUpperCase(), config.url); // Debug log
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.config.url); // Debug log
    return response;
  },
  (error) => {
    console.error(
      "Response error:",
      error.response?.status,
      error.response?.data,
    );
    return Promise.reject(error);
  },
);

export default api;
