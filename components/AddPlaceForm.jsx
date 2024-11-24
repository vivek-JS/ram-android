import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AddPlaceForm = ({ navigation }) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    location: "",
    dateRange: "",
    price: "",
    image: "",
  });

  const handleSubmit = () => {
    // Handle form submission
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">Add New Place</Text>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 mb-2">Location</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter location"
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Date Range</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter date range"
                value={formData.dateRange}
                onChangeText={(text) =>
                  setFormData({ ...formData, dateRange: text })
                }
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Price per night</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter price"
                keyboardType="numeric"
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Image URL</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter image URL"
                value={formData.image}
                onChangeText={(text) =>
                  setFormData({ ...formData, image: text })
                }
              />
            </View>
          </View>
        </ScrollView>

        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-500 p-4 rounded-lg items-center"
          >
            <Text className="text-white font-bold text-lg">Add Place</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddPlaceForm;
