import React, { useContext } from 'react'
import { Formik } from "formik";
import * as Yup from "yup";
import { AuthContext } from '../context/AuthContext'
import Accordion from '../components/Accordion'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import AxiosInstance from '../axios/config';

const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string(), // Optional
});

const Profile = () => {
    const { user, logout, updateUser } = useContext(AuthContext);

    const handleProfileUpdate = async (values, actions) => {
        try {
          const updatedUser = { ...user, name: `${values.firstName} ${values.lastName || ''}` };
          console.log(updatedUser);
          
          await AxiosInstance.put(`/users/updateUser/${user.userId}`, updatedUser);
          updateUser(updatedUser);

          alert("Profile updated successfully!");
        } catch (error) {
          console.error("Profile update error:", error.response?.data || error.message);
          alert("Failed to update profile.");
        } finally {
          actions.setSubmitting(false);
        }
    };
  
    return (
        <View style={styles.container}>
          <View style={{marginVertical: 20}}>
            <Accordion title="Manage Profile">
                <Formik
                    initialValues={{ firstName: user.name.split(" ")[0] || "", lastName: user.name.split(" ")[1] || "" }}
                    validationSchema={ProfileSchema}
                    onSubmit={handleProfileUpdate}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                    <View style={styles.profileDataContainer}>
                        <TextInput
                        style={styles.input}
                        label="First Name"
                        mode='outlined'
                        placeholder="First Name"
                        value={values.firstName}
                        onChangeText={handleChange("firstName")}
                        onBlur={handleBlur("firstName")}
                        />
                        {touched.firstName && errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

                        <TextInput
                        style={styles.input}
                        label="Last Name"
                        mode='outlined'
                        placeholder="Last Name (Optional)"
                        value={values.lastName}
                        onChangeText={handleChange("lastName")}
                        onBlur={handleBlur("lastName")}
                        />
                        
                        <TextInput
                        style={styles.input}
                        label="Email"
                        mode='outlined'
                        placeholder="Email"
                        value={user.email}
                        editable={false}
                        />
                        
                        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
                          <Text style={styles.buttonText}>{isSubmitting ? "Updating..." : "Update Profile"}</Text>
                        </TouchableOpacity>
                    </View>
                    )}
                </Formik>
            </Accordion>

            <View style={{padding: 20}}>
            <Button mode="outlined" onPress={logout} style={styles.logoutButton} textColor='red' borderColor='red'>
              Logout
            </Button>
            </View>
          </View>
        </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding:20,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    profileDataContainer: {
      padding: 20,
      backgroundColor: '#fff',
      alignItems: 'center',
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
        height: 40,
        backgroundColor: '#1E90FF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
      marginTop: 30,
      borderRadius: 5,
      borderColor:'#FF3B30',
    },
    logoutText: {
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold',
    },
});

export default Profile