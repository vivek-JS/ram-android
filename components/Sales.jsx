import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  View,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";

import PlacesList from "../../components/PlaceListi";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import { updateUser } from "./profile";

const Sales = () => {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user, setUser } = useGlobalContext();
  console.log("user", user);
  const isOnboarded = user?.response?.data?.isOnboarded;
  const id = user?.response?.data?._id;

  const jobTitle = user?.response?.data?.jobTitle;

  const [isModalVisible, setIsModalVisible] = useState(!isOnboarded);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAddPress = () => {
    setShowForm(true);
    router.push("/add-place");
  };

  const handleSubmit = async () => {
    if (newPassword === confirmPassword) {
      const updatedData = await updateUser(
        { password: newPassword, isOnboarded: true },
        id
      );

      Alert.alert("Success", "Password set successfully!");
      // Update the user object to mark onboarding as complete
      if (updatedData) {
        setUser((prevUser) => ({
          ...prevUser,
          password: newPassword, // Merge updated fields
          isOnboarded: true,
        }));

        console.log("Profile updated:", updatedData);
        setIsModalVisible(false); // Exit edit mode upon successful save
      }
      setIsModalVisible(false); // Close the modal
    } else {
      Alert.alert("Error", "Passwords do not match. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Main Content */}
      <PlacesList />
      <TouchableOpacity
        onPress={handleAddPress}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for onboarding */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)} // Handle back button
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Your Password</Text>

            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Sales;
