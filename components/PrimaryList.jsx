import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Leaf,
  FlaskConical,
  Calendar,
  BarChart2,
  Archive,
  ChevronDown,
} from "lucide-react-native";
import axiosInstance from "../components/api/api_instance";
import { useFocusEffect } from "expo-router";
import FilterComponent from "./FilterComponent";
import { getBatches } from "./Helpers/districts";
import BatchStatsSummary from "./BatchSummary";

const BatchCards = () => {
  const [batchData, setBatchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [batches, setBatches] = useState([]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getOutwards().then(() => setRefreshing(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getOutwards();
      getBatches(setBatches);
    }, [])
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const getOutwards = async (filterParams = null) => {
    try {
      setLoading(true);
      let url = "/laboutward/outwards";

      if (filterParams) {
        const queryParams = new URLSearchParams();

        if (filterParams.startDate && filterParams.endDate) {
          queryParams.append("startDate", filterParams.startDate.toISOString());
          queryParams.append("endDate", filterParams.endDate.toISOString());

          if (filterParams.filterType) {
            queryParams.append(filterParams.filterType, "true");
          }
        }
        if (filterParams.batchId) {
          queryParams.append("batchId", filterParams.batchId);
        }
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }

      const response = await axiosInstance.get(url);

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

  // Add this function in BatchCards component:
  const handleApplyFilters = (filters) => {
    console.log("filters", filters);
    if (filters === null) {
      getOutwards(); // Reset to default data
    } else {
      getOutwards(filters); // Apply filters
    }
  };

  // Component for displaying individual outward items
  const OutwardItem = ({ outward }) => (
    <View className="bg-green-50 border border-green-100 rounded-xl mb-3 p-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center space-x-2">
          <FlaskConical size={20} color="#15803d" />
          <Text className="text-sm font-bold text-green-800">Size:</Text>
          <Text className="text-base text-green-900 font-semibold">
            {outward.size}
          </Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <BarChart2 size={20} color="#15803d" />
          <Text className="text-sm font-bold text-green-800">Bottles:</Text>
          <Text className="text-base text-green-900 font-semibold">
            {outward.bottles}
          </Text>
        </View>
      </View>
      <View className="border-t border-green-100 pt-3 mt-2 flex-col justify-start items-start">
        <View className="flex-row items-center space-x-2">
          <Calendar size={18} color="#15803d" />
          <Text className="text-sm font-bold text-green-800">
            Outward Date:
          </Text>
          <Text className="text-sm text-green-900">
            {formatDate(outward.outwardDate)}
          </Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <Leaf size={18} color="#15803d" />
          <Text className="text-sm font-bold text-green-800">Plants:</Text>
          <Text className="text-sm text-green-900">
            {outward.plants.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );

  // Component for displaying primary inward items
  const PrimaryInwardItem = ({ inward }) => (
    <View className="bg-blue-50 border border-blue-100 rounded-xl mb-3 p-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center space-x-2">
          <Archive size={20} color="#1d4ed8" />
          <Text className="text-sm font-bold text-blue-800">Size:</Text>
          <Text className="text-base text-blue-900 font-semibold">
            {inward.size}
          </Text>
        </View>
        <View className="flex-row items-center space-x-2">
          <BarChart2 size={20} color="#1d4ed8" />
          <Text className="text-sm font-bold text-blue-800">Bottles:</Text>
          <Text className="text-base text-blue-900 font-semibold">
            {inward.numberOfBottles}
          </Text>
        </View>
      </View>
      <View className="border-t border-blue-100 pt-3 mt-2 flex-col justify-start items-start">
        <View className="flex-row items-center space-x-2">
          <Calendar size={18} color="#1d4ed8" />
          <Text className="text-sm font-bold text-blue-800">Inward Date:</Text>
          <Text className="text-sm text-blue-900">
            {formatDate(inward.primaryInwardDate)}
          </Text>
        </View>
      </View>
      <View className="border-t border-blue-100 pt-3 mt-2 flex-col justify-start items-start">
        <View className="flex-row items-center space-x-2">
          <Calendar size={18} color="#1d4ed8" />
          <Text className="text-sm font-bold text-blue-800">Labours</Text>
          <Text className="text-sm text-blue-900">
            {inward?.laboursEngaged}
          </Text>
        </View>
      </View>
    </View>
  );

  // Component for displaying the summary
  const SummaryCard = ({ summary }) => (
    <View className="bg-white border border-green-100 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-3">
        <FlaskConical size={24} color="#15803d" />
        <Text className="text-lg font-bold text-green-900 ml-2">
          Size Summary
        </Text>
      </View>
      {Object.entries(summary).map(([size, data], index) => {
        if (size === "total") return null; // Skip total in this view
        return (
          <View
            key={size}
            className={`flex-row justify-between items-center py-3 ${
              index < Object.keys(summary).length - 2
                ? "border-b border-green-50"
                : ""
            }`}
          >
            <View className="flex-row items-center space-x-2">
              <View className="bg-green-100 p-2 rounded-full">
                <Text className="text-green-800 font-semibold">{size}</Text>
              </View>
            </View>
            <View className="flex-row space-x-4">
              <View className="flex-row items-center space-x-1">
                <BarChart2 size={16} color="#15803d" />
                <Text className="text-green-900">{data.totalBottles} Out</Text>
              </View>
              <View className="flex-row items-center space-x-1">
                <Leaf size={16} color="#15803d" />
                <Text className="text-green-900">
                  {data.totalPlants.toLocaleString()} Plants
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );

  // Main BatchCard component
  const BatchCard = ({ batch }) => {
    const [expanded, setExpanded] = useState(false);
    const hasPrimaryInward =
      batch.primaryInward && batch.primaryInward.length > 0;

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mb-4 shadow-md border border-green-100 overflow-hidden"
        activeOpacity={0.7}
        onPress={() => hasPrimaryInward && setExpanded(!expanded)}
      >
        <View className="p-4 border-b border-green-100 bg-green-50 flex-row justify-between items-center">
          <View>
            <View className="flex-row items-center space-x-2">
              <Leaf size={24} color="#15803d" />
              <Text className="text-lg font-bold text-green-900">
                Batch #{batch.batchId.batchNumber}
              </Text>
            </View>
            <Text className="text-sm text-green-700 mt-1">
              Added: {formatDate(batch.batchId.dateAdded)}
            </Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <View
              className={`px-3 py-1 rounded-full ${
                batch.isActive ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  batch.isActive ? "text-green-800" : "text-red-800"
                }`}
              >
                {batch.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          {batch.outward.length > 0 ? (
            <>
              {batch.outward.map((outward) => (
                <OutwardItem key={outward._id} outward={outward} />
              ))}

              <SummaryCard summary={batch.summary} />

              <View className="border-t border-green-100 mt-4 pt-4 space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-green-800 font-semibold">
                    Total Primary Inward:
                  </Text>
                  <View className="bg-green-50 px-3 py-1 rounded-full">
                    <Text className="font-bold text-green-800">
                      {batch.summary.total.primaryInwardBottles}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-green-800 font-semibold">
                    Total Outward Plants:
                  </Text>
                  <Text className="text-green-900">
                    {batch.summary.total.plants.toLocaleString()}
                  </Text>
                </View>
              </View>

              {hasPrimaryInward && (
                <View className="mt-4">
                  <View className="border-t border-green-100 pt-4">
                    <TouchableOpacity
                      onPress={() => setExpanded(!expanded)}
                      className="flex-row items-center justify-between mb-3"
                    >
                      <View className="flex-row items-center">
                        <Archive size={24} color="#1d4ed8" />
                        <Text className="text-lg font-bold text-blue-900 ml-2">
                          Primary Inward Details
                        </Text>
                      </View>
                      <View className="flex-row items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
                        <ChevronDown
                          size={16}
                          color={expanded ? "#15803d" : "#1d4ed8"}
                          style={{
                            transform: [
                              { rotate: expanded ? "180deg" : "0deg" },
                            ],
                          }}
                        />
                        <Text className="text-xs text-blue-800">
                          {expanded ? "Collapse" : "Expand"}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {expanded && (
                      <>
                        {batch.primaryInward.map((inward) => (
                          <PrimaryInwardItem key={inward._id} inward={inward} />
                        ))}
                      </>
                    )}
                  </View>
                </View>
              )}
            </>
          ) : (
            <Text className="text-center text-green-600 py-4">
              No outward data available
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-green-800">Loading Batches...</Text>
      </View>
    );
  }

  if (batchData.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-green-800">No Batches Found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-green-25">
      <View className="px-4 py-3 bg-white border-b border-green-100">
        <FilterComponent
          onApplyFilters={handleApplyFilters}
          batches={batches}
        />
      </View>
      <BatchStatsSummary batchData={batchData} />
      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#15803d"]}
            tintColor="#15803d"
            title="Pull to refresh"
          />
        }
      >
        {batchData.map((batch) => (
          <BatchCard key={batch._id} batch={batch} />
        ))}
      </ScrollView>
    </View>
  );
};

export default BatchCards;
