import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { View, Text, ScrollView, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Card, DataTable } from "react-native-paper";
import Protected from "@/common/Protected";
import Loader from "@/components/Loader";

import AxiosInstance from "@/axios/config";

const MealCount = ({navigation}) => {

  const [mealCountData, setMealCountData] = useState([]);
  const [loading, setLoading] = useState(false);
  const dayIdx = useMemo(() =>  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], []);
  const mp = useMemo(() => ({ breakfast: 0, lunch: 1, dinner: 2 }), []);
  const [activeTab, setActiveTab] = useState(0); // 0: Current Week, 1: Next Week

  const fetchMealCount = async () => {
    setLoading(true);
    try {
        const response = await AxiosInstance.get(`/coupons/totalMeal`);
        console.log(response.data);
        setMealCountData(response.data);
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

  const mealCount = activeTab === 0 ? mealCountData.currentWeek : mealCountData.nextWeek;

  return (
    <Protected navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <Loader/>
        ) : (
          <>
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
              <DataTable style={styles.tableContainer}>
                  <DataTable.Header style={styles.tableHeader}>
                      <DataTable.Title>Day</DataTable.Title>
                      <DataTable.Title numeric>Breakfast</DataTable.Title>
                      <DataTable.Title numeric>Lunch</DataTable.Title>
                      <DataTable.Title numeric>Dinner</DataTable.Title>
                  </DataTable.Header>
                  {mealCount?.map((row, dayIndex) => (
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
          </>
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
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', padding: 10, marginBottom: 10},
    tab: { padding: 10, flex: 1, alignItems: 'center' },
    activeTab: { borderBottomWidth: 3, borderBottomColor: '#1E90FF' },
    tabText: { fontSize: 16, },
    activeTabText: { color: '#1E90FF', fontWeight: 'bold' },
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
