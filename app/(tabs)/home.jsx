import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity } from "react-native";
import PlacesList from "../../components/PlaceListi";
import BatchCards from "../../components/PrimaryList";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import PasswordSetModal from "../../components/PasswordSetModal";

const Home = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user, logout } = useGlobalContext();

  console.log("user", user);
  const isOnboarded = user?.isOnboarded;
  console.log("isonboar", user?.isOnboarded);
  console.log("user?.isOnboarded type:", typeof user?.isOnboarded);
  const jobTitle = user?.jobTitle;

  useEffect(() => {}, [user]);

  const handleAddPress = () => {
    setShowForm(true);
    if (jobTitle === "PRIMARY") {
      router.push("/add-primary");
    } else {
      router.push("/add-place");
    }
  };

  const handlePasswordSuccess = async () => {
    // This will be called after successful password set
    // Handle logout and redirect to welcome screen
    console.log("🏠 Home - Password success, logging out...");
    try {
      await logout();
      console.log("🏠 Home - Logout completed");
    } catch (error) {
      console.error("🏠 Home - Logout error:", error);
    }
  };

  console.log(isOnboarded);

  const renderMainContent = () => {
    switch (jobTitle) {
      case "PRIMARY":
        return <BatchCards />;
      case "Operator":
      default:
        return <PlacesList />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderMainContent()}
      <TouchableOpacity
        onPress={handleAddPress}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Password Set Modal */}
      <PasswordSetModal
        visible={!Boolean(isOnboarded)}
        onSuccess={handlePasswordSuccess}
      />
    </SafeAreaView>
  );
};

export default Home;
