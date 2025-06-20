import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/Login';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/Dashboard';
import ProfileScreen from './screens/Profile';
import SettingsScreen from './screens/Settings';
import ChangePasswordScreen from './screens/changepassword';
import AddBeelScreen from './screens/AddBeel';
import SurveyFormScreen from './screens/SurveyFormScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Beel Management' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'User Profile' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen} 
          options={{ title: 'Change Password' }}
        />
        <Stack.Screen 
          name="AddBeel" 
          component={AddBeelScreen} 
          options={{ 
            title: 'Add New Beel',
            headerStyle: {
              backgroundColor: '#3498db',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="SurveyForm" 
          component={SurveyFormScreen} 
          options={{ 
            title: 'Survey Form',
            headerStyle: {
              backgroundColor: '#3498db',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}