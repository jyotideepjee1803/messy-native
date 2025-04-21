import React, { useContext, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import AxiosInstance from '@/axios/config';


const SendOTP = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const send = async () => {
    try {
        setLoading(true);
        // console.log(email);
        const response = await AxiosInstance.post('/users/send-otp', {email});

        const { email: userEmail } = response.data;
        navigation.navigate('EmailVerification', {
            email: userEmail,
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
        <Text style={styles.title}>Register Email</Text>
        <Text style={styles.subtitle}>Enter your Email Address</Text>

        <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            inputMode='email'
            placeholder='Email'
        />

        <TouchableOpacity style={styles.button} onPress={send} disabled={loading}>
            {loading ? (
            <ActivityIndicator color="#fff" />
            ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
            )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signupText}>Already have an account? <Text style={styles.signupLink}>Sign in</Text></Text>
        </TouchableOpacity>
    </View>
  );
};

export default SendOTP;

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
  signupText: {
    marginTop: 15,
    color: '#333',
  },
  signupLink: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
});
