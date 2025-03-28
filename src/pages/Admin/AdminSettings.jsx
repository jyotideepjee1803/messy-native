import React, { useContext, useEffect, useState } from 'react'
import { Button, ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import { AuthContext } from '../../context/AuthContext'
import AxiosInstance from '../../axios/config'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Accordion from '../../components/Accordion'
import LinearGradient from 'react-native-linear-gradient'

const AdminSettings = () => {
    const {user} = useContext(AuthContext);

    const [menuData, setMenuData] = useState([]);
    const [mealData, setMealData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startTimePicker, setStartTimePicker] = useState({ visible: false, index: null });
    const [endTimePicker, setEndTimePicker] = useState({ visible: false, index: null });

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            setLoading(true);
            const [menuResponse, mealResponse] = await Promise.all([
                AxiosInstance.get("/days/getMenu"),
                AxiosInstance.get("/meals/getMeals"),
            ]);
            setMenuData(menuResponse.data);
            setMealData(mealResponse.data);
        } catch (error) {
            console.log("Error fetching data", error);
        } finally {
            setLoading(false); // Stop loading after both API calls complete
        }
    };

    const updateMenuData = async () => {
        try {
            await AxiosInstance.post('/days/setMenu', { menuData });
            Alert.alert('Success',"Menu changes saved");
        } catch (error) {
            console.log("Error", "Failed to update menu");
        }
    };

    const updateMealData = async () => {
        try {
            await AxiosInstance.post('/meals/setMeals', { mealData });
            Alert.alert("Meals updated successfully");
        } catch (error) {
            console.log("Error", "Failed to update meals");
        }
    };

    const formatTime = (date) => {
        return date ? new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
    };

    if (loading) {
        return <ActivityIndicator size="large" color="blue" style={styles.loader} />;
    }

    return user.isAdmin ? (
        <ScrollView style={styles.container}>
            <Accordion title="Mess Timing">
                {mealData.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.mealText}>{item.mealName.toUpperCase()}</Text>

                        <TouchableOpacity onPress={()=> setStartTimePicker({visible: true, index})}>
                            <TextInput
                            label="Start Time"
                            mode='outlined'
                            value={formatTime(item.startTime)}
                            editable={false}
                            right={<TextInput.Icon icon="clock" />}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEndTimePicker({ visible: true, index })}>
                            <TextInput
                            label="End Time"
                            mode='outlined'
                            value={formatTime(item.endTime)}
                            editable={false}
                            right={<TextInput.Icon icon="clock" />}
                            />
                        </TouchableOpacity>

                        <TextInput
                            label={"Cost"}
                            mode='outlined'
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
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={updateMealData}>
                        <Text style={styles.buttonText}>Save Meals</Text>
                    </TouchableOpacity>
                </View>
            </Accordion>

            <Accordion title="Mess Menu">
                {menuData.map((menu, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.menuText}>{menu.day}</Text>
                        <TextInput
                            mode='outlined'
                            label={'Breakfast'}
                            value={menu.breakfast}
                            onChangeText={(text) => {
                                const newMenu = [...menuData];
                                newMenu[index].breakfast = text;
                                setMenuData(newMenu);
                            }}
                        />
                        <TextInput
                            mode='outlined'
                            label={'Lunch'}
                            value={menu.lunch}
                            onChangeText={(text) => {
                                const newMenu = [...menuData];
                                newMenu[index].lunch = text;
                                setMenuData(newMenu);
                            }}
                        />
                        <TextInput
                            mode='outlined'
                            label={'Dinner'}
                            value={menu.dinner}
                            onChangeText={(text) => {
                                const newMenu = [...menuData];
                                newMenu[index].dinner = text;
                                setMenuData(newMenu);
                            }}
                        />
                    </View>
                ))}
                <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={updateMenuData}>
                    <Text style={styles.buttonText}>Save Menu</Text>
                </TouchableOpacity>
            </View>
            </Accordion>

            <DateTimePickerModal
                isVisible={startTimePicker.visible}
                date={mealData[startTimePicker.index]?.startTime ? new Date(mealData[startTimePicker.index].startTime) : new Date()}
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
                date={mealData[endTimePicker.index]?.endTime ? new Date(mealData[endTimePicker.index].endTime) : new Date()}
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
    container: { padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    card: { padding: 10, marginVertical: 5, backgroundColor: '#f8f8f8', borderRadius: 8, gap: 5 },
    mealText: { fontSize: 18, fontWeight: 'bold' },
    menuText: { fontSize: 18, fontWeight: 'bold', marginBottom:10 },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 5,
    },
    timeText: {
        fontSize: 16,
    },
    loader: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 },
    buttonContainer: {
        marginVertical: 20,
        paddingVertical: 10,
        alignItems: 'center', // Center horizontally
    },
    
    saveButton: {
        backgroundColor: '#1E90FF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
    }, 
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AdminSettings