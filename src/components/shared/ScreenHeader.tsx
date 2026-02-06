import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderAction {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  variant?: 'outline' | 'filled';
  iconSize?: number;
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  actions?: HeaderAction[];
  paddingTop?: number;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  actions = [],
  paddingTop = 0,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { paddingTop }]}>
      <View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitleText, { color: theme.colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={`${action.icon}-${action.variant ?? 'outline'}`}
              style={
                action.variant === 'filled'
                  ? styles.filledCircle
                  : styles.outlineCircle
              }
              onPress={action.onPress}
            >
              <Ionicons
                name={action.icon}
                size={
                  action.iconSize ?? (action.variant === 'filled' ? 24 : 20)
                }
                color={action.variant === 'filled' ? '#FFF' : theme.colors.text}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const screenHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(24),
    paddingBottom: vs(20),
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: ms(28),
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitleText: {
    fontSize: ms(14),
    fontWeight: '500',
    marginTop: -vs(2),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  outlineCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filledCircle: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const styles = screenHeaderStyles;

export default ScreenHeader;
