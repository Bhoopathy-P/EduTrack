import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("edutrack_token") || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Setup base URL and interceptors
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("edutrack_token", token);
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("edutrack_token");
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Fetch notifications periodically
  useEffect(() => {
    let interval;
    if (user) {
      fetchNotifications();
      interval = setInterval(fetchNotifications, 10000); // Polling every 10 seconds
    } else {
      setNotifications([]);
    }
    return () => clearInterval(interval);
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await axios.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed. Please check credentials.";
      return { success: false, error: msg };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await axios.post("/api/auth/register", { name, email, password, role });
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed.";
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("edutrack_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notifications,
        login,
        register,
        logout,
        fetchNotifications,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
