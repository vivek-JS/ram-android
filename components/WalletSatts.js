import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import moment from "moment";

const WalletStatsCard = ({ plantsData = [], financial = {} }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Quick Financial Overview - Always Visible
  const QuickFinancials = () => {
    const {
      availableAmount = 0,
      remainingAmount = 0,
      totalPaidAmount = 0,
    } = financial;

    return (
      <View className="flex-row mb-4 -mx-1">
        <View className="flex-1 px-1">
          <View className="bg-green-50 p-3 rounded-xl">
            <Text className="text-xs text-green-600 mb-1">Available</Text>
            <Text className="text-base font-bold text-green-800">
              ₹{availableAmount?.toLocaleString()}
            </Text>
          </View>
        </View>
        <View className="flex-1 px-1">
          <View className="bg-purple-50 p-3 rounded-xl">
            <Text className="text-xs text-purple-600 mb-1">Paid</Text>
            <Text className="text-base font-bold text-purple-800">
              ₹{totalPaidAmount?.toLocaleString()}
            </Text>
          </View>
        </View>
        <View className="flex-1 px-1">
          <View className="bg-amber-50 p-3 rounded-xl">
            <Text className="text-xs text-amber-600 mb-1">Remaining</Text>
            <Text className="text-base font-bold text-amber-800 text-sm">
              ₹{remainingAmount?.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const AccordionItem = ({ item, index, isExpanded, onPress }) => {
    const totalQuantity = item?.totalQuantity ?? 0;
    const totalBookedQuantity = item?.totalBookedQuantity ?? 0;
    const totalRemainingQuantity = item?.totalRemainingQuantity ?? 0;

    const bookingPercentage = Math.min(
      Math.round((totalBookedQuantity / (totalQuantity || 1)) * 100),
      100
    );

    return (
      <View className="mb-3 bg-white rounded-2xl shadow">
        <TouchableOpacity
          onPress={onPress}
          className="p-4 flex-row justify-between items-center"
        >
          <View className="flex-1">
            <View className="flex-row items-center">
              <View
                className={`p-2 rounded-lg mr-3 ${
                  bookingPercentage > 90 ? "bg-red-50" : "bg-green-50"
                }`}
              >
                <Feather
                  name="box"
                  size={20}
                  color={bookingPercentage > 90 ? "#DC2626" : "#059669"}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">
                  {item?.plantName ?? "Unknown Plant"}
                </Text>
                <Text className="text-sm text-gray-500">
                  {item?.subtypeName ?? "Unknown Variety"}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="items-end mr-3">
              <Text className="text-xs text-gray-500">Available</Text>
              <Text
                className={`text-sm font-semibold ${
                  totalRemainingQuantity < 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {totalRemainingQuantity?.toLocaleString()}
              </Text>
            </View>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View className="px-4 pb-4">
            <View className="flex-row justify-between mb-5">
              <View className="flex-1 bg-green-50 p-3 rounded-xl mr-2">
                <Text className="text-xs text-green-600 mb-1">Total Stock</Text>
                <Text className="text-base font-bold text-green-800">
                  {totalQuantity?.toLocaleString()}
                </Text>
              </View>
              <View className="flex-1 bg-blue-50 p-3 rounded-xl mx-1">
                <Text className="text-xs text-blue-600 mb-1">Booked</Text>
                <Text className="text-base font-bold text-blue-800">
                  {totalBookedQuantity?.toLocaleString()}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Booking Status</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {bookingPercentage}% Booked
                </Text>
              </View>
              <View className="h-1.5 bg-gray-200 rounded">
                <View
                  style={{ width: `${bookingPercentage}%` }}
                  className={`h-full rounded ${
                    bookingPercentage > 90 ? "bg-red-500" : "bg-green-500"
                  }`}
                />
              </View>
            </View>

            <Text className="text-sm font-semibold text-gray-800 mb-3">
              Delivery Slots
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-ml-1"
            >
              {(item?.slotDetails ?? []).map(
                (slot, idx) =>
                  slot?.dates && (
                    <View
                      key={idx}
                      className="bg-gray-50 p-3 rounded-xl mr-3 border border-gray-200 min-w-[150]"
                    >
                      <Text className="text-sm text-gray-500 mb-1">
                        {moment(
                          slot.dates?.startDay ?? "",
                          "DD-MM-YYYY"
                        ).format("DD MMM")}{" "}
                        -
                        {moment(slot.dates?.endDay ?? "", "DD-MM-YYYY").format(
                          "DD MMM"
                        )}
                      </Text>
                      <View className="flex-row justify-between mt-2">
                        <View>
                          <Text className="text-xs text-gray-500">
                            Quantity
                          </Text>
                          <Text className="text-sm font-semibold text-gray-800">
                            {(slot?.quantity ?? 0)?.toLocaleString()}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-gray-500">
                            Available
                          </Text>
                          <Text
                            className={`text-sm font-semibold ${
                              (slot?.remainingQuantity ?? 0) < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {(slot?.remainingQuantity ?? 0)?.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )
              )}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="p-4">
      <QuickFinancials />
      {(plantsData ?? []).map((item, index) => (
        <AccordionItem
          key={index}
          item={item}
          index={index}
          isExpanded={expandedIndex === index}
          onPress={() =>
            setExpandedIndex(expandedIndex === index ? null : index)
          }
        />
      ))}
    </View>
  );
};

export default WalletStatsCard;
