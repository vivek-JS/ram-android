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
    orderRemarks = [], // Extract orderRemarks with default empty array
  } = item || {};

  const { startDay, endDay } = bookingSlot[0] || {};
  const start = moment(startDay, "DD-MM-YYYY").format("D");
  const end = moment(endDay, "DD-MM-YYYY").format("D");
  const monthYear = moment(startDay, "DD-MM-YYYY").format("MMMM, YYYY");
  const { name, district, taluka, village, talukaName } = farmer || {};

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isRemarksCollapsed, setIsRemarksCollapsed] = useState(true);
  const [isAddPaymentModalVisible, setAddPaymentModalVisible] = useState(false);
  const [isRemarkModalVisible, setRemarkModalVisible] = useState(false);
  const [remarkText, setRemarkText] = useState("");

  const [newPayment, setNewPayment] = useState({
    paidAmount: "",
    paymentDate: new Date(),
    bankName: "",
    modeOfPayment: "",
    paymentStatus: "PENDING",
    receiptPhoto: [],
    useWallet: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const bgColor = index % 2 === 0 ? "white" : "#F9FAFB";
  const statusColors = {
    ACCEPTED: "rgb(21 128 61)",
    PENDING: "#FCD34D",
    REJECTED: "#F87171",
    PROCESSING: "#D1D5DB",
  };
  const statusColor = statusColors[orderStatus] || "#9CA3AF";

  // Toggle handlers
  const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);
  const handleRemarksCollapseToggle = () =>
    setIsRemarksCollapsed(!isRemarksCollapsed);

  // Modal handlers
  const openAddPaymentModal = () => setAddPaymentModalVisible(true);
  const closeAddPaymentModal = () => setAddPaymentModalVisible(false);
  const openRemarkModal = () => {
    setRemarkText("");
    setRemarkModalVisible(true);
  };

  // Add remark function
  const addRemark = async () => {
    if (!remarkText.trim()) {
      Alert.alert("Error", "Please enter a remark");
      return;
    }

    try {
      const response = await axiosInstance.patch(`/order/updateOrder`, {
        id: item?._id,
        orderRemarks: remarkText.trim(),
      });

      if (response.status === 200) {
        Alert.alert("Success", "Remark added successfully");
        getOrders(); // Refresh orders to reflect the changes
        setRemarkModalVisible(false);
        setRemarkText("");
      } else {
        Alert.alert("Error", "Failed to add remark");
      }
    } catch (error) {
      console.error("Error adding remark:", error);
      Alert.alert("Error", "An error occurred while adding the remark");
    }
  };

  // Payment handlers
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newPayment.paymentDate;
    setShowDatePicker(false);
    setNewPayment({ ...newPayment, paymentDate: currentDate });
  };

  const handleSavePayment = () => {
    addPayment(newPayment);
    setAddPaymentModalVisible(false);
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

  // Image handlers
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

  // Format remarks for display
  const hasRemarks = Array.isArray(orderRemarks) && orderRemarks.length > 0;

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
                talukaName,
                bookingSlot,
              }}
            />

            {/* Remark Button */}
            <TouchableOpacity
              style={{
                backgroundColor: "#4F46E5",
                padding: 6,
                borderRadius: 20,
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.41,
              }}
              onPress={openRemarkModal}
            >
              <Feather name="message-square" size={16} color="#FFF" />
            </TouchableOpacity>
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
        </View>
        <View>
          <Text style={{ fontSize: 14, color: "#6B7280" }}>
            {talukaName} → {village}
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: "#111827", marginVertical: 6 }}>
          Booking Date:{" "}
          <Text style={{ fontWeight: "600" }}>
            {moment(createdAt).format("DD-MMM-YYYY")}
          </Text>
        </Text>
        <Text style={{ fontSize: 14, color: "#111827", marginVertical: 6 }}>
          Delivery Date:{" "}
          <Text style={{ fontWeight: "600" }}>
            {`${start} - ${end} ${monthYear}`}
          </Text>
        </Text>

        {/* Plant Information */}
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

        {/* Payment summary */}
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

        {/* Remarks Section */}
        {hasRemarks && (
          <View style={{ marginBottom: 12 }}>
            <TouchableOpacity
              onPress={handleRemarksCollapseToggle}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#4F46E5" }}
              >
                Remarks
              </Text>
              <Feather
                name={isRemarksCollapsed ? "chevron-down" : "chevron-up"}
                size={20}
                color="#4F46E5"
              />
            </TouchableOpacity>

            {!isRemarksCollapsed && (
              <View
                style={{
                  backgroundColor: "#EEF2FF",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: "#4F46E5",
                }}
              >
                {orderRemarks.map((remark, idx) => (
                  <View
                    key={idx}
                    style={{
                      marginBottom: idx < orderRemarks.length - 1 ? 8 : 0,
                      paddingBottom: idx < orderRemarks.length - 1 ? 8 : 0,
                      borderBottomWidth: idx < orderRemarks.length - 1 ? 1 : 0,
                      borderBottomColor: "#CBD5E1",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: "#4B5563" }}>
                      {remark}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Payments Section */}
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

              {/* Payment form fields... */}
              {/* (Payment modal content remains the same) */}
            </View>
          </View>
        </Modal>

        {/* Remark Modal */}
        <Modal
          visible={isRemarkModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setRemarkModalVisible(false)}
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
                Add Remark
              </Text>

              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 16,
                  color: "#1F2937",
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Enter your remark here..."
                value={remarkText}
                onChangeText={setRemarkText}
                multiline={true}
                numberOfLines={4}
              />

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
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: "center",
                    marginRight: 8,
                  }}
                  onPress={addRemark}
                >
                  <Text style={{ color: "#FFF", fontWeight: "700" }}>
                    Save Remark
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#EF4444",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: "center",
                    marginLeft: 8,
                  }}
                  onPress={() => setRemarkModalVisible(false)}
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
  console.log("orderk", orderList);
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
