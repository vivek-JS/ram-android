import { Modal, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure you have expo/vector-icons installed
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  // Picker,
  DatePickerIOS,
  DatePickerAndroid,
  Image,
  PermissionsAndroid,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
// Add this custom SearchablePicker component
const SearchablePicker = ({
  isVisible,
  onClose,
  onSelect,
  options,
  selectedValue,
  title,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) =>
    option?.label?.toString().toLowerCase().includes(searchQuery?.toLowerCase())
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50">
        <View className="bg-white mt-auto h-3/4 rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="p-4">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
              <Ionicons name="search" size={20} color="gray" />
              <TextInput
                className="flex-1 ml-2"
                placeholder="Search..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="gray" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Options List */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item.value, item.label, item);
                  onClose();
                }}
                className={`p-4 border-b border-gray-100 flex-row justify-between items-center ${
                  selectedValue === item.value ? "bg-blue-50" : ""
                }`}
              >
                <Text
                  className={`text-lg ${
                    selectedValue === item.value
                      ? "text-blue-500 font-semibold"
                      : ""
                  }`}
                >
                  {item.label}
                </Text>
                {selectedValue === item.value && (
                  <Ionicons name="checkmark" size={24} color="#3b82f6" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};
export default SearchablePicker;
