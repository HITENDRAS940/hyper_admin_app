import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface AdminServiceCardProps {
  service: Service;
  onPress?: () => void;
}

const AdminServiceCard: React.FC<AdminServiceCardProps> = ({
  service,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const availabilityStatus = service?.availability ?? true;
  const statusColor = availabilityStatus
    ? theme.colors.success
    : theme.colors.error;

  if (!service) return null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border + '30',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          {/* Status Chips */}
          <View style={styles.chipsContainer}>
            <View
              style={[
                styles.statusChip,
                { backgroundColor: statusColor + '10' },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusChipText, { color: statusColor }]}>
                {availabilityStatus ? 'Live' : 'Inactive'}
              </Text>
            </View>

            {service.approvalStatus && (
              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      service.approvalStatus === 'APPROVED'
                        ? theme.colors.primary + '10'
                        : '#71717A10',
                  },
                ]}
              >
                <Ionicons
                  name={
                    service.approvalStatus === 'APPROVED'
                      ? 'shield-checkmark'
                      : 'time-outline'
                  }
                  size={12}
                  color={
                    service.approvalStatus === 'APPROVED'
                      ? theme.colors.primary
                      : '#71717A'
                  }
                />
                <Text
                  style={[
                    styles.statusChipText,
                    {
                      color:
                        service.approvalStatus === 'APPROVED'
                          ? theme.colors.primary
                          : '#71717A',
                    },
                  ]}
                >
                  {service.approvalStatus}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.settingsIcon,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <Text
            style={[styles.name, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {service.name}
          </Text>

          <View style={styles.locationContainer}>
            <Ionicons
              name="location"
              size={14}
              color={theme.colors.textSecondary}
              style={{ opacity: 0.7 }}
            />
            <Text
              style={[styles.location, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {service.location}
              {service.city ? `, ${service.city}` : ''}
            </Text>
          </View>
        </View>

        {/* Footer Info */}
        <View
          style={[
            styles.footer,
            { borderTopColor: theme.colors.border + '20' },
          ]}
        >
          <View style={styles.sportsContainer}>
            {(service.sports || ['General']).slice(0, 2).map((sport, index) => (
              <View
                key={index}
                style={[
                  styles.sportTag,
                  { backgroundColor: theme.colors.primary + '08' },
                ]}
              >
                <Text
                  style={[
                    styles.sportTagText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {sport}
                </Text>
              </View>
            ))}
            {service.sports && service.sports.length > 2 && (
              <Text
                style={[
                  styles.moreSportsText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                +{service.sports.length - 2}
              </Text>
            )}
          </View>

          <View style={styles.actionPrompt}>
            <Text style={[styles.manageLabel, { color: theme.colors.primary }]}>
              Manage
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={theme.colors.primary}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      borderRadius: ms(28),
      marginBottom: vs(16),
      overflow: 'hidden',
      borderWidth: 1,
      elevation: 2,
      shadowOffset: { width: 0, height: vs(2) },
      shadowOpacity: 0.04,
      shadowRadius: ms(8),
    },
    content: {
      padding: ms(20),
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vs(16),
    },
    chipsContainer: {
      flexDirection: 'row',
      gap: s(8),
    },
    statusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(10),
      paddingVertical: vs(5),
      borderRadius: ms(100),
      gap: s(6),
    },
    dot: {
      width: s(6),
      height: s(6),
      borderRadius: s(3),
    },
    statusChipText: {
      fontSize: ms(10),
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingsIcon: {
      width: s(32),
      height: s(32),
      borderRadius: ms(10),
      justifyContent: 'center',
      alignItems: 'center',
    },
    mainInfo: {
      marginBottom: vs(20),
    },
    name: {
      fontSize: ms(20),
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: vs(4),
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
    },
    location: {
      fontSize: ms(13),
      fontWeight: '600',
      flex: 1,
    },
    footer: {
      paddingTop: vs(16),
      borderTopWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sportsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
    },
    sportTag: {
      paddingHorizontal: s(10),
      paddingVertical: vs(4),
      borderRadius: ms(8),
    },
    sportTagText: {
      fontSize: ms(10),
      fontWeight: '700',
    },
    moreSportsText: {
      fontSize: ms(10),
      fontWeight: '600',
      opacity: 0.6,
    },
    actionPrompt: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(2),
    },
    manageLabel: {
      fontSize: ms(13),
      fontWeight: '800',
    },
  });

export default AdminServiceCard;
