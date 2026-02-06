import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Service } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LocationIcon from '../shared/icons/LocationIcon';

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
          borderColor: theme.colors.border + '50',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Top Banner Accent */}
      <View style={[styles.topAccent, { backgroundColor: statusColor }]} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          {/* Status Chips */}
          <View style={styles.chipsContainer}>
            <View
              style={[
                styles.statusChip,
                { backgroundColor: statusColor + '15' },
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
                        ? theme.colors.primary + '15'
                        : '#71717A15',
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

          <TouchableOpacity style={styles.moreButton} onPress={onPress}>
            <Ionicons
              name="settings-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <Text
            style={[styles.name, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {service.name}
          </Text>

          <View style={styles.locationContainer}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.colors.primary}
              />
            </View>
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
            { borderTopColor: theme.colors.border + '30' },
          ]}
        >
          <View style={styles.sportsContainer}>
            {(service.sports || ['General']).slice(0, 2).map((sport, index) => (
              <View
                key={index}
                style={[
                  styles.sportTag,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <Text
                  style={[
                    styles.sportTagText,
                    { color: theme.colors.textSecondary },
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
                +{service.sports.length - 2} more
              </Text>
            )}
          </View>

          <View style={styles.actionPrompt}>
            <Text style={[styles.manageLabel, { color: theme.colors.primary }]}>
              Manage
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
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
      borderRadius: ms(24),
      marginBottom: vs(20),
      overflow: 'hidden',
      borderWidth: 1,
      elevation: 4,
      shadowOffset: { width: 0, height: vs(4) },
      shadowOpacity: 0.06,
      shadowRadius: ms(12),
    },
    topAccent: {
      height: vs(4),
      width: '100%',
      opacity: 0.8,
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
      borderRadius: ms(12),
      gap: s(6),
    },
    dot: {
      width: s(6),
      height: s(6),
      borderRadius: s(3),
    },
    statusChipText: {
      fontSize: ms(11),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    moreButton: {
      width: s(36),
      height: s(36),
      borderRadius: s(18),
      backgroundColor: '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mainInfo: {
      marginBottom: vs(20),
    },
    name: {
      fontSize: ms(22),
      fontWeight: '800',
      letterSpacing: -0.5,
      lineHeight: ms(28),
      marginBottom: vs(8),
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
    },
    iconWrapper: {
      width: s(24),
      height: s(24),
      borderRadius: s(8),
      justifyContent: 'center',
      alignItems: 'center',
    },
    location: {
      fontSize: ms(14),
      fontWeight: '500',
      flex: 1,
    },
    footer: {
      marginTop: vs(4),
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
      paddingHorizontal: s(8),
      paddingVertical: vs(4),
      borderRadius: ms(8),
    },
    sportTagText: {
      fontSize: ms(10),
      fontWeight: '600',
    },
    moreSportsText: {
      fontSize: ms(10),
      fontWeight: '500',
      marginLeft: s(4),
    },
    actionPrompt: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(2),
    },
    manageLabel: {
      fontSize: ms(13),
      fontWeight: '700',
    },
  });

export default AdminServiceCard;
