import React, { useCallback, useContext, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AxiosInstance from "../axios/config";
import { AuthContext } from "../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import { TextInput } from "react-native-paper";

const NoticeScreen = () => {
    const { user } = useContext(AuthContext);
    const isAdmin = user?.isAdmin;
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedNotices, setExpandedNotices] = useState({});
    
    // Modal states
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    
    // Notice fields
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [selectedNotice, setSelectedNotice] = useState(null);

    useFocusEffect(
        useCallback(() => {
            fetchNotices();
        }, [])
    );

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await AxiosInstance.get("/notices");
            setNotices(response.data || []);
        } catch (error) {
            console.error("Error fetching notices:", error);
            Alert.alert("Error", "Failed to load notices.");
            setNotices([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteNotice = async (id) => {
        try {
            await AxiosInstance.delete(`/notices/${id}`);
            setNotices(notices.filter((notice) => notice._id !== id));
            Alert.alert("Success", "Notice deleted successfully!");
        } catch (error) {
            console.error("Error deleting notice:", error);
            Alert.alert("Error", "Failed to delete notice.");
        }
    };

    const toggleExpand = (id) => {
        setExpandedNotices((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Open Edit Modal
    const openEditModal = (notice) => {
        setSelectedNotice(notice);
        setSubject(notice.subject);
        setBody(notice.body);
        setEditModalVisible(true);
    };

    // Handle Edit Notice
    const editNotice = async () => {
        if (!subject.trim() || !body.trim()) {
            Alert.alert("Error", "Subject and body cannot be empty.");
            return;
        }

        try {
            await AxiosInstance.put(`/notices/${selectedNotice._id}`, { subject, body });

            setNotices(notices.map((notice) =>
                notice._id === selectedNotice._id ? { ...notice, subject, body } : notice
            ));

            Alert.alert("Success", "Notice updated successfully!");
            setEditModalVisible(false);
        } catch (error) {
            console.error("Error updating notice:", error);
            Alert.alert("Error", "Failed to update notice.");
        }
    };

    // Open Add Notice Modal
    const openAddModal = () => {
        setSubject("");
        setBody("");
        setAddModalVisible(true);
    };

    // Handle Add Notice
    const addNotice = async () => {
        if (!subject.trim() || !body.trim()) {
            Alert.alert("Error", "Subject and body cannot be empty.");
            return;
        }

        try {
            const response = await AxiosInstance.post("/notices", { subject, body });

            setNotices([...notices, response.data]);
            Alert.alert("Success", "Notice added successfully!");
            setAddModalVisible(false);
        } catch (error) {
            console.error("Error adding notice:", error);
            Alert.alert("Error", "Failed to add notice.");
        }
    };
    
    //Format Time 
    const formatTimeOrRelative = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp);

        const isSameDay =
            now.getDate() === date.getDate() &&
            now.getMonth() === date.getMonth() &&
            now.getFullYear() === date.getFullYear();

        if (isSameDay) {
            // Show exact time like 3:45 PM
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours}:${minutes} ${ampm}`;
        }

        const secondsPast = (now.getTime() - timestamp) / 1000;

        if (secondsPast < 60) {
            return `${parseInt(secondsPast)}s`;
        }
        if (secondsPast < 3600) {
            return `${parseInt(secondsPast / 60)}m`;
        }
        if (secondsPast <= 86400) {
            return `${parseInt(secondsPast / 3600)}h`;
        }

        const day = date.getDate();
        const month = date.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        const year = date.getFullYear() === now.getFullYear() ? "" : " " + date.getFullYear();

        return `${day} ${month}${year}`;
    };

    const renderNotice = ({ item }) => {
        const isExpanded = expandedNotices[item._id];
        const trimmedBody = item.body.length > 100 ? `${item.body.substring(0, 100)}...` : item.body;

        return (
            <View style={{ padding: 15, borderBottomWidth: 1, borderColor: "#ddd" }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.subject}</Text>
                    <Text style={{ fontSize: 12, color: "gray", marginBottom: 5 }}>
                        {formatTimeOrRelative(item.createdAt)}
                    </Text>
                </View>

                <Text style={{ fontSize: 16, color: "gray" }}>
                    {isExpanded ? item.body : trimmedBody}
                </Text>

                {item.body.length > 100 && (
                    <TouchableOpacity onPress={() => toggleExpand(item._id)}>
                        <Text style={{ color: "#007AFF", fontSize: 14 }}>
                            {isExpanded ? "Show less" : "Read more"}
                        </Text>
                    </TouchableOpacity>
                )}

                {isAdmin && (
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <TouchableOpacity onPress={() => deleteNotice(item._id)} style={{ marginRight: 15 }}>
                            <Icon name="delete" size={22} color="red" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openEditModal(item)}>
                            <Icon name="edit" size={22} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        )  
    };

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>

            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 }}/>
            ) : (
                <FlatList
                    data={notices}
                    keyExtractor={(item) => item._id}
                    renderItem={renderNotice}
                    ListEmptyComponent={<Text>No notices available</Text>}
                />
            )}

            {isAdmin && (
                <TouchableOpacity
                    onPress={openAddModal}
                    style={{
                    backgroundColor: "#007AFF",
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        justifyContent: "center",
                        alignItems: "center",
                        position: "absolute",
                        bottom: 20,
                        right: 20,
                    }}
                >
                    <Icon name="add" size={28} color="white" />
                </TouchableOpacity>
            )}

            {/* Edit Notice Modal */}
            <Modal visible={editModalVisible} animationType="slide" transparent>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View style={{ width: "90%", backgroundColor: "white", padding: 20, borderRadius: 10 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Edit Notice</Text>

                        <TextInput
                            mode="outlined"
                            label={"Subject"}
                            value={subject}
                            onChangeText={setSubject}
                            borderColor="#ccc"
                            activeOutlineColor="#1E90FF"
                            placeholderTextColor="#888"
                            placeholder="Subject"
                            style={{ width: '100%',
                                height: 50,
                                paddingHorizontal: 10,
                                marginVertical: 10, 
                                backgroundColor:"#f9f9f9",
                            }}
                        />
                        <TextInput
                            mode="outlined"
                            label={"Body"}
                            value={body}
                            onChangeText={setBody}
                            borderColor="#ccc"
                            activeOutlineColor="#1E90FF"
                            placeholderTextColor="#888"
                            placeholder="Body"
                            multiline
                            style={{ paddingHorizontal: 10, height: 80,  backgroundColor:"#f9f9f9",}}
                        />

                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ padding: 10 }}>
                                <Text style={{ color: "gray" }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={editNotice} style={{ padding: 10 }}>
                                <Text style={{ color: "#007AFF" }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Notice Modal */}
            <Modal visible={addModalVisible} animationType="slide" transparent>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View style={{ width: "90%", backgroundColor: "white", padding: 20, borderRadius: 10 }}>
                        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>Add Notice</Text>

                        <TextInput
                            mode="outlined"
                            label={"Subject"}
                            value={subject}
                            onChangeText={setSubject}
                            borderColor="#ccc"
                            activeOutlineColor="#1E90FF"
                            placeholderTextColor="#888"
                            placeholder="Subject"
                            style={{ width: '100%',
                                height: 50,
                                paddingHorizontal: 10,
                                marginVertical: 10,
                                backgroundColor:"#f9f9f9",
                            }}
                        />
                        <TextInput
                            mode="outlined"
                            label={"Body"}
                            value={body}
                            onChangeText={setBody}
                            borderColor="#ccc"
                            activeOutlineColor="#1E90FF"
                            placeholderTextColor="#888"
                            placeholder="Body"
                            multiline
                            style={{paddingHorizontal: 10, height: 80,  backgroundColor:"#f9f9f9",}}
                        />

                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}  style={{ padding: 10 }}>
                                <Text style={{ color: "gray" }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={addNotice} style={{ padding: 10}}>
                                <Text style={{ color: "#007AFF" }}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default NoticeScreen;