import React, { useContext, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import AxiosInstance from '@/axios/config';

const OTP_LENGTH = 6;

const EmailVerification = () => {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const route = useRoute();

  const { email } = route.params || {};

  const handleChange = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move focus
      if (text !== '' && index < OTP_LENGTH - 1) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleBackspace = (key, index) => {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      return Alert.alert('Error', 'Please enter all 6 digits of the OTP');
    }

    try {
        setLoading(true);
        const response = await AxiosInstance.post('/users/verify-email', {
            email,
            otp: otpCode,
        });

        navigation.navigate('Signup', {
            email: email
        });

    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error.message);
      Alert.alert('Verification Failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {email}</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
            autoFocus={index === 0}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EmailVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 48,
    height: 55,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 22,
    backgroundColor: '#f9f9f9',
  },
});
