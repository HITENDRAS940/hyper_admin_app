import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScaledSheet, ms, vs, s } from 'react-native-size-matters';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const getIconName = (routeName: string, isFocused: boolean): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case 'DASHBOARD':
        return isFocused ? 'grid' : 'grid-outline';
      case 'BOOKING MANAGEMENT':
        return isFocused ? 'calendar' : 'calendar-outline';
      case 'SLOT MANAGEMENT':
        return isFocused ? 'time' : 'time-outline';
      case 'EARNINGS AND REPORTS':
        return isFocused ? 'stats-chart' : 'stats-chart-outline';
      case 'VENUE PROFILE':
        return isFocused ? 'business' : 'business-outline';
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
              size={ms(22)} 
              color={isFocused ? theme.colors.primary : theme.colors.gray} 
            />
            <Text 
              numberOfLines={2}
              adjustsFontSizeToFit
              style={[
                styles.tabLabel,
                { color: isFocused ? theme.colors.primary : theme.colors.gray }
              ]}
            >
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(-2) },
    shadowOpacity: 0.1,
    shadowRadius: ms(4),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '8@vs',
    paddingHorizontal: '2@s',
    minHeight: '60@vs',
  },
  tabLabel: {
    fontSize: '10@ms',
    marginTop: '2@vs',
    textAlign: 'center',
    paddingHorizontal: '2@s',
  },
});

export default CustomTabBar;
