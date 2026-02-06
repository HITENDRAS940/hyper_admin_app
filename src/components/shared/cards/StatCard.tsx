import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: string;
  trendUp?: boolean;
  onPress?: () => void;
  color?: string;
  progress?: number; // 0 to 100
  variant?: 'dark' | 'light';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  onPress,
  color,
  progress,
  variant = 'light',
}) => {
  const { theme } = useTheme();

  const isDark = variant === 'dark';
  const bgColor = isDark ? theme.colors.primary : theme.colors.card;
  const textColor = isDark ? '#FFFFFF' : theme.colors.text;
  const secondaryTextColor = isDark
    ? 'rgba(255,255,255,0.7)'
    : theme.colors.textSecondary;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          shadowColor: theme.colors.shadow,
          borderWidth: isDark ? 0 : 1,
          borderColor: theme.colors.border + '50',
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.value, { color: textColor }]}>{value}</Text>
        <Text style={[styles.title, { color: secondaryTextColor }]}>
          {title}
        </Text>
      </View>

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressLabel, { color: secondaryTextColor }]}>
              0%
            </Text>
            <Text style={[styles.progressLabel, { color: secondaryTextColor }]}>
              {progress}%
            </Text>
          </View>
          <View
            style={[
              styles.progressBarBg,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : theme.colors.border + '50',
              },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress}%`,
                  backgroundColor: isDark ? '#FFFFFF' : theme.colors.secondary,
                },
              ]}
            />
          </View>
        </View>
      )}

      {trend && (
        <View style={styles.trendRow}>
          <Ionicons
            name={trendUp ? 'trending-up' : 'trending-down'}
            size={12}
            color={trendUp ? theme.colors.success : theme.colors.error}
          />
          <Text
            style={[
              styles.trendText,
              { color: trendUp ? theme.colors.success : theme.colors.error },
            ]}
          >
            {trend}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

import { ScaledSheet } from 'react-native-size-matters';

// ... (StatCardProps and Component definition remain same)

const styles = ScaledSheet.create({
  card: {
    flex: 1,
    padding: '20@ms',
    borderRadius: '24@ms',
    minHeight: '140@vs',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOffset: { width: 0, height: '4@vs' },
    shadowOpacity: 0.05,
    shadowRadius: '10@ms',
  },
  content: {
    gap: '2@vs',
  },
  value: {
    fontSize: '24@ms',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: '13@ms',
    fontWeight: '600',
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: '16@vs',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '6@vs',
  },
  progressLabel: {
    fontSize: '10@ms',
    fontWeight: '700',
  },
  progressBarBg: {
    height: '4@vs',
    borderRadius: '2@ms',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '2@ms',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@s',
    marginTop: '10@vs',
  },
  trendText: {
    fontSize: '11@ms',
    fontWeight: '800',
  },
});

export default StatCard;
