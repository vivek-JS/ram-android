import React from "react";
import { View, Text } from "react-native";
import { BarChart2, Sprout, Users } from "lucide-react-native";

const BatchStatsSummary = ({ batchData }) => {
  // Calculate total outward plants
  const totalOutwardPlants = batchData.reduce((sum, batch) => {
    return (
      sum +
      batch.outward.reduce((plantSum, outward) => {
        return plantSum + outward.plants;
      }, 0)
    );
  }, 0);

  // Calculate total primary inward plants
  const totalPrimaryInwardPlants = batchData.reduce((sum, batch) => {
    return (
      sum +
      batch.primaryInward.reduce((plantSum, inward) => {
        return plantSum + inward.totalQuantity;
      }, 0)
    );
  }, 0);

  // Calculate total laborers engaged
  const totalLaborers = batchData.reduce((sum, batch) => {
    return (
      sum +
      batch.primaryInward.reduce((laborSum, inward) => {
        return laborSum + (inward.laboursEngaged || 0);
      }, 0)
    );
  }, 0);

  return (
    <View className="px-4 py-3 bg-white">
      <View className="flex-row justify-between space-x-2">
        <View className="flex-1 bg-emerald-50 rounded-lg p-4 border border-emerald-100">
          <View className="flex-row items-center space-x-2 mb-2">
            <Text
              className="text-sm font-bold text-emerald-900"
              numberOfLines={2}
            >
              Lab Outward Plants
            </Text>
          </View>
          <Text className="text-sm font-bold text-emerald-700">
            {totalOutwardPlants?.toLocaleString()}
          </Text>
        </View>

        <View className="flex-1 bg-green-50 rounded-lg p-4 border border-green-100">
          <View className="flex-row items-center space-x-2 mb-2">
            <Text
              className="text-sm font-bold text-green-900"
              numberOfLines={2}
            >
              Inward Plants
            </Text>
          </View>
          <Text className="text-sm font-bold text-green-700">
            {totalPrimaryInwardPlants?.toLocaleString()}
          </Text>
        </View>

        <View className="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <View className="flex-row items-center space-x-2 mb-2">
            <Users size={20} color="#2563eb" />
            <Text className="text-sm font-bold text-blue-900" numberOfLines={2}>
              Total Laborers
            </Text>
          </View>
          <Text className="text-lg font-bold text-blue-700">
            {totalLaborers?.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BatchStatsSummary;
