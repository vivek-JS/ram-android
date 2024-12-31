import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import SearchablePicker from "../../components/SearchablePicker";
import { useGlobalContext } from "../../context/GlobalProvider";
import {
  getDistrict,
  getStates,
  getTaluks,
  getVillages,
} from "../../components/Helpers/districts";
import axiosInstance from "../../components/api/api_instance";
export const updateUser = async (formData, id) => {
  try {
    // Send PATCH request to the server
    const response = await axiosInstance.patch("/user/updateUser", {
      ...formData,
      id,
    });

    if (response.status === 200) {
      Alert.alert("Success", "Profile updated successfully");
      return response.data; // Return response data if needed
    } else {
      Alert.alert("Error", "Failed to update profile");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    Alert.alert("Error", "An error occurred while updating the profile");
  }
};
const Profile = () => {
  const { user, setUser } = useGlobalContext();
  const {
    name,
    email,
    type,
    phoneNumber,
    _id,
    defaultVillage,
    defaultTaluka,
    defaultDistrict,
    defaultState,
  } = user?.response?.data || {};
  console.log("user", defaultTaluka);
  const [isEditable, setIsEditable] = useState(false); // Toggle edit mode
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showTalukaPicker, setShowTalukaPicker] = useState(false);
  const [showVillagePicker, setShowVillagePicker] = useState(false);

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTaluka] = useState([]);
  const [villages, setVillages] = useState([]);

  const [formData, setFormData] = useState({
    defaultVillage: defaultVillage || "",
    defaultTaluka: defaultTaluka || "",
    defaultDistrict: defaultDistrict || "",
    defaultState: defaultState || "",
    name: name || "",
    type: type || "",
    phoneNumber: phoneNumber || "",
  });
  console.log(formData);
  useEffect(() => {
    console.log("formData");

    getStates(setStates);
  }, []);
  console.log("states", states);

  useEffect(() => {
    getDistrict(setDistricts, formData?.defaultState);
  }, [formData?.defaultState]);

  useEffect(() => {
    getTaluks(setTaluka, formData?.defaultState, formData?.defaultDistrict);
  }, [formData?.defaultDistrict]);

  useEffect(() => {
    if (formData?.defaultDistrict && formData?.defaultTaluka) {
      getVillages(
        setVillages,
        formData?.defaultTaluka,
        formData?.defaultDistrict,
        formData?.defaultState
      );
    }
  }, [formData?.defaultTaluka, formData?.defaultDistrict]);

  const handleSave = async () => {
    try {
      const updatedData = await updateUser(formData, _id);
      if (updatedData) {
        setUser((prevUser) => ({
          ...prevUser,
          ...formData, // Merge updated fields
        }));

        console.log("Profile updated:", updatedData);
        setIsEditable(false); // Exit edit mode upon successful save
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <SafeAreaView className="bg-gray-100 h-full">
      <ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Section 1: User Details */}
          <View className="p-4 bg-primary rounded-b-3xl shadow-lg mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-white">
                Profile Details
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (isEditable) {
                    handleSave(); // Save changes
                  } else {
                    setIsEditable(true); // Enable edit mode
                  }
                }}
                className="bg-white px-4 py-2 rounded-full"
              >
                <Text className="text-primary font-medium">
                  {isEditable ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mb-4">
              <Text className="text-gray-100 mb-1">Name</Text>
              <TextInput
                value={formData.name}
                onChangeText={(value) =>
                  setFormData({ ...formData, name: value })
                }
                className={`p-3 ${
                  isEditable ? "bg-white" : "bg-gray-200"
                } rounded-lg`}
                editable={isEditable}
                placeholder="Enter your name"
              />
            </View>
            <View className="mb-4">
              <Text className="text-gray-100 mb-1">Job Title</Text>
              <TextInput
                value={formData.type}
                onChangeText={(value) =>
                  setFormData({ ...formData, type: value })
                }
                className={`p-3 ${
                  isEditable ? "bg-white" : "bg-gray-200"
                } rounded-lg`}
                editable={isEditable}
                placeholder="Enter your job title"
              />
            </View>
            <View>
              <Text className="text-gray-100 mb-1">phoneNumber Number</Text>
              <Text className="p-3 bg-gray-200 rounded-lg text-gray-700">
                {formData.phoneNumber}
              </Text>
            </View>
          </View>

          {/* Section 2: Location Details */}
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              Default Settings
            </Text>
            {/* State Picker */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">State</Text>
              <TouchableOpacity
                onPress={
                  () => isEditable && setShowStatePicker(true) // Picker only opens in edit mode
                }
                className="border border-gray-300 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {states.find((opt) => opt.value === formData.defaultState)
                    ?.label || "Select State"}
                </Text>
                {isEditable && <AntDesign name="down" size={16} color="gray" />}
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showStatePicker}
                onClose={() => setShowStatePicker(false)}
                onSelect={(value) =>
                  setFormData({ ...formData, defaultState: value })
                }
                options={states}
                selectedValue={formData.defaultState}
                title="Select State"
              />
            </View>

            {/* District Picker */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">District</Text>
              <TouchableOpacity
                onPress={
                  () => isEditable && setShowDistrictPicker(true) // Picker only opens in edit mode
                }
                className="border border-gray-300 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {districts.find(
                    (opt) => opt.value === formData.defaultDistrict
                  )?.label || "Select District"}
                </Text>
                {isEditable && <AntDesign name="down" size={16} color="gray" />}
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showDistrictPicker}
                onClose={() => setShowDistrictPicker(false)}
                onSelect={(value) =>
                  setFormData({ ...formData, defaultDistrict: value })
                }
                options={districts}
                selectedValue={formData.defaultDistrict}
                title="Select District"
              />
            </View>

            {/* Taluka Picker */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Taluka</Text>
              <TouchableOpacity
                onPress={
                  () => isEditable && setShowTalukaPicker(true) // Picker only opens in edit mode
                }
                className="border border-gray-300 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {talukas.find((opt) => opt.value === formData.defaultTaluka)
                    ?.label || "Select Taluka"}
                </Text>
                {isEditable && <AntDesign name="down" size={16} color="gray" />}
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showTalukaPicker}
                onClose={() => setShowTalukaPicker(false)}
                onSelect={(value) =>
                  setFormData({ ...formData, defaultTaluka: value })
                }
                options={talukas}
                selectedValue={formData.talukas}
                title="Select Taluka"
              />
            </View>

            {/* Village Picker */}
            <View>
              <Text className="text-gray-700 mb-1">Village</Text>
              <TouchableOpacity
                onPress={
                  () => isEditable && setShowVillagePicker(true) // Picker only opens in edit mode
                }
                className="border border-gray-300 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {villages.find((opt) => opt.value === formData.defaultVillage)
                    ?.label || "Select Village"}
                </Text>
                {isEditable && <AntDesign name="down" size={16} color="gray" />}
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showVillagePicker}
                onClose={() => setShowVillagePicker(false)}
                onSelect={(value) =>
                  setFormData({ ...formData, defaultVillage: value })
                }
                options={villages}
                selectedValue={formData.defaultVillage}
                title="Select Village"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
