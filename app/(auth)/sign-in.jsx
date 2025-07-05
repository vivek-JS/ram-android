import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { images } from "../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const SignIn = () => {
  const { login } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      setSubmitting(true);

      if (!form.phoneNumber || !form.password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      console.log("🔐 Attempting login with:", {
        phoneNumber: form.phoneNumber,
        password: form.password,
      });

      const result = await login(form.phoneNumber, form.password);

      console.log("📱 Login result:", result);

      if (result.success) {
        console.log("✅ Login successful, navigating to home");
        router.replace("/(tabs)/home");
      } else {
        console.log("❌ Login failed:", result.error);
        Alert.alert("Error", result.error || "Login failed");
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      Alert.alert("Error", "An error occurred during sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Header Section with Gradient */}
          <LinearGradient
            colors={["#4CAF50", "#2E7D32", "#1B5E20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-48 rounded-b-[30px]"
          >
            <View className="flex-1 justify-center items-center px-6">
              {/* Logo */}
              <Image
                source={images.logoram}
                resizeMode="contain"
                className="w-32 h-16 mb-2"
              />

              {/* Welcome Text */}
              <Text className="text-white text-2xl font-bold text-center mb-1">
                राम बायोटेक
              </Text>
              <Text className="text-white text-lg font-semibold text-center">
                नर्सरी मैनेजमेंट सिस्टम
              </Text>
            </View>
          </LinearGradient>

          {/* Login Form Section */}
          <View className="flex-1 px-6 pt-6">
            {/* Welcome Back */}
            <View className="mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-1">
                स्वागत है! 👋
              </Text>
              <Text className="text-gray-600 text-sm">
                अपने खाते में लॉगिन करें
              </Text>
            </View>

            {/* Phone Number Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2 text-sm">
                मोबाइल नंबर
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <Ionicons name="call" size={16} color="#4CAF50" />
                </View>
                <TextInput
                  value={form.phoneNumber}
                  onChangeText={(text) =>
                    setForm({ ...form, phoneNumber: text })
                  }
                  placeholder="अपना मोबाइल नंबर दर्ज करें"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className="bg-gray-50 border-2 border-gray-200 rounded-lg px-10 py-3 text-sm"
                  style={{ fontFamily: "Poppins-Regular" }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2 text-sm">
                पासवर्ड
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-3 z-10">
                  <Ionicons name="lock-closed" size={16} color="#4CAF50" />
                </View>
                <TextInput
                  value={form.password}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                  placeholder="अपना पासवर्ड दर्ज करें"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  secureTextEntry={!showPassword}
                  className="bg-gray-50 border-2 border-gray-200 rounded-lg px-10 py-3 text-sm"
                  style={{ fontFamily: "Poppins-Regular" }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 z-10"
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={16}
                    color="#4CAF50"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg mb-4 ${
                isSubmitting ? "bg-gray-400" : "bg-green-600"
              }`}
              style={{
                shadowColor: "#4CAF50",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <View className="flex-row justify-center items-center">
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <Text className="text-white font-semibold text-base">
                      लॉगिन हो रहा है...
                    </Text>
                  </View>
                ) : (
                  <>
                    <Ionicons
                      name="log-in"
                      size={18}
                      color="white"
                      className="mr-2"
                    />
                    <Text className="text-white font-semibold text-base ml-2">
                      लॉगिन करें
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Footer */}
            <View className="mt-auto mb-4">
              <Text className="text-gray-500 text-center text-xs">
                नर्सरी प्रबंधन के लिए विश्वसनीय समाधान
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
