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
import { getWalleetDetails } from "./Helpers/orderApicalls";
import WalletStatsCard from "./WalletSatts";

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
const PlaceCard = ({ item, index, getOrders, delaerWallet, jobTitle }) => {
  const { financial } = delaerWallet || {};
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
  } = item || {};

  const { startDay, endDay } = bookingSlot[0] || {};
  const start = moment(startDay, "DD-MM-YYYY").format("D");
  const end = moment(endDay, "DD-MM-YYYY").format("D");
  const monthYear = moment(startDay, "DD-MM-YYYY").format("MMMM, YYYY");
  const { name, district, taluka, village } = farmer || {};
  const [isCollapsed, setIsCollapsed] = useState(true);
  const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);
  const [isAddPaymentModalVisible, setAddPaymentModalVisible] = useState(false);
  const [newPayment, setNewPayment] = useState({
    paidAmount: "",
    paymentDate: new Date(), // Default to today's date
    bankName: "",
    modeOfPayment: "",
    paymentStatus: "PENDING",
    receiptPhoto: [],
    useWallet: false, // This will only be used for DEALER
  });
  const [showDatePicker, setShowDatePicker] = useState(false); // State to show date picker
  const bgColor = index % 2 === 0 ? "white" : "#F9FAFB";
  const statusColors = {
    ACCEPTED: "rgb(21 128 61)",
    PENDING: "#FCD34D",
    REJECTED: "#F87171",
    PROCESSING: "#D1D5DB",
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
      let paymentData = { ...newPayment };

      // If DEALER and wallet payment is selected
      if (jobTitle === "DEALER" && newPayment.useWallet) {
        // Validate wallet balance before proceeding
        if (Number(newPayment.paidAmount) > (financial?.availableAmount ?? 0)) {
          Alert.alert("Error", "Insufficient wallet balance");
          return;
        }
        paymentData.isWalletPayment = true;
      }

      // Send PATCH request to the server
      const response = await axiosInstance.patch(
        `/order/payment/${item?._id}`,
        paymentData
      );

      if (response.status === 200) {
        Alert.alert("Success", "Payment added successfully");
        getOrders();
        closeAddPaymentModal();
        return response.data;
      } else {
        Alert.alert("Error", "Failed to add payment");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      Alert.alert("Error", "An error occurred while adding the payment");
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
            <View
              style={{
                backgroundColor: statusColor,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                alignSelf: "center",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFF" }}>
                {orderStatus}
              </Text>
            </View>

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
            Order #: {orderId}
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
        <Text style={{ fontSize: 14, color: "#111827", marginVertical: 6 }}>
          Booking Date:{" "}
          <Text style={{ fontWeight: "600" }}>
            {moment(createdAt).format("DD-MMM-YYYY")}
          </Text>
        </Text>
        <Text style={{ fontSize: 14, color: "#111827", marginVertical: 6 }}>
          Delivery Dateddd:{" "}
          <Text style={{ fontWeight: "600" }}>
            {`${start} - ${end} ${monthYear}`}{" "}
          </Text>
        </Text>
        {/*  */}
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
              Plant Type
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
              {/* Before the Save and Cancel Buttons */}
              {/* Before the Save and Cancel Buttons */}
              {jobTitle === "DEALER" && (
                <View className="mb-4">
                  <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-2">
                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() =>
                          setNewPayment((prev) => ({
                            ...prev,
                            useWallet: !prev.useWallet,
                          }))
                        }
                        className="mr-3"
                      >
                        <View
                          className={`w-5 h-5 rounded border ${
                            newPayment.useWallet
                              ? "bg-green-500 border-green-500"
                              : "border-gray-300"
                          } justify-center items-center`}
                        >
                          {newPayment.useWallet && (
                            <Feather name="check" size={14} color="#fff" />
                          )}
                        </View>
                      </TouchableOpacity>
                      <Text className="text-gray-700 font-medium">
                        Pay from Wallet
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-gray-500">
                        Wallet Balance
                      </Text>
                      <Text
                        className={`text-base font-bold ${
                          newPayment.useWallet &&
                          Number(newPayment.paidAmount) >
                            (financial?.availableAmount ?? 0)
                            ? "text-red-600"
                            : "text-gray-800"
                        }`}
                      >
                        ₹{(financial?.availableAmount ?? 0)?.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Warning messages for wallet payment */}
                  {newPayment.useWallet && (
                    <>
                      {Number(newPayment.paidAmount) >
                        (financial?.availableAmount ?? 0) && (
                        <View className="bg-red-50 p-3 rounded-lg mb-2">
                          <Text className="text-sm text-red-600 font-medium">
                            Insufficient wallet balance! Available: ₹
                            {(
                              financial?.availableAmount ?? 0
                            )?.toLocaleString()}
                          </Text>
                        </View>
                      )}

                      {!newPayment.paidAmount && (
                        <View className="bg-amber-50 p-3 rounded-lg mb-2">
                          <Text className="text-sm text-amber-600 font-medium">
                            Please enter payment amount
                          </Text>
                        </View>
                      )}

                      {Number(newPayment.paidAmount) <=
                        (financial?.availableAmount ?? 0) &&
                        newPayment.paidAmount && (
                          <View className="bg-green-50 p-3 rounded-lg mb-2">
                            <Text className="text-sm text-green-600 font-medium">
                              Sufficient balance available
                            </Text>
                          </View>
                        )}
                    </>
                  )}
                </View>
              )}

              {/* Save and Cancel Buttons */}
              <View className="flex-row justify-between">
                <TouchableOpacity
                  className={`py-3 rounded-lg flex-1 items-center mr-2 ${
                    jobTitle === "DEALER" &&
                    newPayment.useWallet &&
                    (Number(newPayment.paidAmount) >
                      (financial?.availableAmount ?? 0) ||
                      !newPayment.paidAmount)
                      ? "bg-gray-300"
                      : "bg-green-500"
                  }`}
                  onPress={handleSavePayment}
                  disabled={
                    jobTitle === "DEALER" &&
                    newPayment.useWallet &&
                    (Number(newPayment.paidAmount) >
                      (financial?.availableAmount ?? 0) ||
                      !newPayment.paidAmount)
                  }
                >
                  <Text
                    className={`font-bold ${
                      jobTitle === "DEALER" &&
                      newPayment.useWallet &&
                      (Number(newPayment.paidAmount) >
                        (financial?.availableAmount ?? 0) ||
                        !newPayment.paidAmount)
                        ? "text-gray-500"
                        : "text-white"
                    }`}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-500 py-3 rounded-lg flex-1 items-center ml-2"
                  onPress={closeAddPaymentModal}
                >
                  <Text className="text-white font-bold">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </TouchableOpacity>
    </View>
  );
};
const PlacesList = () => {
  const { user } = useGlobalContext();
  const sales_id = user?.response?.data?._id;
  const jobTitle = user?.response?.data?.jobTitle;
  console.log(delaerWallet);
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
  const [delaerWallet, setDelaerWallet] = useState({});
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000); // 500ms delay

    return () => {
      clearTimeout(handler); // Cleanup timeout on query change
    };
  }, [searchQuery]);
  useEffect(() => {
    if (jobTitle !== "DEALER") {
      return;
    }
    getWalleetDetails(sales_id, setDelaerWallet);
  }, [sales_id, startDate, endDate, debouncedSearchQuery]);
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
          salesPerson: sales_id,
          search: debouncedSearchQuery,
          startDate: moment(startDate).format("DD-MM-YYYY"),
          endDate: moment(endDate).format("DD-MM-YYYY"),
        },
      });
      if (response.data) {
        console.log("orders", response.data);
        setOrderList(
          Array.isArray(response.data?.data) ? response.data.data : []
        );
        getWalleetDetails(sales_id, setDelaerWallet, setLoading);
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
    setStartDate(new Date());
    setEndDate(new Date());
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
      {delaerWallet && (
        <WalletStatsCard
          plantsData={delaerWallet?.plantDetails}
          financial={delaerWallet?.financial}
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
            delaerWallet={delaerWallet}
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

export default PlacesList;
