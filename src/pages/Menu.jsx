import React, { useContext, useEffect, useState, useRef } from "react";
import { 
  View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity 
} from "react-native";
import { Card, DataTable } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import AxiosInstance from "../axios/config";
import Protected from "../common/Protected";
import Icon from "react-native-vector-icons/AntDesign";

const MenuPage = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [menuData, setMenuData] = useState([]);
  const [mealData, setMealData] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingMeal, setLoadingMeal] = useState(false);
  
  const [page, setPage] = useState(0);
  const itemsPerPage = 7;

  const fetchMenuData = async () => {
    setLoadingMenu(true);
    try {
      const response = await AxiosInstance.get("/days/getMenu");
      setMenuData(response.data);
    } catch (error) {
      console.log("Error fetching menu data", error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const fetchMealData = async () => {
    setLoadingMeal(true);
    try {
      const response = await AxiosInstance.get("/meals/getMeals");
      setMealData(response.data);
    } catch (error) {
      console.log("Error fetching meal data", error);
    } finally {
      setLoadingMeal(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchMenuData();
      await fetchMealData();
    };
    fetchData();
  }, []);

  const paginatedMenuData = menuData.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );


  return (
    <Protected navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container}>
        {loadingMeal || loadingMenu ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <>
            {/* Meal Cards with Scroll Controls */}
            <View style={styles.mealSection}>
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mealScroll}
              >
                {mealData.map((item, index) => {
                  const startTime = new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endTime = new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <View key={index} style={styles.mealCard}>
                      <Text style={styles.mealTitle}>{item.mealName}</Text>
                      <Text style={styles.mealTime}>{startTime} - {endTime}</Text>
                      <Text style={styles.mealCost}>Cost: ₹{item.cost}</Text>
                    </View>
                  );
                })}
              </ScrollView>

            </View>

            {/* Menu Table */}
            <DataTable style={styles.tableContainer}>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title>Day</DataTable.Title>
                <DataTable.Title>Breakfast</DataTable.Title>
                <DataTable.Title>Lunch</DataTable.Title>
                <DataTable.Title>Dinner</DataTable.Title>
              </DataTable.Header>

              {paginatedMenuData.length > 0 ? (
                paginatedMenuData.map((item, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>{item.day}</DataTable.Cell>
                    <DataTable.Cell>{item.breakfast}</DataTable.Cell>
                    <DataTable.Cell>{item.lunch}</DataTable.Cell>
                    <DataTable.Cell>{item.dinner}</DataTable.Cell>
                  </DataTable.Row>
                ))
              ) : (
                <DataTable.Row>
                  <DataTable.Cell>No meals available</DataTable.Cell>
                </DataTable.Row>
              )}
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
  mealSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  arrowButton: {
    padding: 8,
  },
  mealScroll: {
    flexGrow: 0,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  mealCard: {
    width: 200,
    marginHorizontal: 10, // Space between cards
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    shadowOffset: { width: 0, height: 2 },    
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center", 
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    textAlign: "center",
  },
  mealTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    textAlign: "center",
  },
  mealCost: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
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
});

export default MenuPage;
