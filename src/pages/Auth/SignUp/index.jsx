import React, { useContext } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator } from "react-native";
import { TextInput } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AuthContext } from "@/context/AuthContext";
import AxiosInstance from "@/axios/config";
import PasswordInput from "@/components/PasswordInput";
import logo from '@/assets/logo.png';

import * as Yup from "yup";
import { Formik } from "formik";

const SignUpSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string(),  // Optional
//   email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password too short").required("Password is required"),
  confirmPassword: Yup.string()
  .oneOf([Yup.ref('password'), null], 'Passwords must match')
  .required('Confirm Password is required'),
});

const SignUp = () => {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const route = useRoute();

  const { email } = route.params || {};

  const handleSignUp = async (values, actions) => {
    try {
      const fullName = values.firstName + (values.lastName ? ` ${values.lastName}` : "");
      const userPayload = {
        name: fullName,
        email: email,
        password: values.password,
        isAdmin: false,
      };
      console.log(userPayload);
      const fcmToken = await AsyncStorage.getItem('fcm_token');

      const response = await AxiosInstance.post("/users/signUp", userPayload);

      const { _id, token, name, isAdmin } = response.data;
      const userData = { userId: _id, token, name, email: email, isAdmin };
      await AxiosInstance.post("/users/updateFCMToken", { fcmToken: fcmToken, userId: _id});
      login(userData);
      navigation.navigate('Tabs', { screen: 'Menu' });
    } catch (error) {
      console.error("SignUp error:", error.response?.data || error.message);
      Alert.alert("SignUp Failed", error.response?.data?.message || "Something went wrong.");
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Sign Up</Text>
      <Formik
        initialValues={{ firstName: "", lastName: "", email: "", password: "" }}
        validationSchema={SignUpSchema}
        onSubmit={handleSignUp}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
            <TextInput
              style={styles.input}
              mode="outlined"
              label="First Name"
              borderColor="#ccc"
              activeOutlineColor="#1E90FF"
              placeholderTextColor="#888"
              placeholder="First Name"
              value={values.firstName}
              onChangeText={handleChange("firstName")}
              onBlur={handleBlur("firstName")}
              required
            />
            {touched.firstName && errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <TextInput
              style={styles.input}
              mode="outlined"
              label="Last Name"
              borderColor="#ccc"
              activeOutlineColor="#1E90FF"
              placeholderTextColor="#888"
              placeholder="Last Name (Optional)"
              value={values.lastName}
              onChangeText={handleChange("lastName")}
              onBlur={handleBlur("lastName")}
            />

            <TextInput
              style={styles.input}
              mode="outlined"
              label="Email"
              borderColor="#ccc"
              activeOutlineColor="#1E90FF"
              placeholderTextColor="#888"
              placeholder="Email"
              value={email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
            {/* {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>} */}

            <PasswordInput name="password" style={styles.input} />

            <PasswordInput name="confirmPassword" label="Confirm Password" style={styles.input} />

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </Formik>
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

export default SignUp;
