import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
const getBaseUrl = () => {
  // Check if running in web or mobile
  if (Platform.OS === "web") {
    // For web environment
    return "https://nursery-gzbt.onrender.com/api/v1/"; // or your API URL for web
  } else {
    // For mobile environment (iOS/Android)
    if (__DEV__) {
      // Development environment

      // Physical device - replace with your computer's IP address

      return "http://127.0.0.1:8000r/api/v1/"; // Replace X with your IP
    }
  }
};
const axiosInstance = axios.create({
  baseURL: "http://192.168.1.48:8000/api/v1/",
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});

export default axiosInstance;
