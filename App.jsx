import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext } from 'react'
import MenuPage from './src/pages/Menu';
import Purchase from './src/pages/Purchase';
import MyCouponPage from './src/pages/MyCoupon';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import Login from './src/pages/Auth/Login';
import AdminSettings from './src/pages/Admin/AdminSettings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BottomTabNavigator = () => {
  const { logout } = useContext(AuthContext);
  return (
  <Tab.Navigator
        initialRouteName="Menu"
        screenOptions={({ route }) => ({
          // tabBarIcon: ({ color, size }) => {
          //   let iconName;

          //   if (route.name === 'Menu') {
          //     iconName = 'restaurant-outline'; // Icon for Menu
          //   } else if (route.name === 'Purchase') {
          //     iconName = 'cart-outline'; // Icon for Purchase
          //   }

          //   return <Icon name={iconName} size={size} color={color} />;
          // },
          tabBarActiveTintColor: '#007AFF', // Active tab color
          tabBarInactiveTintColor: 'gray', // Inactive tab color
          tabBarStyle: { backgroundColor: 'white', paddingBottom: 5 }, // Styling
        })}
      >
        <Tab.Screen name="Menu" component={MenuPage} options={{
            headerRight: () => (
              <Button title="Logout" onPress={logout} color="#FF3B30" />
            ),
          }}/>
        <Tab.Screen name="Purchase" component={Purchase} options={{
            headerRight: () => (
              <Button title="Logout" onPress={logout} color="#FF3B30" />
            ),
          }}/>
        <Tab.Screen name="Coupons" component={MyCouponPage} options={{
            headerRight: () => (
              <Button title="Logout" onPress={logout} color="#FF3B30" />
            ),
          }}/>
        <Tab.Screen name="Admin" component={AdminSettings} options={{
            headerRight: () => (
              <Button title="Logout" onPress={logout} color="#FF3B30" />
            ),
          }}/>
      </Tab.Navigator>
  )
}

const AppNavigator = () => {
  const { user } = useContext(AuthContext); // Check if user is logged in

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    </AuthProvider>
  )
}

export default App;