import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import {BACKEND_URI, BACKEND_DEV_URI} from "@env";

const backendURI = "https://messy-native-server.vercel.app/";

const AxiosInstance = axios.create({
  baseURL: backendURI,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
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
