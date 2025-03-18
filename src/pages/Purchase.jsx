import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, TouchableHighlight } from "react-native";
import AxiosInstance from "../axios/config";
import RazorpayCheckout from "react-native-razorpay";
import { AuthContext } from "../context/AuthContext";
import Protected from "../common/Protected";
import axios from "axios";

const Purchase = ({navigation}) => {
  const {user} = useContext(AuthContext);
  console.log(user);
  const userId = user.userId;
  const [coupon, setCoupon] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedItems, setSelectedItems] = useState(
    Array(3).fill(Array(7).fill(false))
  );
  const [mealCost, setMealCost] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [total, setTotal] = useState(0);

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
      // await axios.get("http://192.168.1.67:5000/days/getMenu", {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${user.token}`,
      //   },
      // });
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
      // await axios.get("http://192.168.1.67:5000/meals/getMeals", {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${user.token}`,
      //   },
      // });

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
      console.log(response.data.coupons);
      setCoupon(response.data.coupons);
    }catch(error){
      console.error("Error fetching coupon data:", error)
    }
    finally{
      setLoadingCoupon(false);
    }
  }

  useEffect(() => {
    fetchMenuData();
    fetchMealCosts();
    fetchCouponData();
  }, []);

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
    // await axios.post(`http://192.168.1.67:5000/payments?userId=${userId}`, data, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${user.token}`,
    //   },
    //   });
      if (resp.data) {
          Alert.alert('Success', 'Coupon Bought Successfully');
      } else {
          Alert.alert('Failed', 'Transaction Failed');
      }
  }    

  const initiatePayment = async () => {
    try {
      const res = await AxiosInstance.post("payments/initiate", {userId, amount: total, selected: selectedItems });
      // await axios.post("http://192.168.1.67:5000/payments/initiate", {userId, amount: total, selected: selectedItems }, { 
      //   headers: {
      //   "Content-Type": "application/json",
      //   Authorization: `Bearer ${user.token}`,
      // }});
      console.log(res)
      const options = {
        description: 'Coupon Purchase',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: res.data.currency,
        key: "rzp_test_hWcGMj2bhItndk",
        order_id: res.data.id,
        amount: res.data.amount.toString(),
        prefill: {
          email: 'gaurav.kumar@example.com',
          contact: '9191919191',
          name: 'Gaurav Kumar'
        },
        theme: {color: '#53a20e'}
      };
      RazorpayCheckout.open(options).then((data) => {
        // handle success
        // alert(`Success: ${data.razorpay_payment_id}`);
        console.log(data);
        paymentStatus(data);
      }).catch((error) => {
        // handle failure
        alert(`Error: ${error.code} | ${error.description}`);
      });
    } catch (error) {
      console.error("Transaction Failed", error);
    }
  };

  return (
    <Protected navigation={navigation}>
      {loadingMenu || loadingCoupon ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: "center" }} />
      ) : (!coupon || ((coupon.taken===true && getDayDifference(currentDateTime, coupon.updatedAt) >=5) || coupon.taken===false) ? (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ backgroundColor: "white", padding: 10, borderRadius: 10, elevation: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>Meal Plan</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
              <Text style={{ flex: 1, fontWeight: "bold" }}>Day</Text>
              <Text style={{ flex: 1, fontWeight: "bold" }}>Breakfast</Text>
              <Text style={{ flex: 1, fontWeight: "bold" }}>Lunch</Text>
              <Text style={{ flex: 1, fontWeight: "bold" }}>Dinner</Text>
            </View>
            {menuData.map((rowData, index) => (
              <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 5 }}>
                <Text style={{ flex: 1 }}>{rowData.day}</Text>
                {/* Breakfast Cell */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: selectedItems[0][index] ? "#ceface" : "white",
                    padding: 5,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                  onPress={() => handleCheckboxChange(0, index)}
                >
                  <Text style={{ textAlign: "center" }}>{rowData.breakfast}</Text>
                </TouchableOpacity>
                {/* Lunch Cell */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: selectedItems[1][index] ? "#ceface" : "white",
                    padding: 5,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                  onPress={() => handleCheckboxChange(1, index)}
                >
                  <Text style={{ textAlign: "center" }}>{rowData.lunch}</Text>
                </TouchableOpacity>
                {/* Dinner Cell */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: selectedItems[2][index] ? "#ceface" : "white",
                    padding: 5,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                  onPress={() => handleCheckboxChange(2, index)}
                >
                  <Text style={{ textAlign: "center" }}>{rowData.dinner}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "right", marginTop: 10 }}>{`Total: ₹${total}`}</Text>
            <TouchableHighlight
              style={{
                backgroundColor: total === 0 ? "gray" : "#f37251",
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
                alignItems: "center",
              }}
              disabled={total === 0}
              onPress={initiatePayment}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Buy Now</Text>
            </TouchableHighlight>
          </View>
        </ScrollView>
        ) : (
          <Text>Coupon already bought</Text>
          )
        )}
    </Protected>
  );
};

export default Purchase;
