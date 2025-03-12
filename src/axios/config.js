import axios from "axios";

const backendURI = "http://192.168.1.67:5000";

const AxiosInstance = axios.create({
  baseURL: backendURI,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Optional: Set a timeout of 10 seconds
});

export default AxiosInstance;
