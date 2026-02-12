import React, { createContext, useContext, useMemo } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

interface ScrollContextType {
  tabBarTranslateY: SharedValue<number>;
  hideTabBar: () => void;
  showTabBar: () => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tabBarTranslateY = useSharedValue(0);

  const hideTabBar = () => {
    tabBarTranslateY.value = withTiming(100, { duration: 300 });
  };

  const showTabBar = () => {
    tabBarTranslateY.value = withTiming(0, { duration: 300 });
  };

  const value = useMemo(
    () => ({
      tabBarTranslateY,
      hideTabBar,
      showTabBar,
    }),
    [tabBarTranslateY]
  );

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
};

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};
