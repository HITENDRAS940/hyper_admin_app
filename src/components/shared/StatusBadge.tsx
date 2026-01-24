import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ms, vs, s, ScaledSheet } from 'react-native-size-matters';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { theme } = useTheme();
  
  const getStatusStyle = () => {
    const s = status.toUpperCase();
    switch (s) {
      case 'CONFIRMED':
        return { bg: '#10B98120', text: '#10B981' };
      case 'COMPLETED':
        return { bg: theme.colors.secondary + '20', text: theme.colors.secondary };
      case 'EXPIRED':
        return { bg: theme.colors.gray + '20', text: theme.colors.gray };
      case 'CANCELLED':
        return { bg: theme.colors.error + '20', text: theme.colors.error };
      case 'PENDING':
        return { bg: theme.colors.warning + '20', text: theme.colors.warning };
      default:
        return { bg: theme.colors.primary + '20', text: theme.colors.primary };
    }
  };

  const style = getStatusStyle();

  return (
    <View style={[styles.container, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{status}</Text>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '8@s',
    paddingVertical: '2@vs',
    borderRadius: '12@ms',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
    fontSize: '10@ms',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

export default StatusBadge;
