import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ms, s, vs } from 'react-native-size-matters';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  message?: string; // Legacy support
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-text-outline',
  title,
  description,
  actionLabel,
  onAction,
  message,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.primary + '10' },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={ms(48)}
          color={theme.colors.primary}
        />
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {title || message || 'No Data'}
      </Text>
      {description && (
        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(40),
  },
  iconContainer: {
    width: ms(100),
    height: ms(100),
    borderRadius: ms(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(24),
  },
  title: {
    fontSize: ms(20),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: vs(8),
  },
  description: {
    fontSize: ms(14),
    textAlign: 'center',
    lineHeight: ms(20),
    marginBottom: vs(32),
  },
  button: {
    paddingHorizontal: s(24),
    paddingVertical: vs(12),
    borderRadius: ms(25),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: '600',
  },
});

export default EmptyState;
