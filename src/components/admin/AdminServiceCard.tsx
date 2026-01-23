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
  const statusColor = availabilityStatus ? theme.colors.success : theme.colors.error;

  if (!service) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* Status Border (Top) */}
      <View style={[styles.statusBorder, { backgroundColor: statusColor }]} />

      {/* Watermark Icon */}
      <View style={styles.watermarkContainer}>
        <Ionicons 
          name="football-outline" 
          size={ms(180)} 
          color={theme.colors.gray} 
          style={{ opacity: 0.2 }} 
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.mainInfo}>
          <View style={styles.badgeRow}>
            {/* Active Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {availabilityStatus ? 'Active' : 'Inactive'}
              </Text>
            </View>

            {/* Approval Status Badge */}
            {service.approvalStatus && (
              <View style={[
                styles.statusBadge, 
                { 
                  backgroundColor: service.approvalStatus === 'APPROVED' ? theme.colors.success + '15' : 
                                  service.approvalStatus === 'REJECTED' ? theme.colors.error + '15' : 
                                  theme.colors.primary + '15' 
                }
              ]}>
                <Ionicons 
                  name={service.approvalStatus === 'APPROVED' ? 'checkmark-circle' : 
                        service.approvalStatus === 'REJECTED' ? 'close-circle' : 'time'} 
                  size={12} 
                  color={service.approvalStatus === 'APPROVED' ? theme.colors.success : 
                        service.approvalStatus === 'REJECTED' ? theme.colors.error : 
                        theme.colors.primary} 
                />
                <Text style={[
                  styles.statusText, 
                  { 
                    color: service.approvalStatus === 'APPROVED' ? theme.colors.success : 
                           service.approvalStatus === 'REJECTED' ? theme.colors.error : 
                           theme.colors.primary 
                  }
                ]}>
                  {service.approvalStatus}
                </Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {service.name}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <LocationIcon size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {service.location}
            </Text>
          </View>
        </View>

        {/* Manage Button */}
        <TouchableOpacity 
          style={styles.manageButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.manageButtonGradient}
          >
            <Text style={styles.manageButtonText}>Manage</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    borderRadius: ms(20),
    marginBottom: vs(16),
    flexDirection: 'column',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.08,
    shadowRadius: ms(12),
    elevation: 4,
    width: s(335), // Default to a scaled width, though usually container handles this
    aspectRatio: 1.33,
    position: 'relative',
  },
  statusBorder: {
    width: '100%',
    height: vs(6),
  },
  watermarkContainer: {
    position: 'absolute',
    right: s(-20),
    bottom: vs(-20),
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  contentContainer: {
    flex: 1,
    padding: ms(24),
    justifyContent: 'space-between',
    zIndex: 1,
  },
  mainInfo: {
    flex: 1,
    gap: vs(12),
  },
  badgeRow: {
    flexDirection: 'row',
    gap: s(8),
    flexWrap: 'wrap',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: ms(12),
    gap: s(4),
  },
  statusDot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
  },
  statusText: {
    fontSize: ms(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: ms(28),
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: ms(34),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
  },
  location: {
    fontSize: ms(16),
    fontWeight: '500',
  },
  manageButton: {
    borderRadius: ms(20),
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.3,
    shadowRadius: ms(8),
    elevation: 6,
    marginTop: 'auto',
    width: '100%',
  },
  manageButtonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(14),
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AdminServiceCard;
