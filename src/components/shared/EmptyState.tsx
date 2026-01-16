import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
  message?: string;
  title?: string;
  icon?: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, title }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={{ color: theme.colors.textSecondary }}>{title || message || 'No Data'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default EmptyState;
