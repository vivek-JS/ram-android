import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { X, ChevronDown } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import axiosInstance from "../components/api/api_instance";
import SearchablePicker from "../components/SearchablePicker";
import { getPolly, gettray } from "../components/Helpers/districts";

const PlantationModal = ({
  visible,
  onClose,
  selectedOutwards,
  batchNumber,
}) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [pollyhouses, setPollyhouses] = useState([]);
  const [trays, setTrays] = useState([]);
  const [showPollyPicker, setShowPollyPicker] = useState(false);
  const [showCavityPicker, setShowCavityPicker] = useState(false);

  const [formState, setFormState] = useState({
    trays: "",
    mortality: "",
    numberOfBottles: "",
    cavity: "",
    pollyhouse: "",
    laboursEngaged: "",
  });

  useEffect(() => {
    gettray(setTrays);
    getPolly(setPollyhouses);
  }, []);

  // Calculate totals
  const totalPlants = selectedOutwards.reduce(
    (sum, item) => sum + item.plants,
    0
  );

  // Calculate totalQuantity based on cavity and trays
  const selectedTray = trays.find((tray) => tray.value === formState.cavity);
  const cavityNumber = selectedTray ? parseInt(selectedTray.label) : 0;
  const numberOfTrays = parseInt(formState.trays) || 0;
  const totalQuantity = cavityNumber * numberOfTrays;

  const totalPlanted = Math.max(
    0,
    totalPlants - Number(formState.mortality || 0)
  );

  const resetForm = () => {
    setFormState({
      trays: "",
      mortality: "",
      numberOfBottles: "",
      cavity: "",
      pollyhouse: "",
      laboursEngaged: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formState.trays ||
      !formState.mortality ||
      !formState.numberOfBottles ||
      !formState.cavity ||
      !formState.pollyhouse ||
      !formState.laboursEngaged
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    Alert.alert(
      "Confirm Submission",
      "Are you sure you want to submit this form?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setLoading(true);

              // Create payload in required format
              const payload = {
                batchId: batchNumber,
                primaryInwardData: {
                  primaryInwardDate: new Date().toISOString(),
                  numberOfBottles: parseInt(formState.numberOfBottles),
                  size: selectedOutwards[0]?.size,
                  cavity: cavityNumber,
                  numberOfTrays: parseInt(formState.trays),
                  totalQuantity,
                  pollyhouse: formState.pollyhouse,
                  laboursEngaged: parseInt(formState.laboursEngaged),
                  mortality: parseInt(formState.mortality),
                  outwardIds: selectedOutwards.map((outward) => outward._id),
                  totalPlants,
                },
              };

              // Make API call
              const response = await axiosInstance.post(
                "laboutward/plant-outward/primary-inward",
                payload
              );

              if (response.data) {
                Alert.alert("Success", "Primary inward added successfully");
                onClose();
                navigation.goBack();
              }
            } catch (error) {
              const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "An error occurred while submitting the form";
              Alert.alert("Error", errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderSummarySection = () => (
    <View className="bg-green-50 rounded-xl p-4 mb-6">
      <Text className="text-lg font-bold text-green-900 mb-3">Summary</Text>
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-green-800">Batch Number:</Text>
          <Text className="font-semibold">#{batchNumber}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-green-800">Size:</Text>
          <Text className="font-semibold">{selectedOutwards[0]?.size}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-green-800">Selected Items:</Text>
          <Text className="font-semibold">{selectedOutwards.length}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-green-800">Total Plants:</Text>
          <Text className="font-semibold">{totalPlants?.toLocaleString()}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-green-800">
            Total Quantity (Cavity × Trays):
          </Text>
          <Text className="font-semibold">
            {totalQuantity?.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSelectedItems = () => (
    <View className="mb-6">
      <Text className="text-lg font-bold text-green-900 mb-3">
        Selected Items
      </Text>
      {selectedOutwards.map((item, index) => (
        <View
          key={item._id || index}
          className="bg-green-50 rounded-lg p-3 mb-2"
        >
          <Text>Plants: {item.plants?.toLocaleString()}</Text>
          <Text>
            Outward Date: {new Date(item.outwardDate).toLocaleDateString()}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderInputSection = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-green-800 font-semibold mb-2">
          Number of Bottles
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl p-3 text-lg"
          keyboardType="numeric"
          value={formState.numberOfBottles}
          onChangeText={(value) => handleInputChange("numberOfBottles", value)}
          placeholder="Enter number of bottles"
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-green-800 font-semibold mb-2">Cavity</Text>
        <TouchableOpacity
          onPress={() => setShowCavityPicker(true)}
          className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
        >
          <Text>
            {trays.find((opt) => opt.value === formState.cavity)?.label ||
              "Select Cavity"}
          </Text>
          <ChevronDown size={20} color="#666" />
        </TouchableOpacity>
        <SearchablePicker
          isVisible={showCavityPicker}
          onClose={() => setShowCavityPicker(false)}
          onSelect={(value) => handleInputChange("cavity", value)}
          options={trays}
          selectedValue={formState.cavity}
          title="Select Cavity"
        />
      </View>

      <View>
        <Text className="text-green-800 font-semibold mb-2">
          Number of Trays
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl p-3 text-lg"
          keyboardType="numeric"
          value={formState.trays}
          onChangeText={(value) => handleInputChange("trays", value)}
          placeholder="Enter number of trays"
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-green-800 font-semibold mb-2">
          Pollyhouse Number
        </Text>
        <TouchableOpacity
          onPress={() => setShowPollyPicker(true)}
          className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center"
        >
          <Text>
            {pollyhouses.find((opt) => opt.value === formState.pollyhouse)
              ?.label || "Select Pollyhouse"}
          </Text>
          <ChevronDown size={20} color="#666" />
        </TouchableOpacity>
        <SearchablePicker
          isVisible={showPollyPicker}
          onClose={() => setShowPollyPicker(false)}
          onSelect={(value) => handleInputChange("pollyhouse", value)}
          options={pollyhouses}
          selectedValue={formState.pollyhouse}
          title="Select Pollyhouse"
        />
      </View>

      <View>
        <Text className="text-green-800 font-semibold mb-2">
          Labours Engaged
        </Text>
        <TextInput
          className="border border-gray-300 rounded-xl p-3 text-lg"
          keyboardType="numeric"
          value={formState.laboursEngaged}
          onChangeText={(value) => handleInputChange("laboursEngaged", value)}
          placeholder="Enter number of labours"
          editable={!loading}
        />
      </View>

      <View>
        <Text className="text-green-800 font-semibold mb-2">Mortality</Text>
        <TextInput
          className="border border-gray-300 rounded-xl p-3 text-lg"
          keyboardType="numeric"
          value={formState.mortality}
          onChangeText={(value) => handleInputChange("mortality", value)}
          placeholder="Enter mortality count"
          editable={!loading}
        />
      </View>

      <View className="bg-blue-50 rounded-xl p-4 mt-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-blue-800 font-bold">Total Planted:</Text>
          <Text className="text-xl font-bold text-blue-900">
            {totalPlanted?.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-green-900">
              Plantation Details
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            {renderSummarySection()}
            {renderSelectedItems()}
            {renderInputSection()}
          </ScrollView>

          {/* Submit Button */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`${
                loading ? "bg-green-400" : "bg-green-600"
              } rounded-xl py-4`}
            >
              <Text className="text-white text-center font-bold text-lg">
                {loading ? "Submitting..." : "Submit Plantation"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PlantationModal;
