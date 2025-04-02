import React, { useCallback, useContext, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from "react-native";
import QRCode from "react-native-qrcode-svg";
import AxiosInstance from "../axios/config";
import { DataTable } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import Protected from "../common/Protected";
import { useFocusEffect } from "@react-navigation/native";

const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const MyCouponPage = ({navigation}) => {
  const {user} = useContext(AuthContext);
  const userId = user.userId;

  const [couponData, setCouponData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Current Week, 1: Next Week

  const fetchCouponData = async () => {
    setLoading(true);
    try {
        const menuResponse = await AxiosInstance.get("/days/getMenu");
        
        const sortedMenu = menuResponse.data.sort(
            (a, b) => dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase())
        );
        setMenuData(sortedMenu);
        
        const response = await AxiosInstance.get(`/coupons?userId=${userId}`);
        setCouponData(response.data.coupons.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))); // Coupons sorted in increasing order of createdAt
    } catch (error) {
      console.log("Error fetching coupon data", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCouponData();
    }, [])
  );

  const handleShowQR = (dayIndex, mealType) => {
    const qrData = JSON.stringify({ userId, dayIndex, mealType});
    console.log(qrData);
    setSelectedMeal(qrData);
    setQrVisible(true);
  };

  const selectedCoupon = couponData[activeTab];

  return (
    <Protected navigation={navigation}>
      <SafeAreaView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader}/>
        ) : (
          <>
            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 0 && styles.activeTab]}
                onPress={() => setActiveTab(0)}
              >
                <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>Current Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 1 && styles.activeTab]}
                onPress={() => setActiveTab(1)}
              >
                <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Next Week</Text>
              </TouchableOpacity>
            </View>

            {selectedCoupon ? (
              <>
                <Text style={styles.heading}>Tap on a meal to show the QR Code</Text>
                <DataTable style={styles.tableContainer}>
                  <DataTable.Header style={styles.tableHeader}>
                      <DataTable.Title>Day</DataTable.Title>
                      <DataTable.Title>Breakfast</DataTable.Title>
                      <DataTable.Title>Lunch</DataTable.Title>
                      <DataTable.Title>Dinner</DataTable.Title>
                  </DataTable.Header>

                  {menuData.map((row, dayIndex) => (
                      <DataTable.Row key={dayIndex}>
                          <DataTable.Cell>{row.day}</DataTable.Cell>
                          {/* Breakfast */}
                          <DataTable.Cell>
                            {selectedCoupon.week[0][dayIndex] ? (
                              <TouchableOpacity onPress={() => handleShowQR(dayIndex, 0)}>
                                <Text style={styles.greenCell}>{row.breakfast}</Text>
                              </TouchableOpacity>
                            ) : (
                              <Text>{row.breakfast}</Text>
                            )}
                          </DataTable.Cell>

                          {/* Lunch */}
                          <DataTable.Cell>
                            {selectedCoupon.week[1][dayIndex] ? (
                              <TouchableOpacity onPress={() => handleShowQR(dayIndex, 1)}>
                                <Text style={styles.greenCell}>{row.lunch}</Text>
                              </TouchableOpacity>
                            ) : (
                              <Text>{row.lunch}</Text>
                            )}
                          </DataTable.Cell>

                          {/* Dinner */}
                          <DataTable.Cell>
                            {selectedCoupon.week[2][dayIndex] ? (
                              <TouchableOpacity onPress={() => handleShowQR(dayIndex, 2)}>
                                <Text style={styles.greenCell}>{row.dinner}</Text>
                              </TouchableOpacity>
                            ) : (
                              <Text>{row.dinner}</Text>
                            )}
                          </DataTable.Cell>
                      </DataTable.Row>
                  ))}
                </DataTable>
              </>
            ) : (
              <Text style={styles.noCouponText}>
                {activeTab === 0 ? "No valid coupon for the current week" : "No valid coupon for the next week"}
              </Text>
            )}
          </>
        )}

        <Modal visible={qrVisible} transparent={true} onRequestClose={() => setQrVisible(false)} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.header}>Scan this QR Code</Text>
              {selectedMeal && <QRCode value={selectedMeal} size={200} />}
              <TouchableOpacity onPress={() => setQrVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Protected>
  );
};

const styles = StyleSheet.create({
    container: {
      flex:1,
      padding: 20,
      backgroundColor: '#fff',
    },
    loader: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 },
    heading: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
    },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', padding: 10, marginBottom: 10},
    tab: { padding: 10, flex: 1, alignItems: 'center' },
    activeTab: { borderBottomWidth: 3, borderBottomColor: '#1E90FF' },
    tabText: { fontSize: 16, },
    activeTabText: { color: '#1E90FF', fontWeight: 'bold' },
    noCouponText: {
      textAlign: "center",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 20,
      color: "gray",
    },
    tableContainer: {
      backgroundColor: "#FFFFFF",
      padding: 15,
      borderRadius: 8,
      elevation: 2,
      marginBottom: 20,
    },
    tableHeader: {
      backgroundColor: "#E5E7EB",
    },
    greenCell: {
      backgroundColor: "#ceface",
      borderRadius: 5,
      padding: 4,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
    },
    closeButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: "#ff5555",
      borderRadius: 5,
    },
    closeButtonText: {
      color: "white",
      fontWeight: "bold",
    },
});

export default MyCouponPage;
