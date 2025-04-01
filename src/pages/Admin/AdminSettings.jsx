import React, { useContext, useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import AxiosInstance from '../../axios/config';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AdminSettings = () => {
    const { user } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState('Mess Timing'); // Default tab
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
                AxiosInstance.get('/days/getMenu'),
                AxiosInstance.get('/meals/getMeals'),
            ]);
            setMenuData(
                menuResponse.data.sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day))
            );
            setMealData(mealResponse.data);
        } catch (error) {
            console.log('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const updateMenuData = async () => {
        try {
            await AxiosInstance.post('/days/setMenu', { menuData });
            Alert.alert('Success', 'Menu changes saved');
        } catch (error) {
            console.log('Error', 'Failed to update menu');
        }
    };

    const updateMealData = async () => {
        try {
            await AxiosInstance.post('/meals/setMeals', { mealData });
            Alert.alert('Meals updated successfully');
        } catch (error) {
            console.log('Error', 'Failed to update meals');
        }
    };

    const formatTime = (date) => {
        return date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    };

    if (loading) {
        return <ActivityIndicator size="large" color="blue" style={styles.loader} />;
    }

    return user.isAdmin ? (
        <View style={styles.container}>
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                {['Mess Timing', 'Mess Menu'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.contentContainer}>
                {activeTab === 'Mess Timing' ? (
                    <>
                        {mealData.map((item, index) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.mealText}>{item.mealName.toUpperCase()}</Text>

                                <TouchableOpacity onPress={() => setStartTimePicker({ visible: true, index })}>
                                    <TextInput
                                        label="Start Time"
                                        mode="outlined"
                                        value={formatTime(item.startTime)}
                                        editable={false}
                                        right={<TextInput.Icon icon="clock" />}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEndTimePicker({ visible: true, index })}>
                                    <TextInput
                                        label="End Time"
                                        mode="outlined"
                                        value={formatTime(item.endTime)}
                                        editable={false}
                                        right={<TextInput.Icon icon="clock" />}
                                    />
                                </TouchableOpacity>

                                <TextInput
                                    label={'Cost'}
                                    mode="outlined"
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
                    </>
                ) : (
                    <>
                        {menuData.map((menu, index) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.menuText}>{menu.day}</Text>
                                <TextInput
                                    mode="outlined"
                                    label={'Breakfast'}
                                    value={menu.breakfast}
                                    onChangeText={(text) => {
                                        const newMenu = [...menuData];
                                        newMenu[index].breakfast = text;
                                        setMenuData(newMenu);
                                    }}
                                />
                                <TextInput
                                    mode="outlined"
                                    label={'Lunch'}
                                    value={menu.lunch}
                                    onChangeText={(text) => {
                                        const newMenu = [...menuData];
                                        newMenu[index].lunch = text;
                                        setMenuData(newMenu);
                                    }}
                                />
                                <TextInput
                                    mode="outlined"
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
                    </>
                )}
            </ScrollView>

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
        </View>
    ) : (
        <Text>Not Admin</Text>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingBottom:30},
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', padding: 10, marginBottom: 10},
    tab: { padding: 10, flex: 1, alignItems: 'center' },
    activeTab: { borderBottomWidth: 3, borderBottomColor: '#1E90FF' },
    tabText: { fontSize: 16, },
    activeTabText: { color: '#1E90FF', fontWeight: 'bold' },
    contentContainer: { padding: 20 },
    card: { padding: 10, marginVertical: 5, backgroundColor: '#f8f8f8', borderRadius: 8, gap: 5 },
    mealText: { fontSize: 18, fontWeight: 'bold' },
    menuText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    buttonContainer: { alignItems: 'center', marginVertical: 20 },
    saveButton: { backgroundColor: '#1E90FF', padding: 12, borderRadius: 8, width: '80%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default AdminSettings;
