import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import ProgressScreen from '../screens/ProgressScreen';
import NutritionScreen from '../screens/NutritionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutPlayerScreen from '../screens/WorkoutPlayerScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Workout') iconName = 'dumbbell';
          else if (route.name === 'Exercise') iconName = 'arm-flex';
          else if (route.name === 'Progress') iconName = 'chart-line';
          else if (route.name === 'Nutrition') iconName = 'food';
          else if (route.name === 'Profile') iconName = 'account';
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#8E8EA0',
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopColor: 'rgba(255,255,255,0.1)',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60
        },
        headerStyle: {
          backgroundColor: '#1A1A2E',
          elevation: 0,
          shadowOpacity: 0
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: 'bold'
        },
        headerTintColor: '#FFFFFF'
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Exercise" component={ExerciseScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1A1A2E' }
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen 
        name="WorkoutPlayer" 
        component={WorkoutPlayerScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#1A1A2E' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Workout'
        }}
      />
      <Stack.Screen 
        name="ExerciseDetail" 
        component={ExerciseDetailScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#1A1A2E' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Exercise Details'
        }}
      />
    </Stack.Navigator>
  );
}
