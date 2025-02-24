import { Alert } from "react-native";
import axiosInstance from "../api/api_instance";

export const getWalleetDetails = async (
  dealer_id,
  setDelaerWallet,
  setLoading
) => {
  try {
    setLoading(true);
    const response = await axiosInstance.get(
      `/user/wallet-details/${dealer_id}`,
      {}
    );
    if (response.data) {
      console.log("orders", response.data);
      setDelaerWallet(response.data.data);
    }
  } catch (error) {
    console.error(error);

    Alert.alert("Error", "Failed to load wallet. Please try again.");
  } finally {
    setLoading(false);
  }
};
