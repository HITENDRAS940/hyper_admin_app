import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet, vs } from 'react-native-size-matters';
import { useTheme } from '../../../contexts/ThemeContext';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  onPress?: () => void;
  color?: string;
  progress?: number; // 0 to 100
  variant?: 'dark' | 'light';
  subMetrics?: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value = 0,
  trend,
  trendUp,
  onPress,
  color,
  progress,
  variant = 'light',
  subMetrics,
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
      <View style={styles.header}>
        <View style={styles.content}>
          <Text style={[styles.value, { color: textColor }]}>{value}</Text>
          <Text style={[styles.title, { color: secondaryTextColor }]}>
            {title}
          </Text>
        </View>
      </View>

      {subMetrics && subMetrics.length > 0 && (
        <View
          style={[
            styles.subMetricsContainer,
            subMetrics.length === 2 && styles.subMetricsSplit,
          ]}
        >
          {subMetrics.map((metric, index) => (
            <View
              key={index}
              style={[
                styles.subMetricItem,
                subMetrics.length === 2 && styles.subMetricItemSplit,
                index > 0 && {
                  borderLeftWidth: 1.5,
                  borderLeftColor: isDark
                    ? 'rgba(255,255,255,0.2)'
                    : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[styles.subMetricLabel, { color: secondaryTextColor }]}
              >
                {metric.label}
              </Text>
              <Text style={[styles.subMetricValue, { color: textColor }]}>
                {metric.value || 0}
              </Text>
            </View>
          ))}
        </View>
      )}

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

const styles = ScaledSheet.create({
  card: {
    flex: 1,
    padding: '20@ms',
    borderRadius: '24@ms',
    minHeight: '140@vs',
    justifyContent: 'space-between',
    elevation: 2,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.05,
    shadowRadius: '10@ms',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
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
  subMetricsContainer: {
    flexDirection: 'row',
    marginTop: '16@vs',
    paddingTop: '12@vs',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  subMetricsSplit: {
    paddingTop: '16@vs',
    marginHorizontal: '-20@ms',
    paddingHorizontal: '10@ms',
    // backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomLeftRadius: '24@ms',
    borderBottomRightRadius: '24@ms',
    marginTop: '20@vs',
  },
  subMetricItem: {
    flex: 1,
    paddingLeft: '12@s',
  },
  subMetricItemSplit: {
    alignItems: 'center',
    paddingLeft: 0,
    paddingVertical: '4@vs',
  },
  subMetricValue: {
    fontSize: '16@ms',
    fontWeight: '900',
    marginTop: '2@vs',
  },
  subMetricLabel: {
    fontSize: '9@ms',
    fontWeight: '800',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
}) as any;


export default React.memo(StatCard);
