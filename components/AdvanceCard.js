import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Image } from "react-native";
import moment from "moment";

const AdvanceCard = ({ pay, idx }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAddPaymentModalVisible, setAddPaymentModalVisible] = useState(false);

  // State for the new payment form
  const [newPayment, setNewPayment] = useState({
    paidAmount: "",
    paymentDate: new Date(), // Default to today's date
    bankName: "",
    modeOfPayment: "",
    paymentStatus: "PENDING",
    receiptPhoto: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false); // State to show date picker

  const openImageModal = (photoUri) => {
    setSelectedImage(photoUri);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  const openAddPaymentModal = () => {
    setAddPaymentModalVisible(true);
  };

  const closeAddPaymentModal = () => {
    setAddPaymentModalVisible(false);
  };

  const handleSavePayment = () => {
    // Save the new payment details by calling the addPayment function (passed as prop)
    addPayment(newPayment);
    setAddPaymentModalVisible(false);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newPayment.paymentDate;
    setShowDatePicker(false);
    setNewPayment({ ...newPayment, paymentDate: currentDate });
  };

  const addPayment = async (formData) => {
    try {
      // Send PATCH request to the server
      const response = await axiosInstance.patch("/order/payment", {
        ...formData,
        id: _id,
      });

      if (response.status === 200) {
        Alert.alert("Success", "Profile updated successfully");
        return response.data; // Return response data if needed
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An error occurred while updating the profile");
    }
  };
  const cardBackgroundColor = (() => {
    switch (pay.paymentStatus) {
      case "COLLECTED":
        return "#D1FAE5"; // Light green for collected
      case "PENDING":
        return "#FEF3C7"; // Light yellow for pending
      case "REJECTED":
        return "#FECACA"; // Light red for rejected
      default:
        return "#F9FAFB"; // Default color
    }
  })();
  return (
    <View
      key={idx}
      style={{
        padding: 6,
        backgroundColor: cardBackgroundColor,
        borderColor: "#E5E7EB",
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 4,
      }}
    >
      {/* Row 1: Amount and Date */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 12, color: "#374151" }}>
          <Text style={{ fontWeight: "bold" }}>Amount:</Text> ₹{pay.paidAmount}
        </Text>
        <Text style={{ fontSize: 12, color: "#374151" }}>
          <Text style={{ fontWeight: "bold" }}>Date:</Text>{" "}
          {moment(pay.paymentDate).format("DD-MMM-YYYY")}
        </Text>
      </View>

      {/* Row 2: Mode and Bank */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        <Text style={{ fontSize: 12, color: "#374151" }}>
          <Text style={{ fontWeight: "bold" }}>Mode:</Text>{" "}
          {pay.modeOfPayment || "N/A"}
        </Text>
        <Text style={{ fontSize: 12, color: "#374151" }}>
          <Text style={{ fontWeight: "bold" }}>Bank:</Text>{" "}
          {pay.bankName || "N/A"}
        </Text>
      </View>

      {/* Receipt Photos */}
      {pay.receiptPhoto && pay.receiptPhoto.length > 0 && (
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: "#374151" }}>
            Receipt Photos:
          </Text>
          {pay.receiptPhoto.map((photo, photoIdx) => (
            <TouchableOpacity
              key={photoIdx}
              onPress={() => openImageModal(photo)}
              style={{ marginVertical: 2 }}
            >
              <Text style={{ fontSize: 12, color: "#2563EB" }}>{`Photo ${
                photoIdx + 1
              }`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Image Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
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
              backgroundColor: "white",
              borderRadius: 8,
              padding: 16,
              width: "80%",
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: selectedImage }}
              style={{ width: "100%", height: 300 }}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={{
                marginTop: 16,
                backgroundColor: "#2563EB",
                padding: 10,
                borderRadius: 6,
              }}
              onPress={closeImageModal}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Payment Modal */}
    </View>
  );
};

export default AdvanceCard;
