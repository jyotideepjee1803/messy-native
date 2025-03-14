import React, { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, FlatList } from "react-native";
import AxiosInstance from "../axios/config";
import { Card, DataTable } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import Protected from "../common/Protected";
import axios from "axios";

const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const MyCouponPage = ({navigation}) => {
  const {user} = useContext(AuthContext);
  console.log(user)
  const userId = user.userId;

  const [couponData, setCouponData] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(false);


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

  useEffect(() => {
    fetchCouponData();
  }, []);

  return (
    <Protected navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
              <DataTable style={styles.tableContainer}>
                  <DataTable.Header style={styles.tableHeader}>
                      <DataTable.Title>Day</DataTable.Title>
                      <DataTable.Title>Breakfast</DataTable.Title>
                      <DataTable.Title>Lunch</DataTable.Title>
                      <DataTable.Title>Dinner</DataTable.Title>
                  </DataTable.Header>

                  {couponData.length > 0 ? (
                  <>
                  {menuData.map((row, dayIndex) => (
                      <DataTable.Row key={dayIndex}>
                          <DataTable.Cell>{row.day}</DataTable.Cell>
                          <DataTable.Cell style={couponData[0].week[0][dayIndex] ? styles.greenCell : null}>
                          {row.breakfast || "N/A"}
                          </DataTable.Cell>
                          <DataTable.Cell style={couponData[0].week[1][dayIndex] ? styles.greenCell : null}>
                          {row.lunch || "N/A"}
                          </DataTable.Cell>
                          <DataTable.Cell style={couponData[0].week[2][dayIndex] ? styles.greenCell : null}>
                          {row.dinner || "N/A"}
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
        )}
      </ScrollView>
    </Protected>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: "#F3F4F6",
    },
    card: {
      padding: 16,
      backgroundColor: "#fff",
      borderRadius: 10,
      elevation: 4,
    },
    header: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
    },
    tableContainer: {
        padding: 15,
    },
    tableHeader: {
        backgroundColor: '#DCDCDC',
    },
    greenCell: {
      backgroundColor: "#ceface",
      borderRadius: 5,
      padding: 4,
    },
});

export default MyCouponPage;
