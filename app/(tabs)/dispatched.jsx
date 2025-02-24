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
import DispatchList from "../../components/DispatchList";
import BatchCards from "../../components/PrimaryList";

const Dispacthed = () => {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user, setUser } = useGlobalContext();
  const isOnboarded = user?.response?.data?.isOnboarded;
  const id = user?.response?.data?._id;

  const jobTitle = user?.response?.data?.jobTitle;

  const [isModalVisible, setIsModalVisible] = useState(!isOnboarded);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAddPress = () => {
    setShowForm(true);
    if (jobTitle === "PRIMARY") {
      router.push("/add-primary-dispatch");
    } else {
      router.push("/add-place");
    }
  };

  const renderMainContent = () => {
    switch (jobTitle) {
      case "PRIMARY":
        return <BatchCards outward={true} />;
      case "Operator":
      default:
        return <DispatchList />;
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Main Content */}
      {renderMainContent()}
      <TouchableOpacity
        onPress={handleAddPress}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for onboarding */}
      {/* <Modal
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
      </Modal> */}
    </SafeAreaView>
  );
};

export default Dispacthed;
