import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ServiceManagementScreen from '../screens/admin/ServiceManagementScreen';
import AllBookingsScreen from '../screens/admin/AllBookingsScreen';
import AdminMoreScreen from '../screens/admin/AdminMoreScreen';
import AdminServiceDetailScreen from '../screens/admin/AdminServiceDetailScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import EarningsReportsScreen from '../screens/admin/EarningsReportsScreen';
import BookingHistoryScreen from '../screens/admin/BookingHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import CustomTabBar from '../components/shared/CustomTabBar';

// Bookings Stack (Live + History)
const BookingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LiveBookings" component={AllBookingsScreen} />
      <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
    </Stack.Navigator>
  );
};

// Slot Management Stack Navigator (formerly Services Stack)
const SlotManagementStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ServiceManagementList"
        component={ServiceManagementScreen}
      />
      <Stack.Screen
        name="AdminServiceDetail"
        component={AdminServiceDetailScreen}
      />
    </Stack.Navigator>
  );
};

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="DASHBOARD" component={DashboardScreen} />
      <Tab.Screen name="BOOKINGS" component={BookingsStack} />
      <Tab.Screen
        name="SLOT MANAGEMENT"
        component={SlotManagementStack}
        options={({ route }) => {
          const routeName =
            getFocusedRouteNameFromRoute(route) ?? 'ServiceManagementList';
          return {
            tabBarStyle:
              routeName === 'AdminServiceDetail'
                ? { display: 'none' }
                : undefined,
          };
        }}
      />
      <Tab.Screen
        name="EARNINGS AND REPORTS"
        component={EarningsReportsScreen}
      />
      <Tab.Screen name="VENUE PROFILE" component={AdminMoreScreen} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
