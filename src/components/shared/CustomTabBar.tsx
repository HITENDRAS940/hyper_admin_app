import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const getIconName = (routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case 'Dashboard':
        return isFocused ? 'grid' : 'grid-outline';
      case 'Services':
        return isFocused ? 'briefcase' : 'briefcase-outline';
      case 'Users':
        return isFocused ? 'people' : 'people-outline';
      case 'Bookings':
        return isFocused ? 'calendar' : 'calendar-outline';
      case 'More':
        return isFocused ? 'menu' : 'menu-outline';
      default:
        return 'ellipse';
    }
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.surface,
      paddingBottom: insets.bottom,
      borderTopColor: theme.colors.border,
    }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.tabItem}
          >
            <Ionicons 
              name={getIconName(route.name, isFocused)} 
              size={24} 
              color={isFocused ? theme.colors.primary : theme.colors.gray} 
            />
            <Text style={{ 
              color: isFocused ? theme.colors.primary : theme.colors.gray, 
              fontSize: 10,
              marginTop: 4 
            }}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});

export default CustomTabBar;
