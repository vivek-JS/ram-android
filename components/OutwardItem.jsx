import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  FlaskConical,
  Calendar,
  BarChart2,
  Leaf,
  Check,
} from "lucide-react-native";

const OutwardItem = ({ outward, isSelected, onSelect, formatDate }) => {
  return (
    <Pressable
      onPress={() => onSelect(outward, false)}
      onLongPress={() => onSelect(outward, true)}
      delayLongPress={500}
      activeOpacity={0.7}
      className={`${
        isSelected
          ? "bg-green-100 border-green-500"
          : "bg-green-50 border-green-100"
      } border rounded-xl mb-3 p-4 shadow-sm`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <View className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 z-10">
          <Check size={16} color="white" />
        </View>
      )}

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
            {outward?.plants?.toLocaleString()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default OutwardItem;
