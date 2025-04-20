import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import AxiosInstance from "../axios/config";

const NoticeContext = createContext();

export const NoticeProvider = ({ children }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get(`/notices`);
      console.log(response);
      setNotices(response.data || []);
    } catch (error) {
      console.error("Error fetching notices", error);
    } finally {
      setLoading(false);
    }
  };

  const addNotice = async (newNotice) => {
    try {
      const response = await AxiosInstance.post(`/notices`, newNotice);
      setNotices([...notices, response.data]);
      Alert.alert("Success", "Notice added successfully!");
    } catch (error) {
      console.error("Failed to add notice", error);
    }
  };

  const updateNotice = async (id, updatedData) => {
    try {
      await AxiosInstance.put(`/notices/${id}`, updatedData);
      setNotices(notices.map(n => (n._id === id ? { ...n, ...updatedData } : n)));
      Alert.alert("Success", "Notice updated!");
    } catch (error) {
      console.error("Failed to update notice", error);
    }
  };

  const deleteNotice = async (id) => {
    try {
      await AxiosInstance.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
      Alert.alert("Deleted", "Notice removed successfully!");
    } catch (error) {
      console.error("Failed to delete notice", error);
    }
  };

  return (
    <NoticeContext.Provider value={{ notices, loading, fetchNotices, addNotice, updateNotice, deleteNotice }}>
      {children}
    </NoticeContext.Provider>
  );
};

export const useNotice = () => useContext(NoticeContext);
