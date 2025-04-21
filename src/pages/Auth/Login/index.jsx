import React, { useContext } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator } from "react-native";
import { TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import PasswordInput from "@/components/PasswordInput";
import AxiosInstance from "@/axios/config";
import logo from '@/assets/logo.png';

import { Formik } from "formik";
import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password too short").required("Password is required"),
});

const Login = () => {
  const navigation = useNavigation();
  
  const handleLogin = async (values, actions) => {
    try {
      const fcmToken = await AsyncStorage.getItem('fcm_token');
      console.log(fcmToken);
      const response = await AxiosInstance.post("/users/signIn", values);
      const { userId } = response.data;
      // const userData = { userId: _id, token, name, email: values.email, isAdmin };
      // await AxiosInstance.post("/users/updateFCMToken", { fcmToken: fcmToken, userId: userId });
      
      // login(userData); 
      // navigation.navigate('Tabs', { screen: 'Menu' });
      navigation.navigate('OtpVerification', {
        userId: userId,
        email: values.email,
        fcmToken: fcmToken,
      });
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      Alert.alert("Login Failed", error.response?.data?.message || "Invalid email or password.");
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
            <TextInput
              style={styles.input}
              mode="outlined"
              label="Email"
              borderColor="#ccc"
              activeOutlineColor="#1E90FF"
              placeholder="Email"
              placeholderTextColor="#888"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            
            <PasswordInput name="password" style={styles.input} />
            
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </Formik>
      <TouchableOpacity onPress={() => navigation.navigate("SendOTP")}>
        <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Sign up</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    height: 200,
    width: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 15,
    color: '#333',
  },
  signupLink: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});

export default Login;
