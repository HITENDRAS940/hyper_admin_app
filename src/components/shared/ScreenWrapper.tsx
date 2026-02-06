import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { SafeAreaView, EdgeInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  safeAreaEdges = ['top', 'left', 'right', 'bottom'],
}) => {
  return (
    <SafeAreaView edges={safeAreaEdges} style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
