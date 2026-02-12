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
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  actions = [],
  paddingTop = 0,
  showBackButton = false,
  onBackPress,
  rightComponent,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { paddingTop }]}>
      <View style={styles.titleSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={ms(24)} color={theme.colors.text} />
          </TouchableOpacity>
        )}
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
      </View>
      {rightComponent ? (
        <View style={styles.rightComponent}>{rightComponent}</View>
      ) : (
        actions.length > 0 && (
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
                  color={
                    action.variant === 'filled' ? '#FFF' : theme.colors.text
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
        )
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
    fontSize: ms(24),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: s(12),
    padding: s(4),
    marginLeft: -s(4),
  },
  subtitleText: {
    fontSize: ms(13),
    fontWeight: '500',
    marginTop: -vs(1),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  rightComponent: {
    flexDirection: 'row',
    alignItems: 'center',
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
