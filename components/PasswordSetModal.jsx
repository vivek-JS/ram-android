import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useGlobalContext } from "../context/GlobalProvider";
import { updateUser } from "../app/(tabs)/profile";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PasswordSetModal = ({ visible, onSuccess }) => {
  const { user, setUser, logout } = useGlobalContext();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const id = user?._id;

  const handleSubmit = async () => {
    console.log("User object:", JSON.stringify(user, null, 2));
    console.log("User ID:", id);
    console.log("Request data:", {
      password: newPassword,
      isOnboarded: true,
      id,
    });

    // Debug token status
    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log(
        "🔑 Current token in AsyncStorage:",
        token ? "Present" : "Missing"
      );
      if (token) {
        console.log("🔑 Token preview:", token.substring(0, 20) + "...");
      }
    } catch (error) {
      console.error("Error checking token:", error);
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedData = await updateUser(
        { password: newPassword, isOnboarded: true },
        id
      );

      if (updatedData) {
        // Update the user state to reflect the changes
        setUser((prevUser) => ({
          ...prevUser,
          isOnboarded: true,
        }));

        // Clear form
        setNewPassword("");
        setConfirmPassword("");

        // Show success message
        Alert.alert(
          "Success",
          "Password set successfully! You will be logged out to ensure security.",
          [
            {
              text: "OK",
              onPress: async () => {
                console.log("🔄 Starting logout process...");
                try {
                  // Call onSuccess callback if provided
                  if (onSuccess) {
                    console.log("📞 Calling onSuccess callback");
                    onSuccess();
                  } else {
                    // Default behavior: logout and redirect
                    console.log("🚪 Calling logout function");
                    const logoutResult = await logout();
                    console.log("🚪 Logout result:", logoutResult);
                  }
                } catch (error) {
                  console.error("❌ Error during logout:", error);
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error setting password:", error);
      Alert.alert("Error", "Failed to set password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Set Your Password</Text>
          <Text style={styles.modalSubtitle}>
            Please set a secure password for your account
          </Text>

          <TextInput
            style={styles.input}
            placeholder="New Password (min 6 characters)"
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

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Setting Password..." : "Set Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PasswordSetModal;
