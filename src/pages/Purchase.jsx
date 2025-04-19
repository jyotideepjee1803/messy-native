import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, TouchableHighlight, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from "@react-navigation/native";
import RazorpayCheckout from "react-native-razorpay";
import AxiosInstance from "../axios/config";
import { AuthContext } from "../context/AuthContext";
import Protected from "../common/Protected";
import {Razorpay_API_KEY} from "@env";
import Loader from "../components/Loader";

const Purchase = ({navigation}) => {
  const {user} = useContext(AuthContext);
  const userId = user.userId;
  const [coupon, setCoupon] = useState();
  const [menuData, setMenuData] = useState([]);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState(
    Array(3).fill(Array(7).fill(false))
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [mealCost, setMealCost] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [total, setTotal] = useState(0);
  const [bought, setBought] = useState(false);
  const sortIdx = useMemo(() => ({ Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 }), []);
  const mp = useMemo(() => ({ breakfast: 0, lunch: 1, dinner: 2 }), []);

  var date = new Date();
  var currentDateTime = date.toISOString(); 

  const getDayDifference = useCallback((dateString1, dateString2) => {
      const date1 = new Date(dateString1);
      const date2 = new Date(dateString2);
      const timeDifference = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  }, []);
  
  const fetchMenuData = async () => {
    try {
      setLoadingMenu(true);
      const response = await AxiosInstance.get("days/getMenu");
      let data = response.data;
      data.sort((a, b) => sortIdx[a.day] - sortIdx[b.day]);
      setMenuData(data);
    } catch (error) {
      console.error("Error fetching menu data:", error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const fetchMealCosts = useCallback(async () => {
    try {
      const response = await AxiosInstance.get("/meals/getMeals");
      const breakfastCost = response.data.find((meal) => meal.mealName === "breakfast").cost;
      const lunchCost = response.data.find((meal) => meal.mealName === "lunch").cost;
      const dinnerCost = response.data.find((meal) => meal.mealName === "dinner").cost;
      setMealCost({ breakfast: breakfastCost, lunch: lunchCost, dinner: dinnerCost });
    } catch (error) {
      console.error("Error fetching meal costs:", error);
    }
  }, []);

  const fetchCouponData = async() => {
    try{
      setLoadingCoupon(true);
      const response = await AxiosInstance.get(`/coupons?userId=${userId}`);
      setCoupon(response.data);
    }catch(error){
      console.error("Error fetching coupon data:", error)
    }
    finally{
      setLoadingCoupon(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      // Fetch or reload data when the screen is focused
      fetchMenuData();
      fetchMealCosts();
      fetchCouponData();
    }, [bought])
  );

  const handleCheckboxChange = (mealIndex, dayIndex) => {
    setSelectedItems((prevSelected) =>
      prevSelected.map((mealArray, i) =>
        i === mealIndex
          ? mealArray.map((selected, j) => (j === dayIndex ? !selected : selected))
          : mealArray
      )
    );
  };
  
  // Use useEffect to correctly update total when selectedItems changes
  useEffect(() => {
    let newTotal = 0;
    selectedItems.forEach((mealArray, i) => {
      mealArray.forEach((isSelected) => {
        if (isSelected) {
          newTotal += mealCost[Object.keys(mp)[i]];
        }
      });
    });
    setTotal(newTotal);
  }, [selectedItems, mealCost]);

  const paymentStatus = async(data)=>{
    const resp = await AxiosInstance.post(`payments?userId=${userId}`, data);
    if (resp?.data) {
      // setBought(true);
      fetchCouponData();
    }else {
          Alert.alert('Failed', 'Transaction Failed');
      }
  }    

  const initiatePayment = async () => {
    try {
      const res = await AxiosInstance.post("payments/initiate", {userId, amount: total, selected: selectedItems });
      const options = {
        description: 'Coupon Purchase',
        currency: res.data.currency,
        key: Razorpay_API_KEY,
        order_id: res.data.id,
        amount: res.data.amount.toString(),
      };
      RazorpayCheckout.open(options).then((data) => {
        setBought(true);
        paymentStatus(data);
        // setRefreshKey(prev => prev + 1)
      }).catch((error) => {
        // handle failure
        alert(`Error: Transaction Failed with code: ${error.code}`);
      });
    } catch (error) {
      console.error("Transaction Failed", error);
    }
  };

  // console.log(getDayDifference(currentDateTime, coupon?.currentWeek?.weekStartDate) < 5)
  return (
    <Protected navigation={navigation}>
      {bought || (coupon?.currentWeek && coupon?.nextWeek) || coupon?.nextWeek ||
        (coupon?.currentWeek && getDayDifference(currentDateTime, coupon.currentWeek.weekStartDate) < 5)
         ? (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle-outline" size={100} color="green" />
            <Text style={styles.successText}>Coupon already bought!</Text>
          </View>

          ) : (
            <ScrollView contentContainerStyle={styles.container}>
            {loadingMenu || loadingCoupon ? (
              <Loader/>
            ) : (
              <View style={styles.card}>
                <Text style={styles.title}>Meal Plan</Text>
                <View style={styles.headerRow}>
                  <Text style={styles.headerText}>Day</Text>
                  <Text style={styles.headerText}>Breakfast</Text>
                  <Text style={styles.headerText}>Lunch</Text>
                  <Text style={styles.headerText}>Dinner</Text>
                </View>
                {menuData.map((rowData, index) => (
                  <View key={index} style={styles.row}>
                    <Text style={styles.cell}>{rowData.day}</Text>
                    {["breakfast", "lunch", "dinner"].map((meal, mealIndex) => (
                      <TouchableOpacity
                        key={mealIndex}
                        style={[
                          styles.mealCell,
                          selectedItems[mealIndex][index] && styles.selectedMeal,
                        ]}
                        onPress={() => handleCheckboxChange(mealIndex, index)}
                      >
                        <Text style={styles.cellText}>{rowData[meal]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                <Text style={styles.totalText}>{`Total: ₹${total}`}</Text>
                <TouchableHighlight
                  style={[styles.buyButton, total === 0 && styles.disabledButton]}
                  disabled={total === 0}
                  onPress={initiatePayment}
                >
                  <Text style={styles.buyButtonText}>Buy Now</Text>
                </TouchableHighlight>
              </View>
            )}
            </ScrollView>
          )
      }
    </Protected>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", marginTop: 20 },
  card: { backgroundColor: "white", padding: 10, borderRadius: 10, elevation: 3 },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  headerText: { flex: 1, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 5 },
  cell: { flex: 1 },
  mealCell: { flex: 1, padding: 5, borderRadius: 5, borderWidth: 1, borderColor: "#ccc" },
  selectedMeal: { backgroundColor: "#ceface" },
  cellText: { textAlign: "center" },
  totalText: { fontSize: 16, fontWeight: "bold", textAlign: "right", marginTop: 10 },
  buyButton: { backgroundColor: "#1E90FF", padding: 10, borderRadius: 5, marginTop: 10, alignItems: "center" },
  disabledButton: { backgroundColor: "gray" },
  buyButtonText: { color: "white", fontSize: 16 },
  successContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  successText: { fontSize: 24, fontWeight: "bold", color: "green", marginTop: 10 },
});

export default Purchase;