import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useGlobalContext } from "../context/GlobalProvider";
import axiosInstance from "./api/api_instance";
import moment from "moment";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Loader from "./Loader";
import { FullScreenLoader, SimpleLoader } from "../components/LoaderNew";

const PlaceCard = ({ item, index }) => {
  const {
    createdAt,
    numberOfPlants,
    typeOfPlants,
    orderStatus = "Processing",
    farmer,
    advance,
    dateOfAdvance,
  } = item || {};
  const { name } = farmer || {};
  const handleCardPress = () => {
    router.push({
      pathname: "/add-place",
      params: {
        mode: "edit",
        id: orderStatus, // Assuming your item has an _id
        data: JSON.stringify(item), // Sending the whole item as a stringified object
      },
    });
  };
  const handleEdit = () => {
    // Add your edit logic here
    Alert.alert("Edit", "Edit functionality to be implemented");
  };

  const handleDelete = () => {
    Alert.alert("Delete Order", "Are you sure you want to delete this order?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          // Add your delete logic here
          console.log("Delete order:", item.id);
        },
        style: "destructive",
      },
    ]);
  };
  // Faint alternating background colors
  const bgColor = index % 2 === 0 ? "white" : "#F9FAFB";
  const statusColors = {
    Accepted: "rgb(21 128 61)",

    Pending: "#FCD34D", // Yellow
    Rejected: "#F87171", // Red
    Processing: "#D1D5DB", // Light gray
  };
  const statusColor = statusColors[orderStatus] || "#9CA3AF"; // Default gray

  return (
    <View className="mb-6">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleCardPress()} // Add this handler
        style={{
          backgroundColor: bgColor,
          borderRadius: 12,
          padding: 16,
          borderColor: "#E5E7EB",
          borderWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex justify-between flex-row">
          <View
            style={{
              backgroundColor: statusColor,
              paddingVertical: 6,
              paddingHorizontal: 8, // Slightly increased for padding around text
              borderRadius: 4,
              alignSelf: "flex-start", // Adapts width to the text content
              zIndex: 1,
            }}
          >
            <Text className="text-xs font-semibold text-white">
              {orderStatus}
            </Text>
          </View>
          <View className="flex-row items-center bg-gray-100 rounded-lg overflow-hidden ml-2">
            <TouchableOpacity
              onPress={handleEdit}
              className="p-2 border-r border-gray-200"
            >
              <Feather name="edit-2" size={14} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <Feather name="trash-2" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-bold text-gray-900">{name}</Text>
          <Text className="text-sm text-gray-600">{`(${typeOfPlants} | ${numberOfPlants})`}</Text>
        </View>

        <Text className="text-sm text-gray-800">
          Booking Date:{" "}
          <Text className="font-medium">
            {moment(createdAt).format("DD-MMM-YYYY")}
          </Text>
        </Text>
        <Text className="text-sm text-gray-800">
          Delivery Date:{" "}
          <Text className="font-medium">
            {moment(createdAt).format("DD-MMM-YYYY")}
          </Text>
        </Text>

        {/* Breaker line */}
        <View
          style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 6 }}
        />

        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-sm font-medium text-gray-800">
            Advance:{" "}
            <Text className="text-gray-900">{`₹${advance} - ${moment(
              dateOfAdvance
            ).format("DD-MMM-YYYY")}`}</Text>
          </Text>
          <View className="w-5 h-5 rounded-full bg-yellow-400 items-center justify-center ml-2">
            <Feather name="check" size={12} color="black" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const PlacesList = () => {
  const { user } = useGlobalContext();
  const sales_id = user?.response?.data?._id;
  const [orderList, setOrderList] = useState();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000); // 500ms delay

    return () => {
      clearTimeout(handler); // Cleanup timeout on query change
    };
  }, [searchQuery]);
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
        },
      });
      if (response.data) {
        setOrderList(response.data?.data);
      }
    } catch (error) {
      console.error("API Error:", error);
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
    </View>
  );
  return (
    <View className="flex-1 bg-gray-50">
      <FullScreenLoader visible={loading} message={"Getting orders"} />
      <FlatList
        data={orderList}
        renderItem={({ item, index }) => (
          <PlaceCard item={item} index={index} />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={FilterHeader}
        keyboardShouldPersistTaps="handled" // Ensure taps don't dismiss the keyboard
      />
    </View>
  );
};

export default PlacesList;
