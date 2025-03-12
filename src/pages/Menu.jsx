import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import AxiosInstance from "../axios/config";
import { Card, DataTable } from "react-native-paper";

const MenuPage = () => {
  const userId = "676c0798dab7f6af1408bb49";

  const [menuData, setMenuData] = useState([]);
  const [mealData, setMealData] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingMeal, setLoadingMeal] = useState(false);

  const [page, setPage] = useState(0);
  const itemsPerPage = 7;

  const fetchMenuData = async () => {
    setLoadingMenu(true);
    try {
      const response = await AxiosInstance.get("/days/getMenu/");
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
    <ScrollView contentContainerStyle={styles.container}>
      {loadingMeal || loadingMenu ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {/* Meal Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealScroll}>
            {mealData.map((item, index) => {
              const startTime = new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endTime = new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <Card key={index} style={styles.mealCard}>
                  <Card.Content>
                    <Text style={styles.mealTitle}>{item.mealName}</Text>
                    <Text style={styles.mealTime}>{startTime} - {endTime}</Text>
                    <Text style={styles.mealCost}>Cost: ₹{item.cost}</Text>
                  </Card.Content>
                </Card>
              );
            })}
          </ScrollView>

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
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F3F4F6",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  card: {
    margin: 10,
    padding: 10,
    width: "45%",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  mealScroll: {
    marginVertical: 20,
  },
  mealCard: {
    width: 180,
    marginRight: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
    textAlign: 'center',
  },
  mealTime: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
    textAlign: 'center',
  },
  mealCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },  
  menuContainer: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  tableContainer: {
    padding: 15,
  },
  tableHeader: {
    backgroundColor: '#DCDCDC',
  },
});

export default MenuPage;
