import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../lib/auth";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();

      if (isAuthenticated) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setIsLogged(true);
          setUser(currentUser);
        } else {
          // User has token but no user data, clear everything
          await authService.logout();
          setIsLogged(false);
          setUser(null);
        }
      } else {
        setIsLogged(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth status check error:", error);
      setIsLogged(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phoneNumber, password) => {
    try {
      const result = await authService.login(phoneNumber, password);
      if (result.success) {
        setIsLogged(true);
        setUser(result.user);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      if (result.success) {
        setIsLogged(true);
        setUser(result.user);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log("🔄 GlobalProvider logout - Starting...");
      await authService.logout();
      console.log("🔄 GlobalProvider logout - Auth service logout completed");
      setIsLogged(false);
      console.log("🔄 GlobalProvider logout - isLogged set to false");
      setUser(null);
      console.log("🔄 GlobalProvider logout - user set to null");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
