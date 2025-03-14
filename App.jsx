import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react'
import MenuPage from './src/pages/Menu';
import Purchase from './src/pages/Purchase';
import MyCouponPage from './src/pages/MyCoupon';
import { AuthProvider } from './src/context/AuthContext';
import Login from './src/pages/Auth/Login';
import AdminSettings from './src/pages/Admin/AdminSettings';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <AuthProvider>
    <NavigationContainer>
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
        <Tab.Screen name="Login" component={Login} options={{ headerShown: false }}/>
        <Tab.Screen name="Menu" component={MenuPage} />
        <Tab.Screen name="Purchase" component={Purchase} />
        <Tab.Screen name="Coupons" component={MyCouponPage} />
        <Tab.Screen name="Admin" component={AdminSettings}/>
      </Tab.Navigator>
    </NavigationContainer>
    </AuthProvider>
  )
}

export default App;