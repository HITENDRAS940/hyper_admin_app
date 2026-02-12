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
import { useScroll } from '../../contexts/ScrollContext';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ProfileIcon from './icons/ProfileIcon';
import HomeIcon from './icons/HomeIcon';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';
import ReportsIcon from './icons/ReportsIcon';

const { width } = Dimensions.get('window');

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { tabBarTranslateY: scrollTranslateY } = useScroll();

  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key].options;

  const internalTranslateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isHidden = (focusedOptions as any)?.tabBarStyle?.display === 'none';

  React.useEffect(() => {
    if (isHidden) {
      internalTranslateY.value = withTiming(100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 250 });
    } else {
      internalTranslateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 250 });
    }
  }, [isHidden]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: internalTranslateY.value + scrollTranslateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const getIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused ? theme.colors.primary : theme.colors.textSecondary;
    const size = ms(22);

    switch (routeName) {
      case 'DASHBOARD':
        return <HomeIcon color={color} size={size} />;
      case 'BOOKINGS':
        return <CalendarIcon color={color} size={size} />;
      case 'SLOT MANAGEMENT':
        return <ClockIcon color={color} size={size} />;
      case 'EARNINGS AND REPORTS':
        return <ReportsIcon color={color} size={size} />;
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
      case 'BOOKINGS':
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
                        ? theme.colors.primary
                        : theme.colors.textSecondary,
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
                      { backgroundColor: theme.colors.primary },
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
    borderRadius: '100@ms',
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