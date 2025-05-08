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
  getCavities,
  getDealers,
  getDistrict,
  getFarmer,
  getPlants,
  getSales,
  getSlots,
  getStates,
  getSubType,
  getTaluks,
  getVillages,
} from "../components/Helpers/districts";
import { Loader } from "../components";

const AddPlaceForm = () => {
  const router = useRouter();
  const { user } = useGlobalContext();
  console.log(user);
  const {
    defaultState,
    defaultDistrict,
    defaultTaluka,
    defaultVillage,
    _id,
    jobTitle,
  } = user?.response?.data || {};
  const [showAdvanceDatePicker, setShowAdvanceDatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showVillagePicker, setShowVillagePicker] = useState(false);
  const [showTalukaPicker, setShowTalukaPicker] = useState(false);
  const [showPlantPicker, setShowPlantPicker] = useState(false);
  const [showSubPicker, setShowSubPicker] = useState(false);
  const [showSlaesPicker, setShowSlaesPicker] = useState(false);

  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showPlantTypePicker, setShowPlantTypePicker] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [taluka, setTaluka] = useState([]);
  const [villages, setVillages] = useState([]);
  const [states, setStates] = useState([]);
  const [plants, setPlants] = useState([]);
  const [subTypes, setSubTypes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [farmerData, setFarmerData] = useState({});
  const [loading, setLoading] = useState(false);
  const [isInstantOrder, setIsInstantOrder] = useState(
    jobTitle === "OFFICE_STAFF" || jobTitle === "OFFICE_ADMIN" ? true : false
  );
  const [sales, setSales] = useState([]);
  const [bulkOrder, setBulkOrder] = useState(false);
  console.log(sales);
  const params = useLocalSearchParams();
  const mode = params.mode; // 'edit' or 'create'
  const itemData = params.data ? JSON.parse(params.data) : null; // Parse the stringified data
  const [cavities, setCavities] = useState([
    {
      label: "10 Cavity",
      value: 10,
    },
    {
      label: "8 cavity",
      value: 8,
    },
  ]);
  const [showCavityPicker, setShowCavityPicker] = useState(false);

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
    sales: null,
    cavity: "",
  });
  const [rate, setRate] = useState(null);
  const [available, setAvailable] = useState(null);
  const [dealers, setDealers] = useState([]);
  console.log("sales", dealers);
  useEffect(() => {
    if (!farmerData && !farmerData?.name) {
      setFormData({
        ...formData,
        name: "",
        village: defaultVillage || "",
        state: defaultState || "",
        district: defaultDistrict || "",
        taluka: defaultTaluka || "",
      });
      return;
    }
    setFormData({
      ...formData,
      name: farmerData?.name,
      village: farmerData?.village,
      state: farmerData?.state,
      district: farmerData?.district,
      taluka: farmerData?.taluka,
    });
  }, [farmerData]);
  console.log("as", formData);
  useEffect(() => {
    if (formData?.mobileNumber?.length === 10) {
      getFarmer(formData?.mobileNumber, setFarmerData, setLoading);
    } else if (farmerData && formData?.mobileNumber?.length < 10) {
      setFormData({
        ...formData,
        name: "",
        village: defaultVillage || "",
        state: defaultState || "",
        district: defaultDistrict || "",
        taluka: defaultTaluka || "",
      });
      setFarmerData({});
    }
  }, [formData?.mobileNumber.length]);
  useEffect(() => {
    // getDistricts();
    //getTaluka();
    // getDistrict(setDistricts);
    getStates(setStates, setLoading);
    getPlants(setPlants, setLoading);
    getSales(setSales, setLoading);
    getDealers(setDealers, setLoading);
    //  getCavities(setCavities, setLoading);
  }, []);
  console.log("cavities", cavities);

  useEffect(() => {
    getSubType(setSubTypes, formData?.plant, setLoading);
  }, [formData?.plant]);
  useEffect(() => {
    getDistrict(setDistricts, formData?.state, setLoading);
  }, [formData?.state]);
  useEffect(() => {
    getTaluks(setTaluka, formData?.state, formData?.district, setLoading);
  }, [formData?.district]);
  useEffect(() => {
    if (formData?.district && formData?.taluka) {
      getVillages(
        setVillages,
        formData?.taluka,
        formData?.district,
        formData?.state,
        setLoading
      );
    }
  }, [formData?.taluka, formData?.district]);
  useEffect(() => {
    getSlots(setSlots, formData?.plant, formData?.subtype, setLoading);
  }, [formData?.subtype]);

  const handleSubmit = async () => {
    console.log("here1");
    // Show confirmation alert before submission
    Alert.alert(
      "Confirm Order",
      `Are you sure you want to add an order for **${formData.name}**?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setLoading(true);

              const payload = {
                name: formData.name,
                village: formData.village,
                taluka: formData.taluka,
                state: formData.state,
                district: formData.district,
                talukaName:
                  formData.talukaName ||
                  taluka.find((t) => t.value == defaultTaluka)?.label,
                stateName:
                  formData.stateName ||
                  states.find((s) => s.value == defaultState)?.label,
                districtName:
                  formData.districtName ||
                  districts.find((d) => d.value == defaultDistrict)?.label,
                mobileNumber: formData.mobileNumber,
                typeOfPlants: formData.typeOfPlant,
                numberOfPlants: formData.noOfPlants,
                rate: formData.rate,
                paymentStatus: "not paid",
                salesPerson: formData?.sales || _id,
                orderStatus: isInstantOrder ? "DISPATCHED" : "PENDING",
                plantName: formData.plant,
                plantSubtype: formData.subtype,
                bookingSlot: formData.selectedSlot,
                orderPaymentStatus: "PENDING",
                cavity: formData?.cavity,
              };
              console.log(payload);
              console.log(formData);

              const response = await axiosInstance.post(
                "/farmer/createFarmer",
                payload,
                {
                  headers: {
                    "Content-Type": "application/json", // Changed from multipart/form-data to application/json
                  },
                }
              );

              if (response.data) {
                Alert.alert("Success", "Order added successfully");
                setFarmerData({});

                router.back();
              }
            } catch (error) {
              console.log(error);
              const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "An error occurred during sign in";
              Alert.alert("Error", errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  const handleSubmitDelaer = async () => {
    console.log("here3");

    // Show confirmation alert before submission
    Alert.alert(
      "Confirm Order",
      `Are you sure you want to add an order for **${formData.name}**?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setLoading(true);

              const payload = {
                typeOfPlants: formData.typeOfPlant,
                numberOfPlants: formData.noOfPlants,
                rate: formData.rate,
                paymentStatus: "not paid",
                salesPerson: formData?.sales || _id,
                orderStatus: isInstantOrder ? "DISPATCHED" : "PENDING",
                plantName: formData.plant,
                plantSubtype: formData.subtype,
                bookingSlot: formData.selectedSlot,
                orderPaymentStatus: "PENDING",
                dealerOrder: true,
                dealer: formData?.sales || _id,
                salesPerson: _id,
              };

              const response = await axiosInstance.post(
                "/order/dealer-order",
                payload,
                {
                  headers: {
                    "Content-Type": "application/json", // Changed from multipart/form-data to application/json
                  },
                }
              );

              if (response.data) {
                Alert.alert("Success", "Order added successfully");
                setFarmerData({});

                router.back();
              }
            } catch (error) {
              console.log(error);
              const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "An error occurred during sign in";
              Alert.alert("Error", errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  console.log("states", states);
  console.log("states  sdsd", formData);

  const findOptionByLabel = (options, label) => {
    console.log;
    const foundOption = options.find(
      (opt) => opt.label.toLowerCase() === label?.toLowerCase()
    );
    if (!foundOption && label) {
      return { value: label, label: label, disabled: true };
    }
    return foundOption;
  };
  const handleDateChange = (event, date) => {
    if (event.type === "set") {
      setFormData({ ...formData, date: date });
    } else {
      setFormData({ ...formData, date: new Date() });
    }
    setShowDatePicker(false);
  };
  console.log(formData);
  // Function to stop voice recognition
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
          <Text className="text-xl font-bold ml-4">Add New Order</Text>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="space-y-4">
            {jobTitle === "DEALER" && (
              <View className="flex-row items-center justify-between p-4 bg-gray-50">
                <View className="flex-row items-center bg-gray-200 rounded-lg p-1">
                  <TouchableOpacity
                    onPress={() => setBulkOrder(false)}
                    className={`px-4 py-2 rounded-md ${
                      !bulkOrder ? "bg-white shadow" : ""
                    }`}
                  >
                    <Text
                      className={`${
                        !bulkOrder
                          ? "text-blue-500 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      Farmer Order
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setBulkOrder(true)}
                    className={`px-4 py-2 rounded-md ${
                      bulkOrder ? "bg-white shadow" : ""
                    }`}
                  >
                    <Text
                      className={`${
                        bulkOrder
                          ? "text-blue-500 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      Dealer Order
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {jobTitle === "OFFICE_STAFF" ||
              (jobTitle === "OFFICE_ADMIN" && (
                <View className="flex-row items-center justify-between p-4 bg-gray-50">
                  <View className="flex-row items-center bg-gray-200 rounded-lg p-1">
                    <TouchableOpacity
                      onPress={() => {
                        setIsInstantOrder(false);

                        setBulkOrder(false);
                      }}
                      className={`px-4 py-2 rounded-md ${
                        !isInstantOrder && !bulkOrder ? "bg-white shadow" : ""
                      }`}
                    >
                      <Text
                        className={`${
                          !isInstantOrder && !bulkOrder
                            ? "text-blue-500 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        Normal Order
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setBulkOrder(false);

                        setIsInstantOrder(true);
                      }}
                      className={`px-4 py-2 rounded-md ${
                        isInstantOrder ? "bg-white shadow" : ""
                      }`}
                    >
                      <Text
                        className={`${
                          isInstantOrder
                            ? "text-blue-500 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        Instant Order
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsInstantOrder(false);
                        setBulkOrder(true);
                      }}
                      className={`px-4 py-2 rounded-md ${
                        bulkOrder ? "bg-white shadow" : ""
                      }`}
                    >
                      <Text
                        className={`${
                          bulkOrder
                            ? "text-blue-500 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        Bulk Order
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            {jobTitle === "OFFICE_ADMIN" && !isInstantOrder && !bulkOrder && (
              <View>
                <Text className="text-gray-700 mb-2">Order For</Text>
                <TouchableOpacity
                  onPress={() => setShowSlaesPicker(true)}
                  className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                >
                  <Text>
                    {sales.find((opt) => opt.value === formData.sales)?.label ||
                      "Select Sales Person"}
                  </Text>
                  <AntDesign name="down" size={16} color="gray" />
                </TouchableOpacity>
                <SearchablePicker
                  isVisible={showSlaesPicker}
                  onClose={() => setShowSlaesPicker(false)}
                  onSelect={(value, label, item) => {
                    setFormData({
                      ...formData,
                      sales: value,
                    });
                  }}
                  options={sales}
                  selectedValue={formData.sales}
                  title="Select Subtype"
                />
              </View>
            )}
            {jobTitle === "OFFICE_ADMIN" && bulkOrder && (
              <View>
                <Text className="text-gray-700 mb-2">Order For</Text>
                <TouchableOpacity
                  onPress={() => setShowSlaesPicker(true)}
                  className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                >
                  <Text>
                    {dealers.find((opt) => opt.value === formData.sales)
                      ?.label || "Select Dealer Person"}
                  </Text>
                  <AntDesign name="down" size={16} color="gray" />
                </TouchableOpacity>
                <SearchablePicker
                  isVisible={showSlaesPicker}
                  onClose={() => setShowSlaesPicker(false)}
                  onSelect={(value, label, item) => {
                    setFormData({
                      ...formData,
                      sales: value,
                    });
                  }}
                  options={dealers}
                  selectedValue={formData.sales}
                  title="Select Subtype"
                />
              </View>
            )}
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

            {(!bulkOrder || !bulkOrder) && (
              <View>
                <Text className="text-gray-700 mb-2">Mobile Number</Text>
                <TextInput
                  className="border border-gray-200 rounded-lg p-3 bg-white"
                  placeholder="Enter mobile number"
                  keyboardType="numeric"
                  maxLength={10} // Limit input to 10 characters
                  value={formData.mobileNumber}
                  onChangeText={(text) => {
                    // Allow only numeric values and trim to 10 digits
                    const sanitizedText = text
                      .replace(/[^0-9]/g, "")
                      .slice(0, 10);
                    setFormData({ ...formData, mobileNumber: sanitizedText });
                  }}
                />

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
                    editable={farmerData?.name ? false : true}
                  />
                </View>
                <View>
                  <Text className="text-gray-700 mb-2">States</Text>
                  <TouchableOpacity
                    onPress={() => setShowStatePicker(true)}
                    className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                    disabled={farmerData?.name}
                  >
                    <Text>
                      {(() => {
                        // Get the state ID from either farmerData or formData
                        const stateId = farmerData?.state || formData.state;

                        // If we have a state ID, find the matching label from the states array
                        if (stateId) {
                          const stateObj = states.find(
                            (opt) => opt.value === stateId
                          );
                          return stateObj?.label || "Unknown State";
                        }

                        // Default text if no state is selected
                        return "Select State";
                      })()}
                    </Text>
                    <AntDesign name="down" size={16} color="gray" />
                  </TouchableOpacity>
                  <SearchablePicker
                    isVisible={showStatePicker}
                    onClose={() => setShowStatePicker(false)}
                    onSelect={(value, label) =>
                      setFormData({
                        ...formData,
                        state: value,
                        stateName: label,
                      })
                    }
                    options={states}
                    selectedValue={formData.state}
                    title="Select State"
                    disabled={farmerData?.name}
                  />

                  <Text className="text-gray-700 mb-2">District</Text>
                  <TouchableOpacity
                    onPress={() => setShowDistrictPicker(true)}
                    className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                    disabled={farmerData?.name}
                  >
                    <Text>
                      {(() => {
                        // Get the district ID from either farmerData or formData
                        const districtId =
                          farmerData?.district || formData.district;

                        // If we have a district ID, find the matching label from the districts array
                        if (districtId) {
                          const districtObj = districts.find(
                            (opt) => opt.value === districtId
                          );
                          return districtObj?.label || "Unknown District";
                        }

                        // Default text if no district is selected
                        return "Select District";
                      })()}
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
                    options={[
                      ...districts,
                      formData.district &&
                      !findOptionByLabel(districts, formData.district)
                        ? {
                            value: formData.district,
                            label: formData.district,
                            disabled: true,
                          }
                        : null,
                    ].filter(Boolean)}
                    selectedValue={formData.district}
                    title="Select District"
                  />
                  <View>
                    <Text className="text-gray-700 mb-2">Taluka</Text>
                    <TouchableOpacity
                      onPress={() => setShowTalukaPicker(true)}
                      className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                      disabled={farmerData?.name}
                    >
                      <Text>
                        {(() => {
                          // Get the taluka ID from either farmerData or formData
                          const talukaId =
                            farmerData?.taluka || formData.taluka;

                          // If we have a taluka ID, find the matching label from the taluka array
                          if (talukaId) {
                            const talukaObj = taluka.find(
                              (opt) => opt.value === talukaId
                            );
                            return talukaObj?.label || "Unknown Taluka";
                          }

                          // Default text if no taluka is selected
                          return "Select Taluka";
                        })()}
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
                      disabled={farmerData?.name}
                    >
                      <Text>
                        {farmerData?.village
                          ? farmerData?.village
                          : villages.find(
                              (opt) => opt.value === formData.village
                            )?.label || "Select Village"}
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
                </View>
              </View>
            )}
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
                      {subTypes.find((opt) => opt.value === formData.subtype)
                        ?.label || "Select Subtype"}
                    </Text>
                    <AntDesign name="down" size={16} color="gray" />
                  </TouchableOpacity>
                  <SearchablePicker
                    isVisible={showSubPicker}
                    onClose={() => setShowSubPicker(false)}
                    onSelect={(value, label, item) => {
                      setFormData({
                        ...formData,
                        subtype: value,
                        rate: item?.rate,
                      });
                      setRate(item?.rate);
                    }}
                    options={subTypes}
                    selectedValue={formData.subtype}
                    title="Select Subtype"
                  />
                </View>
                <View>
                  <Text className="text-gray-700 mb-2">Select Cavity</Text>
                  <TouchableOpacity
                    onPress={() => setShowCavityPicker(true)}
                    className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                  >
                    <Text>
                      {cavities.find((opt) => opt.value === formData.cavity)
                        ?.label || "Select Cavity"}
                    </Text>
                    <AntDesign name="down" size={16} color="gray" />
                  </TouchableOpacity>
                  <SearchablePicker
                    isVisible={showCavityPicker}
                    onClose={() => setShowCavityPicker(false)}
                    onSelect={(value) =>
                      setFormData({ ...formData, cavity: value })
                    }
                    options={cavities}
                    selectedValue={formData.cavity}
                    title="Select Cavity"
                  />
                </View>

                <View>
                  <Text className="text-gray-700 mb-2">Select Slot</Text>
                  <TouchableOpacity
                    onPress={() => setShowSlotPicker(true)}
                    className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                  >
                    <Text>
                      {slots.find((opt) => opt.value === formData.selectedSlot)
                        ?.label || "Select Slot"}
                    </Text>
                    <AntDesign name="down" size={16} color="gray" />
                  </TouchableOpacity>
                  <SearchablePicker
                    isVisible={showSlotPicker}
                    onClose={() => setShowSlotPicker(false)}
                    onSelect={(value, label, item) => {
                      setFormData({ ...formData, selectedSlot: value });
                      setAvailable(item);
                    }}
                    options={slots}
                    selectedValue={formData.selectedSlot}
                    title="Select Slot"
                  />
                </View>
              </View>
            </View>

            <View>
              <Text className="text-gray-700 mb-2">No of Plants</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter no of plants"
                keyboardType="numeric"
                value={formData.noOfPlants?.toString()}
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
              <Text className="text-gray-700 mb-2">Rate</Text>
              <TextInput
                className="border border-gray-200 rounded-lg p-3 bg-white"
                placeholder="Enter rate"
                keyboardType="decimal-pad"
                value={formData?.rate?.toString()}
                onChangeText={(text) => {
                  const decimalRegex = /^\d*\.?\d*$/;
                  if (text === "" || decimalRegex.test(text)) {
                    setFormData({ ...formData, rate: text === "" ? "" : text });
                  }
                }}
                editable={false}
              />
            </View>
          </View>
        </ScrollView>

        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={
              (jobTitle === "DEALER" || jobTitle === "OFFICE_ADMIN") &&
              (bulkOrder || bulkOrder)
                ? handleSubmitDelaer
                : handleSubmit
            }
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
