import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const backendURI = "http://192.168.1.38:5000";

const AxiosInstance = axios.create({
  baseURL: backendURI,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Optional: Set a timeout of 10 seconds
});

AxiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const { token } = JSON.parse(userData);
        if (token) {
          config.headers.authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error retrieving auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default AxiosInstance;
