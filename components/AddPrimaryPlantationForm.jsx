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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import SearchablePicker from "../components/SearchablePicker";
import { Loader } from "../components";
import { getBatches } from "./Helpers/districts";

const AddPrimaryPlantationForm = () => {
  const router = useRouter();
  console.log("assss");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBatchPicker, setShowBatchPicker] = useState(false);
  const [showPollyPicker, setShowPollyPicker] = useState(false);
  useEffect(() => {
    console.log("assd ddd");
    getBatches();
  }, []);
  // Sample batch numbers - replace with actual data
  const batchOptions = [
    { value: "B001", label: "Batch 001" },
    { value: "B002", label: "Batch 002" },
    { value: "B003", label: "Batch 003" },
  ];

  // Sample pollyhouse numbers - replace with actual data
  const pollyhouseOptions = [
    { value: "P001", label: "Pollyhouse 001" },
    { value: "P002", label: "Pollyhouse 002" },
    { value: "P003", label: "Pollyhouse 003" },
  ];

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

  // Calculate quantity when cavity or noOfTray changes
  useEffect(() => {
    const cavity = parseInt(formData.cavity) || 0;
    const trays = parseInt(formData.noOfTray) || 0;
    const quantity = (cavity * trays).toString();
    setFormData({ ...formData, quantity });
  }, [formData.cavity, formData.noOfTray]);

  const handleDateChange = (event, date) => {
    if (event.type === "set") {
      setFormData({ ...formData, date });
    }
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
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
              // Add your API call here
              Alert.alert("Success", "Form submitted successfully");
              router.back();
            } catch (error) {
              Alert.alert("Error", error.message);
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
          <Text className="text-xl font-bold ml-4">Add Primary Plantation</Text>
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
                  {batchOptions.find((opt) => opt.value === formData.batchNo)
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
                options={batchOptions}
                selectedValue={formData.batchNo}
                title="Select Batch"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Bottle Taken</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter number of bottles"
                keyboardType="numeric"
                value={formData.bottelTaken}
                onChangeText={(text) =>
                  setFormData({ ...formData, bottelTaken: text })
                }
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Size</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter size"
                value={formData.size}
                onChangeText={(text) =>
                  setFormData({ ...formData, size: text })
                }
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Cavity</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter cavity"
                keyboardType="numeric"
                value={formData.cavity}
                onChangeText={(text) =>
                  setFormData({ ...formData, cavity: text })
                }
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
                  {pollyhouseOptions.find(
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
                options={pollyhouseOptions}
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
