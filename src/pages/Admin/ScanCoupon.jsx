import React, { useCallback, useState } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Camera } from "react-native-camera-kit";
import AxiosInstance from "../../axios/config";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const ScanCoupon = ({ navigation }) => {
  const [scanning, setScanning] = useState(true);

  useFocusEffect(
    useCallback(() => {
        setScanning(true); // Reset scanning when the screen is focused
            return () => setScanning(false); // Cleanup when screen is unfocused
        }, [])
    );


  // Function to handle the scanned QR data
  const handleScan = async (qrData) => {
    try {
      const parsedData = JSON.parse(qrData);
      const response = await AxiosInstance.post("/coupons/scan", parsedData);

      if (response.data.success) {
        Alert.alert("Success", response.data.message, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      Alert.alert("Error", error?.message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
    {scanning ? (
      <View style={styles.cameraWrapper}>
        <Camera
          scanBarcode={true}
          onReadCode={(event) => handleScan(event.nativeEvent.codeStringValue)}
          showFrame={false} // Hide default square frame
          laserColor="blue"
          frameColor="blue"
          style={styles.camera}
        />
        {/* Overlay UI */}
        <View style={styles.overlay}>
            <Text style={styles.instruction}>Align QR Code Inside the Frame</Text>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
      </View>
    ) : (
      <Text style={styles.scannedText}>QR Code Scanned!</Text>
    )}

    {/* Cancel Button */}
    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate("Menu")}>
      <Text style={styles.cancelText}>Cancel</Text>
    </TouchableOpacity>
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
      },
      cameraWrapper: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      },
      camera: {
        width: "100%",
        height: "100%",
      },
      overlay: {
        position: "absolute",
        top: "15%",
        alignItems: "center",
        width: "100%",
      },
      instruction: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
      },
      scannerFrame: {
        width: width * 0.75,
        height: width * 0.75,
        // borderRadius: 20
        // borderWidth: 4,
        // borderColor: "white",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      },
      scannerLaser: {
        position: "absolute",
        width: "100%",
        height: 4,
        backgroundColor: "red",
        opacity: 0.8,
      },
      corner: {
        position: "absolute",
        width: 40,
        height: 40,
        borderColor: "white",
      },
      topLeft: {
        borderLeftWidth: 4,
        borderTopWidth: 4,
        top: 0,
        left: 0,
      },
      topRight: {
        borderRightWidth: 4,
        borderTopWidth: 4,
        top: 0,
        right: 0,
      },
      bottomLeft: {
        borderLeftWidth: 4,
        borderBottomWidth: 4,
        bottom: 0,
        left: 0,
      },
      bottomRight: {
        borderRightWidth: 4,
        borderBottomWidth: 4,
        bottom: 0,
        right: 0,
      },
      scannedText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "green",
        textAlign: "center",
        marginTop: 20,
      },
      cancelButton: {
        position: "absolute",
        bottom: 40,
        backgroundColor: "#ff5555",
        paddingVertical: 14,
        paddingHorizontal: 25,
        borderRadius: 10,
      },
      cancelText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 18,
      },
});

export default ScanCoupon;
