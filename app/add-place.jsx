import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import Voice from "@react-native-voice/voice";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import SearchablePicker from "../components/SearchablePicker";
import axiosInstance from "../components/api/api_instance";
import { useGlobalContext } from "../context/GlobalProvider";
import {
  getDistrict,
  getFarmer,
  getPlants,
  getSlots,
  getStates,
  getSubType,
  getTaluks,
  getVillages,
} from "../components/Helpers/districts";

const AddPlaceForm = () => {
  const router = useRouter();
  const { user } = useGlobalContext();
  const { defaultState, defaultDistrict, defaultTaluka, defaultVillage, _id } =
    user?.response?.data || {};
  const [showAdvanceDatePicker, setShowAdvanceDatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showVillagePicker, setShowVillagePicker] = useState(false);
  const [showTalukaPicker, setShowTalukaPicker] = useState(false);
  const [showPlantPicker, setShowPlantPicker] = useState(false);
  const [showSubPicker, setShowSubPicker] = useState(false);
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showPlantTypePicker, setShowPlantTypePicker] = useState(false);
  const [showPaymentMode, setShowPaymentModePicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [taluka, setTaluka] = useState([]);
  const [villages, setVillages] = useState([]);
  const [states, setStates] = useState([]);

  const [plants, setPlants] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [farmerData, setFarmerData] = useState({});
  const params = useLocalSearchParams();
  const mode = params.mode; // 'edit' or 'create'
  const itemData = params.data ? JSON.parse(params.data) : null; // Parse the stringified data
  const [formData, setFormData] = useState({
    date: mode ? new Date(itemData?.createdAt) : new Date(),
    name: itemData?.farmer?.name || "",
    village: itemData?.farmer?.village || defaultVillage || "",
    taluka: itemData?.farmer?.taluka || defaultTaluka || "",
    district: itemData?.farmer?.district || defaultDistrict || "",
    state: itemData?.farmer?.state || defaultState || "",
    mobileNumber: "",
    noOfPlants: mode ? itemData?.numberOfPlants : "",
    typeOfPlant: mode ? itemData?.typeOfPlants : "",
    paymentMode: "",
    rate: mode ? itemData?.rate : "",
    advance: "",
    dateOfAdvance: new Date(),
    bankName: "",
    receiptPhoto: null,
    plant: "",
    subtype: "",
    selectedSlot: "", // Initial mandatory group
    districtName: defaultDistrict
      ? districts.find((districts) => districts?.value == defaultDistrict)
          ?.label
      : "",
    stateName: defaultState
      ? states.find((states) => states?.value == defaultState)?.label
      : "",
    talukaName: defaultTaluka
      ? taluka.find((taluka) => taluka?.value == defaultTaluka)?.label
      : "",
  });

  useEffect(() => {
    setFormData({
      ...formData,
      name: farmerData?.name,
    });
  }, [farmerData]);

  useEffect(() => {
    if (formData?.mobileNumber?.length === 10) {
      getFarmer(formData?.mobileNumber, setFarmerData);
    }
  }, [formData?.mobileNumber.length]);
  useEffect(() => {
    // getDistricts();
    //getTaluka();
    // getDistrict(setDistricts);
    getStates(setStates);
    getPlants(setPlants);
  }, []);
  useEffect(() => {
    getSubType(setSubTypes, formData?.plant);
  }, [formData?.plant]);
  useEffect(() => {
    getDistrict(setDistricts, formData?.state);
  }, [formData?.state]);
  useEffect(() => {
    getTaluks(setTaluka, formData?.state, formData?.district);
  }, [formData?.district]);
  useEffect(() => {
    if (formData?.district && formData?.taluka) {
      getVillages(
        setVillages,
        formData?.taluka,
        formData?.district,
        formData?.state
      );
    }
  }, [formData?.taluka, formData?.district]);
  useEffect(() => {
    getSlots(setSlots, formData?.plant, formData?.subtype);
  }, [formData?.subtype]);

  const handleSubmit = async () => {
    // Handle form submission
    console.log(formData);

    try {
      // setSubmitting(true);

      const payload = {
        name: formData.name,
        village: formData?.village,
        taluka: formData?.taluka,
        state: formData?.state,
        district: formData?.district,
        talukaName:
          formData?.talukaName ||
          taluka.find((taluka) => taluka?.value == defaultTaluka)?.label,
        stateName:
          formData?.stateName ||
          states.find((states) => states?.value == defaultState)?.label,
        districtName:
          formData?.districtName ||
          districts.find((districts) => districts?.value == defaultDistrict)
            ?.label,
        mobileNumber: formData?.mobileNumber,
        typeOfPlants: formData?.typeOfPlant,
        numberOfPlants: formData?.noOfPlants,
        rate: formData?.rate,
        paymentStatus: "not paid",
        salesPerson: _id,
        modeOfPayment: formData?.paymentMode,
        advance: formData?.advance,
        dateOfAdvance: formData?.dateOfAdvance,
        bankName: formData?.bankName,
        orderStatus: "pending",
        plantName: formData?.plant,
        plantSubtype: formData?.subtype,
        bookingSlot: formData?.selectedSlot,
      };
      console.log(payload);

      const response = await axiosInstance.post(
        "/farmer/createFarmer",
        payload
      );
      // Handle successful login
      if (response.data) {
        Alert.alert("Success", "Order added successfully");
        router.back();
      }
    } catch (error) {
      // Detailed error handling
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during sign in";

      Alert.alert("Error", errorMessage);
    } finally {
      // setSubmitting(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permissions using Expo's ImagePicker
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Please grant media library permission to select photos."
        );
        return;
      }

      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        // Note: it's 'canceled' not 'cancelled' in newer versions
        setFormData({ ...formData, receiptPhoto: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };
  const handleDateChange = (event, date) => {
    if (event.type === "set") {
      setFormData({ ...formData, date: date });
    } else {
      setFormData({ ...formData, date: new Date() });
    }
    setShowDatePicker(false);
  };
  const plantsOptions = [
    { label: "Banana", value: "Banana" },
    { label: "Shrimanti", value: "Shrimanti" },
    // Add more talukas here...
  ];

  const paymentOPtions = [
    { label: "Cash", value: "Cash" },
    { label: "Phone Pe", value: "Phone Pe" },
    { label: "Google Pay", value: "Google Pay" },
    { label: "Cheque", value: "Cheque" },
    { label: "JPCS", value: "JPCB" },

    // Add more talukas here...
  ];

  const handleAdvanceDateChange = (event, date) => {
    if (event.type === "set") {
      setFormData({ ...formData, dateOfAdvance: date });
    } else {
      setFormData({ ...formData, dateOfAdvance: new Date() });
    }
  };

  // Initialize voice recognition
  useEffect(() => {
    function onSpeechResults(e) {
      if (e.value && activeField) {
        const spokenText = e.value[0];
        if (
          activeField === "noOfPlants" ||
          activeField === "rate" ||
          activeField === "advance"
        ) {
          // Extract numbers from spoken text
          const numbers = spokenText.match(/\d+/g);
          if (numbers) {
            handleNumberInput(numbers[0], activeField);
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            [activeField]: spokenText,
          }));
        }
      }
      setIsListening(false);
      setActiveField(null);
    }

    function onSpeechError(e) {
      setIsListening(false);
      setActiveField(null);
      Alert.alert("Error", "Failed to recognize speech. Please try again.");
    }

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Cleanup
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [activeField]);

  const startListening = async (field) => {
    try {
      await Voice.start("en-US");
      setIsListening(true);
      setActiveField(field);
    } catch (e) {
      Alert.alert(
        "Error",
        "Failed to start voice recognition. Please try again."
      );
    }
  };

  // Function to stop voice recognition
  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
      setActiveField(null);
    } catch (e) {
      console.error(e);
    }
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
          <Text className="text-xl font-bold ml-4">Add New Order</Text>
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
              <Text className="text-gray-700 mb-2">Farmer Name</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                field="name"
                placeholder="Farmer Name"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Mobile Number</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter mobile number"
                keyboardType="numeric"
                value={formData.mobileNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, mobileNumber: text })
                }
              />
              <View>
                <Text className="text-gray-700 mb-2">States</Text>
                <TouchableOpacity
                  onPress={() => setShowStatePicker(true)}
                  className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                >
                  <Text>
                    {states.find((opt) => opt.value === formData.state)
                      ?.label || "Select District"}
                  </Text>
                  <AntDesign name="down" size={16} color="gray" />
                </TouchableOpacity>
                <SearchablePicker
                  isVisible={showStatePicker}
                  onClose={() => setShowStatePicker(false)}
                  onSelect={(value, label) =>
                    setFormData({ ...formData, state: value, stateName: label })
                  }
                  options={states}
                  selectedValue={formData.state}
                  title="Select State"
                />

                <Text className="text-gray-700 mb-2">District</Text>
                <TouchableOpacity
                  onPress={() => setShowDistrictPicker(true)}
                  className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                >
                  <Text>
                    {districts.find((opt) => opt.value === formData.district)
                      ?.label || "Select District"}
                  </Text>
                  <AntDesign name="down" size={16} color="gray" />
                </TouchableOpacity>
                <SearchablePicker
                  isVisible={showDistrictPicker}
                  onClose={() => setShowDistrictPicker(false)}
                  onSelect={(value, label) =>
                    setFormData({
                      ...formData,
                      district: value,
                      districtName: label,
                    })
                  }
                  options={districts}
                  selectedValue={formData.district}
                  title="Select District"
                />
                <View>
                  <Text className="text-gray-700 mb-2">Taluka</Text>
                  <TouchableOpacity
                    onPress={() => setShowTalukaPicker(true)}
                    className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                  >
                    <Text>
                      {taluka.find((opt) => opt.value === formData.taluka)
                        ?.label || "Select Taluka"}
                    </Text>
                    <AntDesign name="down" size={16} color="gray" />
                  </TouchableOpacity>
                  <SearchablePicker
                    isVisible={showTalukaPicker}
                    onClose={() => setShowTalukaPicker(false)}
                    onSelect={(value, label) =>
                      setFormData({
                        ...formData,
                        taluka: value,
                        talukaName: label,
                      })
                    }
                    options={taluka}
                    selectedValue={formData.taluka}
                    title="Select Taluka"
                  />
                </View>
                <View>
                  <Text className="text-gray-700 mb-2">Village</Text>
                  <TouchableOpacity
                    onPress={() => setShowVillagePicker(true)}
                    className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                  >
                    <Text>
                      {villages.find((opt) => opt.value === formData.village)
                        ?.label || "Select Village"}
                    </Text>
                    <AntDesign name="down" size={16} color="gray" />
                  </TouchableOpacity>
                  <SearchablePicker
                    isVisible={showVillagePicker}
                    onClose={() => setShowVillagePicker(false)}
                    onSelect={(value) =>
                      setFormData({ ...formData, village: value })
                    }
                    options={villages}
                    selectedValue={formData.village}
                    title="Select Village"
                  />
                </View>
                <View>
                  <View
                    key={formData?.plant}
                    className="space-y-2 border p-4 rounded-lg mb-4 mt-4"
                  >
                    <View>
                      <Text className="text-gray-700 mb-2">Select Plant</Text>
                      <TouchableOpacity
                        onPress={() => setShowPlantPicker(true)}
                        className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                      >
                        <Text>
                          {plants.find((opt) => opt.value === formData.plant)
                            ?.label || "Select Plant"}
                        </Text>
                        <AntDesign name="down" size={16} color="gray" />
                      </TouchableOpacity>
                      <SearchablePicker
                        isVisible={showPlantPicker}
                        onClose={() => setShowPlantPicker(false)}
                        onSelect={(value) =>
                          setFormData({ ...formData, plant: value })
                        }
                        options={plants}
                        selectedValue={formData.plant}
                        title="Select Plant"
                      />
                    </View>
                    <View>
                      <Text className="text-gray-700 mb-2">Select Subtype</Text>
                      <TouchableOpacity
                        onPress={() => setShowSubPicker(true)}
                        className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                      >
                        <Text>
                          {subTypes.find(
                            (opt) => opt.value === formData.subtype
                          )?.label || "Select Subtype"}
                        </Text>
                        <AntDesign name="down" size={16} color="gray" />
                      </TouchableOpacity>
                      <SearchablePicker
                        isVisible={showSubPicker}
                        onClose={() => setShowSubPicker(false)}
                        onSelect={(value) =>
                          setFormData({ ...formData, subtype: value })
                        }
                        options={subTypes}
                        selectedValue={formData.subtype}
                        title="Select Subtype"
                      />
                    </View>

                    <View>
                      <Text className="text-gray-700 mb-2">Select Slot</Text>
                      <TouchableOpacity
                        onPress={() => setShowSlotPicker(true)}
                        className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                      >
                        <Text>
                          {slots.find(
                            (opt) => opt.value === formData.selectedSlot
                          )?.label || "Select Slot"}
                        </Text>
                        <AntDesign name="down" size={16} color="gray" />
                      </TouchableOpacity>
                      <SearchablePicker
                        isVisible={showSlotPicker}
                        onClose={() => setShowSlotPicker(false)}
                        onSelect={(value) =>
                          setFormData({ ...formData, selectedSlot: value })
                        }
                        options={slots}
                        selectedValue={formData.selectedSlot}
                        title="Select Slot"
                      />
                    </View>
                    {/* 
                    <View>
                      <Text className="text-gray-700 mb-2">Subtype</Text>
                      <TextInput
                        className="border border-gray-200 rounded-lg p-3 bg-white"
                        placeholder="Select subtype"
                        value={group.subtype}
                        onChangeText={(text) =>
                          handleGroupChange(index, "subtype", text)
                        }
                      />
                    </View>

                    <View>
                      <Text className="text-gray-700 mb-2">Selected Slot</Text>
                      <TextInput
                        className="border border-gray-200 rounded-lg p-3 bg-white"
                        placeholder="Select slot"
                        value={group.selectedSlot}
                        onChangeText={(text) =>
                          handleGroupChange(index, "selectedSlot", text)
                        }
                      />
                    </View> */}
                  </View>
                </View>
              </View>
            </View>

            <View>
              <Text className="text-gray-700 mb-2">No of Plants</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter no of plants"
                keyboardType="numeric"
                value={formData.noOfPlants.toString()}
                onChangeText={(text) => {
                  if (text) {
                    setFormData({ ...formData, noOfPlants: parseInt(text) });
                  } else {
                    setFormData({ ...formData, noOfPlants: "" });
                  }
                }}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Type Of Plant</Text>
              <TouchableOpacity
                onPress={() => setShowPlantTypePicker(true)}
                className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {plantsOptions.find(
                    (opt) => opt.value === formData.typeOfPlant
                  )?.label || "Select Plant"}
                </Text>
                <AntDesign name="down" size={16} color="gray" />
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showPlantTypePicker}
                onClose={() => setShowPlantTypePicker(false)}
                onSelect={(value) =>
                  setFormData({ ...formData, typeOfPlant: value })
                }
                options={plantsOptions}
                selectedValue={formData.typeOfPlant}
                title="Select Plant"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Rate</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter rate"
                keyboardType="numeric"
                value={formData.rate.toString()}
                onChangeText={(text) => {
                  if (text) {
                    setFormData({ ...formData, rate: parseFloat(text) });
                  } else {
                    setFormData({ ...formData, rate: "" });
                  }
                }}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Advance</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter advance"
                keyboardType="numeric"
                value={formData.advance.toString()}
                onChangeText={(text) => {
                  if (text) {
                    setFormData({ ...formData, advance: parseFloat(text) });
                  } else {
                    setFormData({ ...formData, advance: "" });
                  }
                }}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2">Date of Advance</Text>
              <TouchableOpacity onPress={() => setShowAdvanceDatePicker(true)}>
                <View className="border border-gray-200 rounded-lg p-3 bg-white">
                  <Text>{formData.dateOfAdvance.toDateString()}</Text>
                </View>
              </TouchableOpacity>
              {showAdvanceDatePicker && (
                <DateTimePicker
                  value={formData.dateOfAdvance}
                  mode="date"
                  display="default"
                  onChange={handleAdvanceDateChange}
                />
              )}
            </View>
            <View>
              <Text className="text-gray-700 mb-2">Payment Mode</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentModePicker(true)}
                className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
              >
                <Text>
                  {paymentOPtions.find(
                    (opt) => opt.value === formData.paymentMode
                  )?.label || "Select Payment Mode"}
                </Text>
                <AntDesign name="down" size={16} color="gray" />
              </TouchableOpacity>
              <SearchablePicker
                isVisible={showPaymentMode}
                onClose={() => setShowPaymentModePicker(false)}
                onSelect={(value) =>
                  setFormData({ ...formData, paymentMode: value })
                }
                options={paymentOPtions}
                selectedValue={formData.paymentMode}
                title="Select Payment Mode"
              />
            </View>

            {formData?.paymentMode !== "Cash" &&
              formData?.paymentMode !== "" && (
                <View>
                  <Text className="text-gray-700 mb-2">
                    Receipt/Cheque Photo
                  </Text>
                  {formData.receiptPhoto ? (
                    <Image
                      source={{ uri: formData.receiptPhoto }}
                      style={{ width: "100%", height: 200 }}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={handleImagePicker}
                      className="border border-gray-200 rounded-lg p-3 bg-white items-center"
                    >
                      <Text className="text-gray-700">
                        Select Receipt/Cheque Photo{" "}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

            <View>
              <Text className="text-gray-700 mb-2">Bank Name</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter bank name"
                value={formData.bankName}
                onChangeText={(text) =>
                  setFormData({ ...formData, bankName: text })
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
            <Text className="text-white font-bold text-lg">Add Order</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddPlaceForm;
