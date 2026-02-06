import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { ScaledSheet, ms, vs, s } from 'react-native-size-matters';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import ProfileIcon from './icons/ProfileIcon';

const { width } = Dimensions.get('window');

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key].options;

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isHidden = (focusedOptions as any)?.tabBarStyle?.display === 'none';

  React.useEffect(() => {
    if (isHidden) {
      translateY.value = withTiming(100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 250 });
    } else {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 250 });
    }
  }, [isHidden]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const getIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused ? theme.colors.secondary : theme.colors.gray;
    const size = ms(20);

    switch (routeName) {
      case 'DASHBOARD':
        return (
          <Ionicons
            name={isFocused ? 'grid' : 'grid-outline'}
            size={size}
            color={color}
          />
        );
      case 'BOOKING MANAGEMENT':
        return (
          <Ionicons
            name={isFocused ? 'calendar' : 'calendar-outline'}
            size={size}
            color={color}
          />
        );
      case 'SLOT MANAGEMENT':
        return (
          <Ionicons
            name={isFocused ? 'time' : 'time-outline'}
            size={size}
            color={color}
          />
        );
      case 'EARNINGS AND REPORTS':
        return (
          <Ionicons
            name={isFocused ? 'stats-chart' : 'stats-chart-outline'}
            size={size}
            color={color}
          />
        );
      case 'VENUE PROFILE':
        return <ProfileIcon color={color} size={size} />;
      default:
        return <Ionicons name="ellipse" size={size} color={color} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'DASHBOARD':
        return 'Home';
      case 'BOOKING MANAGEMENT':
        return 'Bookings';
      case 'SLOT MANAGEMENT':
        return 'Slots';
      case 'EARNINGS AND REPORTS':
        return 'Reports';
      case 'VENUE PROFILE':
        return 'Profile';
      default:
        return routeName;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, vs(15)),
        },
        animatedStyle,
      ]}
      pointerEvents={isHidden ? 'none' : 'auto'}
    >
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
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
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.tabItemContent}>
                {getIcon(route.name, isFocused)}
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.label,
                    {
                      color: isFocused
                        ? theme.colors.secondary
                        : theme.colors.gray,
                      fontWeight: isFocused ? '700' : '500',
                    },
                  ]}
                >
                  {getLabel(route.name)}
                </Text>
                {isFocused && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: theme.colors.secondary },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = ScaledSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: '16@s',
    marginBottom: '8@vs',
    borderRadius: '24@ms',
    height: '65@vs',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)', // Using border color from theme with opacity
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4@vs',
  },
  label: {
    fontSize: '9@ms',
    marginTop: '2@vs',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-10@vs',
    width: '4@s',
    height: '4@vs',
    borderRadius: '2@ms',
  },
});

export default CustomTabBar;
