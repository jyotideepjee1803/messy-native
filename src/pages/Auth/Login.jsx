import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import AxiosInstance from "../../axios/config";

const Login = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      console.log(email, password);
      const response = await AxiosInstance.post("/users/signIn", { email, password });
      console.log(response.data);
      const { _id, token, name, isAdmin} = response.data;

      const userData = {userId: _id, token, name, email, isAdmin};
      login(userData); // Save in AuthContext
      navigation.navigate("Menu");
    } catch (error) {
      console.error("Login error", error);
      Alert.alert("Login failed", "Check your credentials.");
    }
  };

  return (
    <View>
      <Text>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={(text) => setEmail(text)} />
      <TextInput placeholder="Password" value={password} onChangeText={(text) => setPassword(text)} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      {/* <Button title="Go to Signup" onPress={() => navigation.navigate("SignupScreen")} /> */}
    </View>
  );
};

export default Login;
