import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../components/api/api_instance";

// Authentication service for React Native app
export const authService = {
  // Login user
  async login(phoneNumber, password) {
    try {
      console.log("🔐 Login attempt:", { phoneNumber, password });

      const response = await axiosInstance.post("/user/login", {
        phoneNumber: parseInt(phoneNumber),
        password: password,
      });

      console.log("🔐 Login response:", response.data);

      if (
        response.data &&
        response.data.status === "Success" &&
        response.data.data
      ) {
        const { accessToken, refreshToken, user } = response.data.data;

        console.log("✅ Login successful, storing tokens");

        // Store tokens and user data
        await AsyncStorage.multiSet([
          ["accessToken", accessToken],
          ["refreshToken", refreshToken],
          ["user", JSON.stringify(user)],
        ]);

        console.log("💾 Tokens stored successfully");

        return {
          success: true,
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      } else {
        console.log("❌ Invalid response format:", response.data);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      console.log("🚪 Logging out user");
      // Clear all stored data
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);

      console.log("✅ Logout successful, data cleared");
      return { success: true };
    } catch (error) {
      console.error("❌ Logout error:", error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      return !!token;
    } catch (error) {
      console.error("Check authentication error:", error);
      return false;
    }
  },

  // Get stored tokens
  async getTokens() {
    try {
      const [accessToken, refreshToken] = await AsyncStorage.multiGet([
        "accessToken",
        "refreshToken",
      ]);

      return {
        accessToken: accessToken[1],
        refreshToken: refreshToken[1],
      };
    } catch (error) {
      console.error("Get tokens error:", error);
      return { accessToken: null, refreshToken: null };
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axiosInstance.post("/auth/refresh-token", {
        refreshToken: refreshToken,
      });

      if (
        response.data &&
        response.data.status === "Success" &&
        response.data.data
      ) {
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        await AsyncStorage.multiSet([
          ["accessToken", accessToken],
          ["refreshToken", newRefreshToken],
        ]);

        return {
          success: true,
          accessToken: accessToken,
          refreshToken: newRefreshToken,
        };
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      // Clear tokens on refresh failure
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
      throw error;
    }
  },
};
