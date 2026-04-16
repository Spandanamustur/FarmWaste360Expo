// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// Screens
import HomeScreen from './screens/HomeScreen';
import FarmerLogin from './screens/FarmerLogin';
import IndustryLogin from './screens/IndustryLogin';
import FarmerDashboard from './screens/FarmerDashboard';
import IndustryDashboard from './screens/IndustryDashboard';
import ChatScreen from './screens/ChatScreen';
import PurchaseScreen from './screens/PurchaseScreen';
import PurchaseHistory from './screens/PurchaseHistory';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const userType = await AsyncStorage.getItem('userType');
      if (userType === 'farmer') setInitialRoute('FarmerDashboard');
      else if (userType === 'industry') setInitialRoute('IndustryDashboard');
      else setInitialRoute('Home');
    };
    checkLogin();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FarmerLogin" component={FarmerLogin} />
        <Stack.Screen name="IndustryLogin" component={IndustryLogin} />
        <Stack.Screen name="FarmerDashboard" component={FarmerDashboard} />
        <Stack.Screen name="IndustryDashboard" component={IndustryDashboard} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="PurchaseScreen" component={PurchaseScreen} />
        <Stack.Screen name="PurchaseHistory" component={PurchaseHistory} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
