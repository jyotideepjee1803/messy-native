import React, { useCallback, useContext, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from "react-native";
import QRCode from "react-native-qrcode-svg";
import AxiosInstance from "../axios/config";
import { Card, DataTable } from "react-native-paper";
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

  const fetchCouponData = async () => {
    setLoading(true);
    try {
        const menuResponse = await AxiosInstance.get("/days/getMenu");
        
        const sortedMenu = menuResponse.data.sort(
            (a, b) => dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase())
        );
        setMenuData(sortedMenu);
        
        const response = await AxiosInstance.get(`/coupons?userId=${userId}`);
        // await axios.get(`http://192.168.1.67:5000/coupons?userId=${userId}`, {
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${user.token}`,
        //   },
        // });
        console.log(response.data);
        setCouponData(response.data.coupons);
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

  return (
    <Protected navigation={navigation}>
      <SafeAreaView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader}/>
        ) : (
              <>
              <Text style={styles.heading}>Tap on a meal to show the QR Code</Text>
              <DataTable style={styles.tableContainer}>
                  <DataTable.Header style={styles.tableHeader}>
                      <DataTable.Title>Day</DataTable.Title>
                      <DataTable.Title>Breakfast</DataTable.Title>
                      <DataTable.Title>Lunch</DataTable.Title>
                      <DataTable.Title>Dinner</DataTable.Title>
                  </DataTable.Header>

                  {couponData?.length > 0 ? (
                  <>
                  {menuData.map((row, dayIndex) => (
                      <DataTable.Row key={dayIndex}>
                          <DataTable.Cell>{row.day}</DataTable.Cell>
                          {/* Breakfast */}
                          <DataTable.Cell>
                            {couponData[0].week[0][dayIndex] ? (
                              <TouchableOpacity onPress={() => handleShowQR(dayIndex, 0)}>
                                <Text style={styles.greenCell}>{row.breakfast}</Text>
                              </TouchableOpacity>
                            ) : (
                              <Text>{row.breakfast}</Text>
                            )}
                          </DataTable.Cell>

                          {/* Lunch */}
                          <DataTable.Cell>
                            {couponData[0].week[1][dayIndex] ? (
                              <TouchableOpacity onPress={() => handleShowQR(dayIndex, 1)}>
                                <Text style={styles.greenCell}>{row.lunch}</Text>
                              </TouchableOpacity>
                            ) : (
                              <Text>{row.lunch}</Text>
                            )}
                          </DataTable.Cell>

                          {/* Dinner */}
                          <DataTable.Cell>
                            {couponData[0].week[2][dayIndex] ? (
                              <TouchableOpacity onPress={() => handleShowQR(dayIndex, 2)}>
                                <Text style={styles.greenCell}>{row.dinner}</Text>
                              </TouchableOpacity>
                            ) : (
                              <Text>{row.dinner}</Text>
                            )}
                          </DataTable.Cell>
                      </DataTable.Row>
                      ))}
                      </>
                  ) : (
                  <DataTable.Row>
                      <DataTable.Cell>No coupons available</DataTable.Cell>
                  </DataTable.Row>
                  )}
              </DataTable>
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
    card: {
      padding: 16,
      backgroundColor: "#fff",
      borderRadius: 10,
      elevation: 4,
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
    header: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
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
