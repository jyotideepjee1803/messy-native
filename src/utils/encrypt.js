import CryptoJS from "react-native-crypto-js";

const QR_SECRET_KEY = "messySecureqrSecret"

export const encrypt = (dataObject) => {
    const jsonData = JSON.stringify(dataObject);
    const ciphertext = CryptoJS.AES.encrypt(jsonData, QR_SECRET_KEY).toString();
    return ciphertext;
};