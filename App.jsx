import messaging from '@react-native-firebase/messaging';
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext, useEffect, useState} from 'react'
import MenuPage from './src/pages/Menu';
import Purchase from './src/pages/Purchase';
import MyCouponPage from './src/pages/MyCoupon';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import Login from './src/pages/Auth/Login';
import AdminSettings from './src/pages/Admin/AdminSettings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MealCount from './src/pages/Admin/MealCount';
import SignUp from './src/pages/Auth/SignUp';
import ScanCoupon from './src/pages/Admin/ScanCoupon';
import Profile from './src/pages/Profile';
import NoticeScreen from './src/pages/Notice';
import { createDefaultChannel, getFCMToken, handleNotifeeNotification, requestUserPermission } from './src/utils/notificationService';
import notifee, { EventType } from '@notifee/react-native';
import { navigationRef } from './src/utils/navigationRef';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const AvatarDropdown = () => {
  const navigation = useNavigation();

  return (
      <TouchableOpacity
        style={styles.avatar}
        onPress={() => navigation.navigate('Profile')}
      >
        <Ionicons name="person-circle-outline" size={40} color="white" />
      </TouchableOpacity>
  );
};

const BottomTabNavigator = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Tab.Navigator
      initialRouteName="Menu"
      screenOptions={{
        headerShown: true,
        headerRight: () => <AvatarDropdown />,
      }}
    >
     <Tab.Screen 
        name="Menu" 
        component={MenuPage} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }} 
      />
      {!user?.isAdmin && (
        <>
        <Tab.Screen 
          name="Purchase" 
          component={Purchase} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" size={size} color={color} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Coupons" 
          component={MyCouponPage} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pricetag-outline" size={size} color={color} />
            ),
          }} 
        />
      </>
      )}
      {user?.isAdmin && (
        <>
        <Tab.Screen 
          name="Admin" 
          component={AdminSettings} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }} 
        />

        <Tab.Screen 
          name="Scan" 
          component={ScanCoupon} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="scan-sharp" size={size} color={color} />
            ),
          }} 
        />

        <Tab.Screen 
          name="Inventory" 
          component={MealCount} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bag-outline" size={size} color={color} />
            ),
          }} 
        />
        </> 
      )}
       <Tab.Screen 
        name="Notice" 
        component={NoticeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-open-outline" size={size} color={color} />
          ),
        }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useContext(AuthContext); // Check if user is logged in
  const navigation = useNavigation();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
         <Image source={require('./assets/logo.png')} style={{width: 150, height: 150, resizeMode: 'contain'}} />
      </View>
    );
  }


  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
        <Stack.Screen name="Tabs" component={BottomTabNavigator} />
        <Stack.Screen 
          name="Profile" 
          component={Profile}  
          options={{
            headerShown: true, 
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 5 }}>
                <Ionicons name="chevron-back" size={20} color="black" />
              </TouchableOpacity>
            ),
          }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={SignUp} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const {title, body} = remoteMessage.notification;
      await notifee.displayNotification({
        title: title || 'New Notification',
        body: body || 'You have a new message',
        android: {
          channelId: 'default',
          pressAction: {
            id: 'default',
          },
        },
      })
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
      requestUserPermission();
      createDefaultChannel();
      handleNotifeeNotification();
  }, []);

  return (
    <AuthProvider>
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(196, 196, 196, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    right: 10,
    top: 50,
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 5,
    borderRadius: 5,
  },
  logoutText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;