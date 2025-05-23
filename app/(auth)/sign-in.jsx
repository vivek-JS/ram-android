import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import axiosInstance from "../../components/api/api_instance";
const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const fetchNames = async () => {
    try {
      setSubmitting(true);

      if (!form.email || !form.password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      const payload = {
        phoneNumber: parseInt(form.email),
        password: form.password,
      };

      const response = await axiosInstance.post("/user/login", payload);
      console.log(response);
      // Handle successful login
      if (response.data) {
        setUser(response.data);
        setIsLogged(true);
        // Alert.alert("Success", "User signed in successfully");
        router.replace("/home");
      }
    } catch (error) {
      // Detailed error handling
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during sign in";

      Alert.alert("Error", errorMessage);
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
            className="w-[400px] h-[150
            px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            राम बायोटेक{" "}
          </Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign In"
            handlePress={fetchNames}
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
