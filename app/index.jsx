import { StatusBar } from "expo-status-bar";
import { Redirect } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";

const Index = () => {
  const { loading, isLogged } = useGlobalContext();

  console.log("🏠 Index screen - loading:", loading, "isLogged:", isLogged);

  // If still loading, show nothing (or a splash screen)
  if (loading) {
    return null;
  }

  // If logged in, go to home
  if (isLogged) {
    console.log("🏠 Index screen - Redirecting to home");
    return <Redirect href="/(tabs)/home" />;
  }

  // If not logged in, go directly to login
  console.log("🏠 Index screen - Redirecting to login");
  return <Redirect href="/(auth)/sign-in" />;
};

export default Index;
