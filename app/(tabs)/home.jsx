import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import { images } from "../../constants";
import { EmptyState, SearchInput, Trending, VideoCard } from "../../components";
import PlacesList from "../../components/PlaceListi";
import AntDesign from "react-native-vector-icons/AntDesign"; // Add this import
import { useRouter } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";

const Home = () => {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // one flatlist
  // with list header
  // and horizontal flatlist

  //  we cannot do that with just scrollview as there's both horizontal and vertical scroll (two flat lists, within trending)
  const handleAddPress = () => {
    setShowForm(true);
    router.push("/add-place");

    // Navigate to your form screen or open modal
    // navigation.navigate('AddPlace'); // If using stack navigation
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <PlacesList />
      <TouchableOpacity
        onPress={handleAddPress}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;
