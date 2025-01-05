import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
const BlinkingStatus = ({ orderStatus, statusColors }) => {
  const [isVisible, setIsVisible] = useState(true);
  console.log(statusColors);
  useEffect(() => {
    // Only animate if status is DISPATCHED or DISPATCH_PROCESS
    if (orderStatus === "DISPATCHED" || orderStatus === "DISPATCH_PROCESS") {
      const interval = setInterval(() => {
        setIsVisible((prev) => !prev);
      }, 1000); // Blink every second

      return () => clearInterval(interval);
    }
  }, [orderStatus]);

  // Don't animate for other statuses
  if (orderStatus !== "DISPATCHED" && orderStatus !== "DISPATCH_PROCESS") {
    return (
      <View
        className="px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: statusColors || "#9CA3AF" }}
      >
        <Text className="text-xs font-bold text-white">
          {orderStatus === "DISPATCH_PROCESS" ? "Plants Loading" : orderStatus}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`px-3 py-1.5 rounded-lg transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-30"
      }`}
      style={{ backgroundColor: statusColors || "red" }}
    >
      <Text className="text-xs font-bold text-white">
        {orderStatus === "DISPATCH_PROCESS" ? "Plants Loading" : orderStatus}
      </Text>
    </View>
  );
};

export default BlinkingStatus;
