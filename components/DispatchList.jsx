import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  RefreshControl,
  Modal,
  Linking,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useGlobalContext } from "../context/GlobalProvider";
import axiosInstance from "./api/api_instance";
import moment from "moment";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Loader from "./Loader";
import { FullScreenLoader, SimpleLoader } from "../components/LoaderNew";
import AdvanceCard from "./AdvanceCard";
import { Picker } from "@react-native-picker/picker"; // Import from @react-native-picker/picker
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import * as ImagePicker from "expo-image-picker";
import { SharingButtons } from "./Recipt";
import BlinkingStatus from "./BlinkStatus";
import { getSales } from "./Helpers/districts";

export const getTotalPaidAmount = (payments) => {
  if (!Array.isArray(payments)) return 0;
  return payments.reduce(
    (total, payment) =>
      total +
      (payment?.paymentStatus === "COLLECTED"
        ? Number(payment.paidAmount) || 0
        : 0),
    0
  );
};
const PlaceCard = ({ item, index, getOrders, jobTitle }) => {
  const {
    createdAt,
    numberOfPlants,
    plantName,
    plantSubtype,
    orderStatus = "Processing",
    farmer,
    payment,
    orderId,
    rate,
    plantType,
    bookingSlot,
    _id,
    farmReadyDate: farmReadyDateApi,
  } = item || {};

  const { name, district, taluka, village, mobileNumber } = farmer || {};
  const [isCollapsed, setIsCollapsed] = useState(true);
  const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);
  const [showFarmReadyDatePicker, setShowFarmReadyDatePicker] = useState(false);
  const [farmReadyDate, setFarmReadyDate] = useState(farmReadyDateApi || null);
  useEffect(() => {
    setFarmReadyDate(farmReadyDateApi);
  }, [farmReadyDateApi]);

  const [isAddPaymentModalVisible, setAddPaymentModalVisible] = useState(false);
  const [newPayment, setNewPayment] = useState({
    paidAmount: "",
    paymentDate: new Date(), // Default to today's date
    bankName: "",
    modeOfPayment: "",
    paymentStatus: "PENDING",
    receiptPhoto: [],
  });
  const [showDatePicker, setShowDatePicker] = useState(false); // State to show date picker
  const bgColor = index % 2 === 0 ? "white" : "#F9FAFB";
  const statusColors = {
    ACCEPTED: "rgb(21 128 61)",
    PENDING: "#FCD34D",
    REJECTED: "#F87171",
    DISPATCH_PROCESS: "#D1D5DB",
  };
  const statusColor = statusColors[orderStatus] || "#9CA3AF";
  const openAddPaymentModal = () => {
    setAddPaymentModalVisible(true);
  };

  const closeAddPaymentModal = () => {
    setAddPaymentModalVisible(false);
  };
  const handleSavePayment = () => {
    addPayment(newPayment);
    setAddPaymentModalVisible(false);
    // Save the new payment details by calling the addPayment function (passed as prop)
  };
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newPayment.paymentDate;
    setShowDatePicker(false);
    setNewPayment({ ...newPayment, paymentDate: currentDate });
  };
  const addPayment = async (formData) => {
    try {
      // Send PATCH request to the server
      const response = await axiosInstance.patch(
        `/order/payment/${item?._id}`,
        newPayment
      );

      if (response.status === 200) {
        Alert.alert("Success", "Payment added successfully");
        getOrders();
        return response.data; // Return response data if needed
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An error occurred while updating the profile");
    }
  };
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Camera access is required to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewPayment({
        ...newPayment,
        receiptPhoto: [...newPayment.receiptPhoto, result.assets[0].uri],
      });
    }
  };

  const openImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Gallery access is required to upload photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewPayment({
        ...newPayment,
        receiptPhoto: [...newPayment.receiptPhoto, result.assets[0].uri],
      });
    }
  };
  const getDateRange = () => {
    const { startDay, endDay } = bookingSlot[0] || {};
    const start = moment(startDay, "DD-MM-YYYY").subtract(5, "days").toDate();
    const end = moment(endDay, "DD-MM-YYYY").add(5, "days").toDate();
    return { start, end };
  };
  const handleFarmReadyDateChange = (event, selectedDate) => {
    setShowFarmReadyDatePicker(false);
    if (selectedDate) {
      setFarmReadyDate(selectedDate);
      // Here you can add API call to update the farm ready date
    }
  };
  const pacthOrders = async (patchObj, row) => {
    //setpatchLoading(true);

    const response = await axiosInstance.patch("/order/updateOrder", {
      orderStatus: "FARM_READY",
      id: _id,
      farmReadyDate: farmReadyDate,
    });
    getOrders();
    // const instance = NetworkManager(API.ORDER.UPDATE_ORDER);
    // const emps = await instance.request({
    //   ...patchObj,
    //   numberOfPlants: patchObj?.quantity,
    // });

    //    setpatchLoading(false);

    // setEmployees(emps?.data?.data)
  };

  const { startDay, endDay } = bookingSlot[0] || {};
  const start = moment(startDay, "DD-MM-YYYY").format("D");
  const end = moment(endDay, "DD-MM-YYYY").format("D");
  const monthYear = moment(startDay, "DD-MM-YYYY").format("MMMM, YYYY");
  return (
    <View className="mb-6">
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          backgroundColor: bgColor,
          borderRadius: 16,
          padding: 16,
          borderColor: "#D1D5DB",
          borderWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        {/* Header Section */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {/* Order Status and Sharing Buttons */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {/* Order Status */}
            <BlinkingStatus
              orderStatus={orderStatus}
              statusColors={statusColors[orderStatus] || "#9CA3AF"}
            />
            {/* Sharing Buttons */}
            <SharingButtons
              orderData={{
                name,
                taluka,
                village,
                createdAt,
                plantType,
                plantSubtype,
                numberOfPlants,
                rate,
                payment,
                orderId,
              }}
            />
          </View>

          {/* Order ID */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#6B7280" }}>
            Orderdd #: {orderId}
          </Text>
        </View>

        {/* Main Information */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2937" }}>
            {name}
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>
            {taluka} → {village}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F3F4F6",
            padding: 8,
            borderRadius: 8,
            marginBottom: 6,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Feather
              name="phone"
              size={16}
              color="#059669"
              style={{ marginRight: 8 }}
            />
            <Text style={{ fontSize: 14, color: "#374151", flex: 1 }}>
              {mobileNumber || "No phone number"}
            </Text>
          </View>
          {mobileNumber && (
            <TouchableOpacity
              onPress={() => {
                const url = `tel:${mobileNumber}`;
                Linking.canOpenURL(url)
                  .then((supported) => {
                    if (!supported) {
                      Alert.alert("Phone number is not available");
                    } else {
                      return Linking.openURL(url);
                    }
                  })
                  .catch((err) => console.error("An error occurred", err));
              }}
              style={{
                backgroundColor: "#059669",
                padding: 6,
                borderRadius: 6,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Feather
                name="phone-call"
                size={14}
                color="#ffffff"
                style={{ marginRight: 4 }}
              />
              <Text
                style={{ color: "#ffffff", fontSize: 12, fontWeight: "600" }}
              >
                Call Now
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {jobTitle === "OFFICE_STAFF" ||
          (jobTitle === "OFFICE_ADMIN" && (
            <Text style={{ fontSize: 14, color: "#111827", marginVertical: 6 }}>
              Booking Date:{" "}
              <Text style={{ fontWeight: "600" }}>
                {moment(createdAt).format("DD-MMM-YYYY")}
              </Text>
            </Text>
          ))}
        {jobTitle === "OFFICE_STAFF" ||
          (jobTitle === "OFFICE_ADMIN" && (
            <Text style={{ fontSize: 14, color: "#111827", marginVertical: 6 }}>
              Delivery Date:{" "}
              <Text style={{ fontWeight: "600" }}>
                {`${start} - ${end} ${monthYear}`}{" "}
              </Text>
            </Text>
          ))}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F0FDF4",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#DCFCE7",
          }}
        >
          {/* Plant Name Column */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: "#059669", marginBottom: 4 }}>
              Plant Typess
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#065F46",
                textAlign: "center",
              }}
            >
              {plantType?.name}
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{
              width: 1,
              backgroundColor: "#BBF7D0",
              marginHorizontal: 8,
            }}
          />

          {/* Subtype Column */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: "#059669", marginBottom: 4 }}>
              Variety
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#065F46",
                textAlign: "center",
              }}
            >
              {plantSubtype?.name}
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{
              width: 1,
              backgroundColor: "#BBF7D0",
              marginHorizontal: 8,
            }}
          />

          {/* Total Plants Column */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: "#059669", marginBottom: 4 }}>
              Quantity
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#065F46" }}>
              {numberOfPlants}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#F3F4F6",
            borderRadius: 8,
            padding: 12,
            marginVertical: 4,
          }}
        >
          {/* Total Column */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
              Total
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1F2937" }}>
              ₹{rate * numberOfPlants}
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{
              width: 1,
              backgroundColor: "#D1D5DB",
              marginHorizontal: 8,
            }}
          />

          {/* Paid Column */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
              Paid
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#059669" }}>
              ₹{getTotalPaidAmount(payment)}
            </Text>
          </View>

          {/* Divider */}
          <View
            style={{
              width: 1,
              backgroundColor: "#D1D5DB",
              marginHorizontal: 8,
            }}
          />

          {/* Remaining Column */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
              Remaining
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#DC2626" }}>
              ₹{rate * numberOfPlants - getTotalPaidAmount(payment)}
            </Text>
          </View>
        </View>

        {jobTitle === "OFFICE_STAFF" ||
          (jobTitle === "OFFICE_ADMIN" && (
            <TouchableOpacity
              onPress={() => setShowFarmReadyDatePicker(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 8,
              }}
            >
              <Text style={{ fontSize: 14, color: "#111827", marginRight: 8 }}>
                Farm Ready Date:{" "}
                <Text style={{ fontWeight: "600" }}>
                  {farmReadyDate
                    ? moment(farmReadyDate).format("DD-MMM-YYYY")
                    : "Not set"}
                </Text>
              </Text>
              <Feather name="calendar" size={16} color="#059669" />
            </TouchableOpacity>
          ))}
        {jobTitle === "OFFICE_STAFF" ||
          (jobTitle === "OFFICE_ADMIN" && (
            <TouchableOpacity
              onPress={() => {
                // Add your farm ready API call here
                pacthOrders({ orderStatus: "FARM_READY", id: _id });
              }}
              style={{
                backgroundColor: farmReadyDate ? "#059669" : "#D1D5DB",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: "center",
                opacity: farmReadyDate ? 1 : 0.5,
              }}
              disabled={!farmReadyDate}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                Farm Ready
              </Text>
            </TouchableOpacity>
          ))}
        {showFarmReadyDatePicker && (
          <DateTimePicker
            value={farmReadyDate || new Date()}
            mode="date"
            display="default"
            onChange={handleFarmReadyDateChange}
            minimumDate={getDateRange().start}
            maximumDate={getDateRange().end}
          />
        )}
        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: "#E5E7EB",
            marginVertical: 12,
          }}
        />

        {/* Collapsible Payments Section */}
        <View>
          <TouchableOpacity
            onPress={handleCollapseToggle}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1F2937" }}>
              Payments
            </Text>
            <Feather
              name={isCollapsed ? "chevron-down" : "chevron-up"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {!isCollapsed && (
            <View>
              {payment && Array.isArray(payment) && payment.length > 0 ? (
                payment.map((pay, idx) => {
                  if (!pay) return null;
                  return (
                    <AdvanceCard
                      pay={{
                        ...pay,
                        paymentStatus: String(pay.paymentStatus || ""),
                        paidAmount: Number(pay.paidAmount || 0),
                        bankName: String(pay.bankName || ""),
                        modeOfPayment: String(pay.modeOfPayment || ""),
                      }}
                      idx={idx}
                      key={idx}
                    />
                  );
                })
              ) : (
                <Text style={{ fontSize: 14, color: "#6B7280" }}>
                  No advances recorded.
                </Text>
              )}

              {/* Add Payment Button */}
              <TouchableOpacity
                style={{
                  marginTop: 16,
                  backgroundColor: "#10B981",
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={openAddPaymentModal}
              >
                <Text
                  style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}
                >
                  Add Payment
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Modal */}
        <Modal
          visible={isAddPaymentModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeAddPaymentModal}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#FFF",
                borderRadius: 16,
                padding: 20,
                width: "85%",
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", marginBottom: 16 }}
              >
                Add Payment
              </Text>

              {/* Paid Amount */}
              <TextInput
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  marginBottom: 16,
                  paddingHorizontal: 8,
                  fontSize: 16,
                  color: "#1F2937",
                }}
                placeholder="Enter Paid Amount"
                value={newPayment.paidAmount}
                onChangeText={(text) =>
                  setNewPayment({ ...newPayment, paidAmount: text })
                }
                keyboardType="numeric"
              />

              {/* Mode of Payment */}
              <Picker
                selectedValue={newPayment.modeOfPayment}
                style={{
                  height: 50,
                  marginBottom: 16,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 8,
                }}
                onValueChange={(itemValue) => {
                  setNewPayment({ ...newPayment, modeOfPayment: itemValue });
                }}
              >
                <Picker.Item label="Select Mode of Payment" value="" />
                <Picker.Item label="Cash" value="Cash" />
                <Picker.Item label="Phone Pe" value="Phone Pe" />
                <Picker.Item label="Google Pay" value="Google Pay" />
                <Picker.Item label="Cheque" value="Cheque" />
                <Picker.Item label="JPCB" value="JPCB" />
              </Picker>

              {/* Conditional Bank Name */}
              {newPayment.modeOfPayment === "Cheque" && (
                <TextInput
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: "#D1D5DB",
                    marginBottom: 16,
                    paddingHorizontal: 8,
                    fontSize: 16,
                    color: "#1F2937",
                  }}
                  placeholder="Enter Bank Name"
                  value={newPayment.bankName}
                  onChangeText={(text) =>
                    setNewPayment({ ...newPayment, bankName: text })
                  }
                />
              )}

              {/* Payment Date */}
              <TouchableOpacity
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  marginBottom: 16,
                  paddingHorizontal: 8,
                }}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ fontSize: 14, color: "#374151" }}>
                  Payment Date:{" "}
                  <Text style={{ fontWeight: "600" }}>
                    {moment(newPayment.paymentDate).format("DD-MMM-YYYY")}
                  </Text>
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={newPayment.paymentDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {/* Image Picker and Camera */}
              {/* Image Picker and Camera */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", marginBottom: 8 }}
                >
                  Upload Payment Receipt
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#10B981",
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      flex: 0.48,
                      alignItems: "center",
                    }}
                    onPress={openCamera}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "700" }}>
                      Take Photo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#3B82F6",
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      flex: 0.48,
                      alignItems: "center",
                    }}
                    onPress={openImagePicker}
                  >
                    <Text style={{ color: "#FFF", fontWeight: "700" }}>
                      Upload
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Display Uploaded Images */}
              {/* Display Uploaded Images */}
              <View style={{ marginTop: 16 }}>
                {newPayment.receiptPhoto.length > 0 &&
                  newPayment.receiptPhoto.map((uri, index) => (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                        marginBottom: 8,
                        marginRight: 8,
                        alignItems: "flex-start",
                        width: 100,
                        height: 100,
                      }}
                    >
                      <Image
                        source={{ uri }}
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 8,
                        }}
                      />
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          top: 4,
                          left: 4,
                          backgroundColor: "rgba(255, 0, 0, 0.8)",
                          borderRadius: 12,
                          padding: 4,
                        }}
                        onPress={() => {
                          setNewPayment({
                            ...newPayment,
                            receiptPhoto: newPayment.receiptPhoto.filter(
                              (imageUri, imgIndex) => imgIndex !== index
                            ),
                          });
                        }}
                      >
                        <Text
                          style={{
                            color: "#FFF",
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          ✕
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>

              {/* Save and Cancel Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#10B981",
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 0.48,
                    alignItems: "center",
                  }}
                  onPress={handleSavePayment}
                >
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#EF4444",
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 0.48,
                    alignItems: "center",
                  }}
                  onPress={closeAddPaymentModal}
                >
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </TouchableOpacity>
    </View>
  );
};
const DispatchList = () => {
  const { user } = useGlobalContext();
  const sales_id = user?.response?.data?._id;
  const jobTitle = user?.response?.data?.jobTitle;
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPlantTypes, setSelectedPlantTypes] = useState([]);
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedSubtypes, setSelectedSubtypes] = useState([]);
  const [selectedTalukas, setSelectedTalukas] = useState([]);

  // Get unique values from the order list

  const [uniquePlantTypes, setUniquePlantTypes] = useState([]);
  // Get subtypes based on selected plant types
  const uniqueSubtypes = [
    ...new Set(
      orderList
        .filter(
          (order) =>
            selectedPlantTypes.length === 0 ||
            selectedPlantTypes.includes(order?.plantType?.name)
        )
        .map((order) => order?.plantSubtype?.name)
    ),
  ].filter(Boolean);

  // Get unique talukas and villages
  const uniqueTalukas = [
    ...new Set(orderList.map((order) => order?.farmer?.taluka)),
  ].filter(Boolean);

  const togglePlantType = (type) => {
    setSelectedPlantTypes((prev) => {
      const newTypes = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      // Clear subtypes when plant types change
      setSelectedSubtypes([]);
      return newTypes;
    });
  };

  const toggleSubtype = (subtype) => {
    setSelectedSubtypes((prev) =>
      prev.includes(subtype)
        ? prev.filter((s) => s !== subtype)
        : [...prev, subtype]
    );
  };

  const toggleTaluka = (taluka) => {
    setSelectedTalukas((prev) => {
      const newTalukas = prev.includes(taluka)
        ? prev.filter((t) => t !== taluka)
        : [...prev, taluka];
      // Clear villages when talukas change
      setSelectedVillages([]);
      return newTalukas;
    });
  };

  const toggleVillage = (village) => {
    setSelectedVillages((prev) =>
      prev.includes(village)
        ? prev.filter((v) => v !== village)
        : [...prev, village]
    );
  };

  const applyFilters = () => {
    let filtered = [...orderList];

    // Apply plant type filter
    if (selectedPlantTypes.length > 0) {
      filtered = filtered.filter((order) =>
        selectedPlantTypes.includes(order?.plantType?.name)
      );
    }

    // Apply subtype filter
    if (selectedSubtypes.length > 0) {
      filtered = filtered.filter((order) =>
        selectedSubtypes.includes(order?.plantSubtype?.name)
      );
    }

    // Apply taluka filter
    if (selectedTalukas.length > 0) {
      filtered = filtered.filter((order) =>
        selectedTalukas.includes(order?.farmer?.taluka)
      );
    }

    // Apply village filter
    if (selectedVillages.length > 0) {
      filtered = filtered.filter((order) =>
        selectedVillages.includes(order?.farmer?.village)
      );
    }

    setOrderList(filtered);
    setShowFilterModal(false);
    setIsFilterActive(true);
  };

  // Filter Modal State

  const [uniqueVillages, setUniqueVillages] = useState([]);

  // Extract unique values effect
  useEffect(() => {
    const plantTypes = [
      ...new Set(orderList.map((order) => order?.plantType?.name)),
    ].filter(Boolean);
    const villages = [
      ...new Set(orderList.map((order) => order?.farmer?.village)),
    ].filter(Boolean);
    setUniquePlantTypes(plantTypes);
    setUniqueVillages(villages);
  }, [orderList]);
  useFocusEffect(
    useCallback(() => {
      getOrders();
    }, [startDate, endDate, debouncedSearchQuery])
  );

  const getOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/order/getOrders", {
        params: {
          salesPerson:
            jobTitle === "OFFICE_STAFF" || jobTitle === "OFFICE_ADMIN"
              ? ""
              : sales_id,
          search: debouncedSearchQuery,
          dispatched: true,
          status: "DISPATCH_PROCESS,DISPATCHED",
        },
      });
      if (response.data) {
        setOrderList(
          Array.isArray(response.data?.data) ? response.data.data : []
        );
      }
    } catch (error) {
      console.error(error);

      Alert.alert("Error", "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate, isStartDate) => {
    if (event.type === "set") {
      if (isStartDate) {
        setShowStartDatePicker(false);
        setStartDate(selectedDate);
      } else {
        setShowEndDatePicker(false);
        setEndDate(selectedDate);
      }
      setIsFilterActive(true);
    } else {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
  };
  const onRefresh = async () => {
    //  setRefreshing(true);
    await getOrders();
    //  setRefreshing(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setIsFilterActive(false);
    //setFilteredOrders(orderList);
  };

  const FilterHeader = () => (
    <View className="mb-4">
      <Text className="text-2xl font-bold mb-4 text-gray-900">Place Order</Text>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-lg mb-4 border border-gray-200">
        <View className="p-2 pl-3">
          <Feather name="search" size={20} color="#6B7280" />
        </View>
        <TextInput
          className="flex-1 p-2 text-gray-900"
          placeholder="Search by type or number of plants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={false} // Prevent auto-focus
          returnKeyType="done" // Handle enter key gracefully
        />
        {searchQuery ? (
          <TouchableOpacity className="p-2" onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color="#6B7280" />
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity
        className="flex-row items-center justify-center bg-white p-3 rounded-lg mb-4 border border-gray-200"
        onPress={() => setShowFilterModal(true)}
      >
        <Feather name="filter" size={18} color="#6B7280" />
        <Text className="ml-2 text-gray-700 font-medium">Filters</Text>
      </TouchableOpacity>

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50">
          <View className="mt-auto bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-base font-semibold text-gray-700 mb-2">
              Plant Types
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {uniquePlantTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  className={`mr-2 px-4 py-2 rounded-full ${
                    selectedPlantTypes.includes(type)
                      ? "bg-green-600"
                      : "bg-gray-100"
                  }`}
                  onPress={() => togglePlantType(type)}
                >
                  <Text
                    className={`${
                      selectedPlantTypes.includes(type)
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-base font-semibold text-gray-700 mb-2">
              Villages
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {uniqueVillages.map((village, index) => (
                <TouchableOpacity
                  key={index}
                  className={`mr-2 px-4 py-2 rounded-full ${
                    selectedVillages.includes(village)
                      ? "bg-green-600"
                      : "bg-gray-100"
                  }`}
                  onPress={() => toggleVillage(village)}
                >
                  <Text
                    className={`${
                      selectedVillages.includes(village)
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {village}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="bg-green-600 p-4 rounded-lg items-center"
              onPress={() => {
                applyFilters();
                setShowFilterModal(false);
              }}
            >
              <Text className="text-white font-semibold text-base">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Clear Filters Button */}
      {(searchQuery ||
        isFilterActive ||
        selectedPlantTypes.length > 0 ||
        selectedVillages.length > 0) && (
        <TouchableOpacity
          className="bg-gray-100 p-2 rounded-lg items-center mb-4"
          onPress={clearFilters}
        >
          <Text className="text-gray-700 font-medium">Clear All Filters</Text>
        </TouchableOpacity>
      )}
      {/* Date Filters */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center bg-white p-3 rounded-lg mr-2 border border-gray-200"
          onPress={() => setShowStartDatePicker(true)}
        >
          <Feather name="calendar" size={18} color="#6B7280" />
          <Text className="ml-2 text-gray-700">
            {moment(startDate).format("DD MMM YYYY")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center bg-white p-3 rounded-lg ml-2 border border-gray-200"
          onPress={() => setShowEndDatePicker(true)}
        >
          <Feather name="calendar" size={18} color="#6B7280" />
          <Text className="ml-2 text-gray-700">
            {moment(endDate).format("DD MMM YYYY")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clear Filters Button */}
      {(searchQuery || isFilterActive) && (
        <TouchableOpacity
          className="bg-gray-100 p-2 rounded-lg items-center"
          onPress={clearFilters}
        >
          <Text className="text-gray-700 font-medium">Clear Filters</Text>
        </TouchableOpacity>
      )}

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(event, date) => handleDateChange(event, date, true)}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          onChange={(event, date) => handleDateChange(event, date, false)}
        />
      )}
    </View>
  );
  return (
    <View className="flex-1 bg-gray-50">
      <FullScreenLoader visible={loading} message={"Getting orders"} />
      <FlatList
        data={orderList}
        renderItem={({ item, index }) => (
          <PlaceCard
            item={item}
            index={index}
            getOrders={getOrders}
            jobTitle={jobTitle}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={(item) => item?.id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={FilterHeader}
        keyboardShouldPersistTaps="handled" // Ensure taps don't dismiss the keyboard
      />
    </View>
  );
};

export default DispatchList;
