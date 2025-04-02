import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, FlatList } from "react-native";
import AxiosInstance from "../../axios/config";
import { Card, DataTable } from "react-native-paper";
import Protected from "../../common/Protected";
import { useFocusEffect } from "@react-navigation/native";

const MealCount = ({navigation}) => {

  const [mealCount, setMealCount] = useState([]);
  const [loading, setLoading] = useState(false);
  const dayIdx = useMemo(() =>  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], []);
  const mp = useMemo(() => ({ breakfast: 0, lunch: 1, dinner: 2 }), []);

  const fetchMealCount = async () => {
    setLoading(true);
    try {
        
        const response = await AxiosInstance.get(`/coupons/totalMeal`);
        console.log(response.data);
        setMealCount(response.data);
    } catch (error) {
      console.log("Error fetching coupon data", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
      useCallback(() => {
        fetchMealCount();
      }, [])
  );

  return (
    <Protected navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader}/>
        ) : (
              <DataTable style={styles.tableContainer}>
                  <DataTable.Header style={styles.tableHeader}>
                      <DataTable.Title>Day</DataTable.Title>
                      <DataTable.Title numeric>Breakfast</DataTable.Title>
                      <DataTable.Title numeric>Lunch</DataTable.Title>
                      <DataTable.Title numeric>Dinner</DataTable.Title>
                  </DataTable.Header>
                  {mealCount.map((row, dayIndex) => (
                      <DataTable.Row key={dayIndex}>
                          <DataTable.Cell>{dayIdx[dayIndex]}</DataTable.Cell>
                            <DataTable.Cell>
                                <Text style={{ textAlign: 'right', width: '100%' }}>{row.breakfast}</Text>
                            </DataTable.Cell>
                            <DataTable.Cell>
                                <Text style={{ textAlign: 'right', width: '100%' }}>{row.lunch}</Text>
                            </DataTable.Cell>
                            <DataTable.Cell>
                                <Text style={{ textAlign: 'right', width: '100%' }}>{row.dinner}</Text>
                            </DataTable.Cell>
                      </DataTable.Row>
                      ))}
              </DataTable>
        )}
      </ScrollView>
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
});

export default MealCount;
