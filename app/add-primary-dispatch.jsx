import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import SearchablePicker from "../components/SearchablePicker";
import { Loader } from "../components";
import { getBatches, getPolly, gettray } from "../components/Helpers/districts";
import { Info } from "lucide-react-native";
import axiosInstance from "../components/api/api_instance";

const AddPrimaryPlantationForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBatchPicker, setShowBatchPicker] = useState(false);
  const [showPollyPicker, setShowPollyPicker] = useState(false);
  const [batches, setBatches] = useState([]);
  const [trays, settrays] = useState([]);
  const [showCavityPicker, setShowCavityPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [pollyhouses, setPollyhouses] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [batchData, setBatchData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    date: new Date(),
    batchNo: "",
    bottelTaken: "",
    size: "",
    cavity: "",
    noOfTray: "",
    quantity: "0",
    pollyhouseNumber: "",
    laboursEngage: "",
  });
  const getOutwards = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/laboutward/outwards");

      if (response.data) {
        setBatchData(response.data?.data);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching outward data";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getOutwards();
  }, []);
  useEffect(() => {
    getBatches(setBatches);
  }, []);
  useEffect(() => {
    gettray(settrays);
    getPolly(setPollyhouses);
  }, []);
  // Sample batch numbers - replace with actual data
  const sizeOptions = [
    { value: "R1", label: "R1" },
    { value: "R2", label: "R2" },
    { value: "R3", label: "R3" },
  ];
  // Sample pollyhouse numbers - replace with actual data

  // Calculate quantity when cavity or noOfTray changes
  useEffect(() => {
    const selectedTray = trays.find((tray) => tray.value === formData.cavity);
    const cavityNumber = selectedTray ? parseInt(selectedTray.label) : 0;
    const numberOfTrays = parseInt(formData.noOfTray) || 0;
    const quantity = (cavityNumber * numberOfTrays).toString();
    setFormData({ ...formData, quantity });
  }, [formData.cavity, formData.noOfTray, trays]);
  const handleDateChange = (event, date) => {
    if (event.type === "set") {
      setFormData({ ...formData, date: date });
    } else {
      setFormData({ ...formData, date: new Date() });
    }
    setShowDatePicker(false);
  };
  useEffect(() => {
    if (!formData.date || !(formData.date instanceof Date)) {
      setFormData((prev) => ({
        ...prev,
        date: new Date(),
      }));
    }
  }, []);
  // Update the handleSubmit function:
  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.batchNo ||
      !formData.bottelTaken ||
      !formData.size ||
      !formData.cavity ||
      !formData.noOfTray ||
      !formData.pollyhouseNumber ||
      !formData.laboursEngage
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
              const selectedTray = trays.find(
                (tray) => tray.value === formData.cavity
              );
              const cavityNumber = selectedTray
                ? parseInt(selectedTray.label)
                : 0;
              // Create payload in required format
              const payload = {
                batchId: formData.batchNo,
                primaryInwardData: {
                  primaryInwardDate: formData.date
                    ? formData?.date?.toISOString()
                    : new Date(),
                  numberOfBottles: parseInt(formData.bottelTaken),
                  size: formData.size,
                  cavity: cavityNumber,
                  numberOfTrays: parseInt(formData.noOfTray),
                  totalQuantity: parseInt(formData.quantity),
                  pollyhouse: formData.pollyhouseNumber,
                  laboursEngaged: parseInt(formData.laboursEngage),
                },
              };

              // Make API call
              const response = await axiosInstance.post(
                "laboutward/plant-outward/primary-inward",
                payload
              );

              if (response.data) {
                Alert.alert("Success", "Primary inward added successfully");
                router.back();
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
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Loader isLoading={loading} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center p-4 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">Add Primary Dispatch</Text>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 mb-2">Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View className="border border-gray-200 rounded-lg p-3 bg-white">
                  <Text>{formData.date.toDateString()}</Text>
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Batch Number</Text>
              <TouchableOpacity
                onPress={() => setShowBatchPicker(true)}
                className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {batches.find((opt) => opt.value === formData.batchNo)
                    ?.label || "Select Batch"}
                </Text>
                <AntDesign name="down" size={16} color="gray" />
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showBatchPicker}
                onClose={() => setShowBatchPicker(false)}
                onSelect={(value) =>
                  setFormData({ ...formData, batchNo: value })
                }
                options={batches}
                selectedValue={formData.batchNo}
                title="Select Batch"
              />
            </View>
            <View>
              <View className="relative">
                <TextInput
                  className="w-full border border-gray-200 rounded-lg p-3 bg-white pr-10"
                  placeholder="Enter number of bottles"
                  keyboardType="numeric"
                  value={formData.bottelTaken}
                  onChangeText={(text) =>
                    setFormData({ ...formData, bottelTaken: text })
                  }
                  onFocus={() => setShowInfo(true)}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowInfo(!showInfo)}
                >
                  <Info size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <Modal
                visible={showInfo}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowInfo(false)}
              >
                <TouchableOpacity
                  className="flex-1 bg-black/50"
                  activeOpacity={1}
                  onPress={() => setShowInfo(false)}
                >
                  <View className="mt-auto bg-white rounded-t-xl">
                    <View className="p-4">
                      <Text className="text-base font-medium text-gray-700 mb-3">
                        Batch-wise Summary:
                      </Text>

                      <ScrollView className="max-h-96">
                        {batchData.map((batch) => (
                          <View
                            key={batch._id}
                            className="mb-4 border-b border-gray-200 pb-3"
                          >
                            <Text className="text-sm font-bold">
                              Batch #{batch.batchId.batchNumber}
                            </Text>

                            {/* R1 Summary */}
                            {batch?.summary?.R1.totalBottles > 0 && (
                              <View className="ml-2 mt-1">
                                <Text className="text-sm text-gray-600">
                                  R1:
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Total Bottles:{" "}
                                  {batch?.summary?.R1.totalBottles}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Total Plants:{" "}
                                  {batch?.summary?.R1.totalBottles * 10}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Primary Inward Plants:{" "}
                                  {batch?.summary?.R1?.primaryInwardBottles *
                                    10}
                                </Text>
                              </View>
                            )}

                            {/* R2 Summary */}
                            {batch?.summary?.R2?.totalBottles > 0 && (
                              <View className="ml-2 mt-1">
                                <Text className="text-sm text-gray-600">
                                  R2:
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Total Bottles:{" "}
                                  {batch?.summary?.R2.totalBottles}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Total Plants:{" "}
                                  {batch?.summary?.R2.totalBottles * 10}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Primary Inward Plants:{" "}
                                  {batch?.summary?.R2?.primaryInwardBottles *
                                    10}
                                </Text>
                              </View>
                            )}

                            {/* R3 Summary */}
                            {batch?.summary?.R3.totalBottles > 0 && (
                              <View className="ml-2 mt-1">
                                <Text className="text-sm text-gray-600">
                                  R3:
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Total Bottles:{" "}
                                  {batch?.summary?.R3.totalBottles}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Total Plants:{" "}
                                  {batch?.summary?.R3.totalBottles * 8}
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Primary Inward Plants:{" "}
                                  {batch?.summary?.R3?.primaryInwardBottles *
                                    10}
                                </Text>
                              </View>
                            )}

                            {/* Total Summary */}
                            <View className="mt-2 pt-2 border-t border-gray-100">
                              <Text className="text-sm font-medium text-gray-700">
                                Total Primary Inward Bottles:{" "}
                                {batch?.summary?.total?.primaryInwardBottles}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </ScrollView>
                    </View>

                    <TouchableOpacity
                      className="w-full p-4 border-t border-gray-200"
                      onPress={() => setShowInfo(false)}
                    >
                      <Text className="text-center text-blue-500">Close</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Size</Text>
              <TouchableOpacity
                onPress={() => setShowSizePicker(true)}
                className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {sizeOptions.find((opt) => opt.value === formData.size)
                    ?.label || "Select Size"}
                </Text>
                <AntDesign name="down" size={16} color="gray" />
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showSizePicker}
                onClose={() => setShowSizePicker(false)}
                onSelect={(value) => setFormData({ ...formData, size: value })}
                options={sizeOptions}
                selectedValue={formData.size}
                title="Select Size"
              />
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Cavity</Text>
              <TouchableOpacity
                onPress={() => setShowCavityPicker(true)}
                className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {trays.find((opt) => opt.value === formData.cavity)?.label ||
                    "Select Cavity"}
                </Text>
                <AntDesign name="down" size={16} color="gray" />
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showCavityPicker}
                onClose={() => setShowCavityPicker(false)}
                onSelect={(value) =>
                  setFormData({ ...formData, cavity: value })
                }
                options={trays}
                selectedValue={formData.cavity}
                title="Select Cavity"
              />
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Number of Trays</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter number of trays"
                keyboardType="numeric"
                value={formData.noOfTray}
                onChangeText={(text) =>
                  setFormData({ ...formData, noOfTray: text })
                }
              />
            </View>
            <View>
              <Text className="text-gray-700 mb-2">
                Quantity (Cavity × Trays)
              </Text>
              <View className="border border-gray-200 rounded-lg p-3 bg-gray-100">
                <Text>{formData.quantity}</Text>
              </View>
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Pollyhouse Number</Text>
              <TouchableOpacity
                onPress={() => setShowPollyPicker(true)}
                className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {pollyhouses.find(
                    (opt) => opt.value === formData.pollyhouseNumber
                  )?.label || "Select Pollyhouse"}
                </Text>
                <AntDesign name="down" size={16} color="gray" />
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showPollyPicker}
                onClose={() => setShowPollyPicker(false)}
                onSelect={(value) =>
                  setFormData({ ...formData, pollyhouseNumber: value })
                }
                options={pollyhouses}
                selectedValue={formData.pollyhouseNumber}
                title="Select Pollyhouse"
              />
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Labours Engaged</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter number of labours"
                keyboardType="numeric"
                value={formData.laboursEngage}
                onChangeText={(text) =>
                  setFormData({ ...formData, laboursEngage: text })
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
            <Text className="text-white font-bold text-lg">Submit</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddPrimaryPlantationForm;
