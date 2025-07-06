import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getBaseUrl = () => {
  // Check if running in web or mobile
  if (Platform.OS === "web") {
    // For web environment
    return "https://nursery-gzbt.onrender.com/api/v1/"; // or your API URL for web
  } else {
    // For mobile environment (iOS/Android)
    // Production environment - use live backend URL
    return "https://nursery-gzbt.onrender.com/api/v1/";
  }
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log(
        "🔑 Request interceptor - Token:",
        token ? "Present" : "Missing"
      );
      console.log("🔑 Request URL:", config.url);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Authorization header set");
      } else {
        console.log("❌ No token found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${getBaseUrl()}auth/refresh-token`,
            {
              refreshToken: refreshToken,
            }
          );

          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data;

            await AsyncStorage.setItem("accessToken", accessToken);
            await AsyncStorage.setItem("refreshToken", newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Clear tokens and redirect to login
        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
