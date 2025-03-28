import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Camera } from "react-native-camera-kit";
import AxiosInstance from "../../axios/config";
import { useFocusEffect } from "@react-navigation/native";
import { Dialog, Portal, Button, Provider } from "react-native-paper";

const { width } = Dimensions.get("window");

const ScanCoupon = ({ navigation }) => {
  const [scanning, setScanning] = useState(true);
  const [alertShown, setAlertShown] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      setScanning(true);
      setAlertShown(false);
      return () => setScanning(false);
    }, [])
  );

  const handleScan = async (qrData) => {
    if (alertShown) return;

    try {
      setAlertShown(true);
      const parsedData = JSON.parse(qrData);
      const response = await AxiosInstance.post("/coupons/scan", parsedData);
      setDialogMessage(response.data.message);
    } catch (error) {
      setDialogMessage(error.response?.data?.message || "An error occurred");
    } finally {
      setDialogVisible(true);
      setScanning(false);
    }
  };

  const hideDialog = () => {
    setDialogVisible(false);
    navigation.navigate("Menu");
  };

  return (
    <Provider>
      <View style={styles.container}>
        {scanning ? (
          <View style={styles.cameraWrapper}>
            <Camera
              scanBarcode={true}
              onReadCode={(event) => handleScan(event.nativeEvent.codeStringValue)}
              showFrame={false}
              laserColor="blue"
              frameColor="blue"
              style={styles.camera}
            />
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

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate("Menu")}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {/* Dialog for Success/Error Messages */}
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Scan Result</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>{dialogMessage}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog} textColor="#007AFF">OK</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
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
  dialog: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  dialogTitle: {
    color: "#333",
    fontSize: 20,
    fontWeight: "bold",
  },
  dialogText: {
    fontSize: 16,
    color: "#555",
  },
});

export default ScanCoupon;
