import React, { useContext, useEffect, useState } from 'react'
import { Button, ScrollView, StyleSheet, TextInput, View, Text } from 'react-native'
import { AuthContext } from '../../context/AuthContext'
import AxiosInstance from '../../axios/config'
import DateTimePickerModal from "react-native-modal-datetime-picker";

const AdminSettings = () => {
    const {user} = useContext(AuthContext);

    const [menuData, setMenuData] = useState([]);
    const [mealData, setMealData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startTimePicker, setStartTimePicker] = useState({ visible: false, index: null });
    const [endTimePicker, setEndTimePicker] = useState({ visible: false, index: null });

    useEffect(() => {
        fetchMenuData();
        fetchMealData();
    }, []);


    const fetchMenuData = async () => {
        try {
            const response = await AxiosInstance.get("/days/getMenu");
            setMenuData(response.data);
        } catch (error) {
           console.log("Error", "Failed to fetch menu data");
        }
    };

    const fetchMealData = async () => {
        try {
            const response = await AxiosInstance.get("/meals/getMeals");
            setMealData(response.data);
        } catch (error) {
            console.log("Error", "Failed to fetch meal data");
        }
    };

    const updateMenuData = async () => {
        try {
            await AxiosInstance.post('/days/setMenu', { menuData });
            console.log("Menu changes saved");
        } catch (error) {
            console.log("Error", "Failed to update menu");
        }
    };

    const updateMealData = async () => {
        try {
            await AxiosInstance.post('/meals/setMeals', { mealData });
            console.log("Meals updated successfully");
        } catch (error) {
            console.log("Error", "Failed to update meals");
        }
    };

    return user.isAdmin ? (
        <ScrollView style={styles.container}>
            {/* <Text style={styles.header}>Mess Timing</Text>
            {mealData.map((item, index) => (
                <View key={index} style={styles.card}>
                    <Text style={styles.mealText}>{item.mealName.toUpperCase()}</Text>
                    <Button title="Set Start Time" onPress={() => setStartTimePicker({ visible: true, index })} />
                    <Button title="Set End Time" onPress={() => setEndTimePicker({ visible: true, index })} />
                    <TextInput
                        style={styles.input}
                        value={String(item.cost)}
                        keyboardType="numeric"
                        onChangeText={(text) => {
                            const newMeal = [...mealData];
                            newMeal[index].cost = Number(text);
                            setMealData(newMeal);
                        }}
                    />
                </View>
            ))}
            <Button title="Save Meals" onPress={updateMealData} /> */}

            <Text style={styles.header}>Mess Menu</Text>
            {menuData.map((menu, index) => (
                <View key={index} style={styles.card}>
                    <Text>{menu.day}</Text>
                    <TextInput
                        style={styles.input}
                        value={menu.breakfast}
                        onChangeText={(text) => {
                            const newMenu = [...menuData];
                            newMenu[index].breakfast = text;
                            setMenuData(newMenu);
                        }}
                    />
                    <TextInput
                        style={styles.input}
                        value={menu.lunch}
                        onChangeText={(text) => {
                            const newMenu = [...menuData];
                            newMenu[index].lunch = text;
                            setMenuData(newMenu);
                        }}
                    />
                    <TextInput
                        style={styles.input}
                        value={menu.dinner}
                        onChangeText={(text) => {
                            const newMenu = [...menuData];
                            newMenu[index].dinner = text;
                            setMenuData(newMenu);
                        }}
                    />
                </View>
            ))}
            <Button title="Save Menu" onPress={updateMenuData} style={styles.saveButton}/>
        
            <DateTimePickerModal
                isVisible={startTimePicker.visible}
                mode="time"
                onConfirm={(date) => {
                    const newMeal = [...mealData];
                    newMeal[startTimePicker.index].startTime = date;
                    setMealData(newMeal);
                    setStartTimePicker({ visible: false, index: null });
                }}
                onCancel={() => setStartTimePicker({ visible: false, index: null })}
            />

            <DateTimePickerModal
                isVisible={endTimePicker.visible}
                mode="time"
                onConfirm={(date) => {
                    const newMeal = [...mealData];
                    newMeal[endTimePicker.index].endTime = date;
                    setMealData(newMeal);
                    setEndTimePicker({ visible: false, index: null });
                }}
                onCancel={() => setEndTimePicker({ visible: false, index: null })}
            />
        
        </ScrollView>
        ) : (
            <Text>Not Admin</Text>
        );
    };

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    card: { padding: 10, marginVertical: 5, backgroundColor: '#f8f8f8', borderRadius: 8 },
    mealText: { fontSize: 18, fontWeight: 'bold' },
    input: { borderWidth: 1, padding: 5, marginVertical: 5, borderRadius: 5 },
    saveButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, marginButton: 10 }
});

export default AdminSettings