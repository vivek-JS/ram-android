// FilterComponent.js - New Component
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import SearchablePicker from "./SearchablePicker";

const FilterComponent = ({ batches, onApplyFilters }) => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showBatchPicker, setShowBatchPicker] = useState(false);
  const [filters, setFilters] = useState({
    batchId: "",
    startDate: null,
    endDate: null,
    filterType: "",
  });

  const filterTypes = [
    { label: "Primary Inward Date", value: "primary" },
    { label: "Lab Outward Date", value: "lab" },
    { label: "Rooting Date", value: "labroot" },
    { label: "Expected Outward Date", value: "primaryexpected" },
  ];

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setFilters({ ...filters, startDate: selectedDate });
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setFilters({ ...filters, endDate: selectedDate });
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setFilters({
      batchId: "",
      startDate: null,
      endDate: null,
      filterType: "",
    });
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setFilterModalVisible(true)}
        className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
      >
        <AntDesign name="filter" size={20} color="white" />
        <Text className="text-white ml-2 font-medium">Filters</Text>
      </TouchableOpacity>

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50">
          <View className="mt-auto bg-white rounded-t-xl max-h-[80%]">
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="text-xl font-bold">Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
              {/* Batch Selection */}
              <View className="mb-6">
                <Text className="text-gray-700 mb-2 font-medium">
                  Batch Number
                </Text>
                <TouchableOpacity
                  onPress={() => setShowBatchPicker(true)}
                  className="border border-gray-200 rounded-lg p-3 bg-white flex-row justify-between items-center"
                >
                  <Text>
                    {batches.find((batch) => batch.value === filters.batchId)
                      ?.label || "Select Batch"}
                  </Text>
                  <AntDesign name="down" size={16} color="gray" />
                </TouchableOpacity>
              </View>

              {/* Filter Type Selection */}
              <View className="mb-6">
                <Text className="text-gray-700 mb-2 font-medium">
                  Filter By
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {filterTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() =>
                        setFilters({ ...filters, filterType: type.value })
                      }
                      className={`px-4 py-2 rounded-full border ${
                        filters.filterType === type.value
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <Text
                        className={`${
                          filters.filterType === type.value
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date Range Selection */}
              <View className="mb-6">
                <Text className="text-gray-700 mb-2 font-medium">
                  Date Range
                </Text>

                {/* Start Date */}
                <View className="mb-4">
                  <Text className="text-gray-600 mb-1">Start Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(true)}
                    className="border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    <Text>{filters?.startDate?.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                </View>

                {/* End Date */}
                <View>
                  <Text className="text-gray-600 mb-1">End Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(true)}
                    className="border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    <Text>{filters?.endDate?.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="p-4 border-t border-gray-200 flex-row gap-3">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 p-3 rounded-lg border border-gray-200"
              >
                <Text className="text-center text-gray-700 font-medium">
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApplyFilters}
                className="flex-1 p-3 rounded-lg bg-blue-500"
              >
                <Text className="text-center text-white font-medium">
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Pickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={filters?.startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={filters?.endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
            />
          )}

          {/* Batch Picker */}
          <SearchablePicker
            isVisible={showBatchPicker}
            onClose={() => setShowBatchPicker(false)}
            onSelect={(value) => setFilters({ ...filters, batchId: value })}
            options={batches}
            selectedValue={filters.batchId}
            title="Select Batch"
          />
        </View>
      </Modal>
    </View>
  );
};

export default FilterComponent;

// Changes to make in your existing AddPrimaryPlantationForm.js:

// 1. Import the new FilterComponent at the top:

// 2. Add this new function inside AddPrimaryPlantationForm component:
