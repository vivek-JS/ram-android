import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const { login } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "7588686452", // Pre-filled with test credentials
    password: "432100", // Pre-filled with test credentials
  });

  const handleLogin = async () => {
    try {
      setSubmitting(true);

      if (!form.email || !form.password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      console.log("🔐 Attempting login with:", {
        phoneNumber: form.email,
        password: form.password,
      });

      const result = await login(form.email, form.password);

      console.log("📱 Login result:", result);

      if (result.success) {
        console.log("✅ Login successful, navigating to home");
        // Navigate to home screen
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
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={images.logoram}
            resizeMode="contain"
            className="w-[400px] h-[150px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            राम बायोटेक{" "}
          </Text>

          <Text className="text-sm text-gray-300 mt-2 text-center">
            Test Credentials: 7588686452 / 432100
          </Text>

          <FormField
            title="Phone Number"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            placeholder="Enter your password"
            secureTextEntry
          />

          <CustomButton
            title="Sign In"
            handlePress={handleLogin}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Signup
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
