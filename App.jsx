//React hooks and components
import React, { useContext, useEffect, useState} from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

//Context and UTILS
import { navigationRef } from '@/utils/navigationRef';
import { AuthContext, AuthProvider } from '@/context/AuthContext';
import { createDefaultChannel, getFCMToken, handleNotifeeNotification, requestUserPermission } from '@/utils/notificationService';
import notifee, { EventType } from '@notifee/react-native';

//React navigation
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//Firebase
import messaging from '@react-native-firebase/messaging';

//Common Pages
import MenuPage from '@/pages/Menu';
import Purchase from '@/pages/Purchase';
import MyCouponPage from '@/pages/MyCoupon';
import Profile from '@/pages/Profile';
import NoticeScreen from '@/pages/Notice';

//Auth Pages
import OtpVerification from '@/pages/Auth/Login/VerifyOTP';
import Login from '@/pages/Auth/Login';
import SendOTP from '@/pages/Auth/SignUp/SendOTP';
import EmailVerification from '@/pages/Auth/SignUp/VerifyOTP';
import SignUp from '@/pages/Auth/SignUp';

//Admin Pages
import MealCount from '@/pages/Admin/MealCount';
import AdminSettings from '@/pages/Admin/AdminSettings';
import ScanCoupon from '@/pages/Admin/ScanCoupon';

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
            <Ionicons name="restaurant" size={size} color={color} />
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
              <Ionicons name="cart" size={size} color={color} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Coupons" 
          component={MyCouponPage} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pricetag" size={size} color={color} />
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
              <Ionicons name="settings" size={size} color={color} />
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
              <Ionicons name="bag" size={size} color={color} />
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
            <Ionicons name="mail" size={size} color={color} />
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
          <Stack.Screen name="OtpVerification" component={OtpVerification}/>
          <Stack.Screen name="SendOTP" component={SendOTP}/>
          <Stack.Screen name="EmailVerification" component={EmailVerification}/>
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