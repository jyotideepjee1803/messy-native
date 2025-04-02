import React, { useContext } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import { TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import AxiosInstance from "../../axios/config";
import logo from '../../../assets/logo.png';
import { Formik } from "formik";
import * as Yup from "yup";

const SignUpSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string(),  // Optional
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password too short").required("Password is required"),
  confirmPassword: Yup.string()
  .oneOf([Yup.ref('password'), null], 'Passwords must match')
  .required('Confirm Password is required'),
});

const SignUp = () => {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);

  const handleSignUp = async (values, actions) => {
    try {
      const fullName = values.firstName + (values.lastName ? ` ${values.lastName}` : "");
      const userPayload = {
        name: fullName,
        email: values.email,
        password: values.password,
        isAdmin: false,
      };

      const response = await AxiosInstance.post("/users/signUp", userPayload);

      const { _id, token, name, isAdmin } = response.data;
      const userData = { userId: _id, token, name, email: values.email, isAdmin };
      
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
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              mode="outlined"
              label="Password"
              borderColor="#ccc"
              activeOutlineColor="#1E90FF"
              placeholderTextColor="#888"
              placeholder="Password"
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              secureTextEntry
            />
            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TextInput
              style={styles.input}
              mode="outlined"
              label="Confirm Password"
              borderColor="#ccc"
              activeOutlineColor="#1E90FF"
              placeholderTextColor="#888"
              placeholder="Confirm Password"
              value={values.confirmPassword}
              onChangeText={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
              secureTextEntry
            />
            {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.buttonText}>{isSubmitting ? "Signing Up..." : "Sign Up"}</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.signupText}>Already have an account? <Text style={styles.signupLink}>Sign in</Text></Text>
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

export default SignUp;
