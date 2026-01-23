import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { AdminBooking } from '../../../types';
import { s, vs, ms } from 'react-native-size-matters';
import StatusBadge from '../StatusBadge';
import ProfileIcon from '../icons/ProfileIcon';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: AdminBooking;
  onReschedule?: (booking: AdminBooking) => void;
  onCancel?: (booking: AdminBooking) => void;
  onCheckIn?: (booking: AdminBooking) => void;
  onNoShow?: (booking: AdminBooking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onReschedule,
  onCancel,
  onCheckIn,
  onNoShow,
}) => {
  const { theme } = useTheme();

  const getPaymentColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID': return theme.colors.success;
      case 'PENDING': return theme.colors.warning;
      case 'REFUNDED': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const isAttendancePending = booking.attendanceStatus === 'PENDING' || !booking.attendanceStatus;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {/* Header: Customer & Reference */}
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
             <Text style={styles.avatarText}>{booking.user?.name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <View style={styles.nameSection}>
            <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
              {booking.user?.name || 'Unknown User'}
            </Text>
            <Text style={[styles.phone, { color: theme.colors.textSecondary }]}>
              {booking.user?.phone || 'No phone'}
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <View style={[styles.iconCircle, { borderColor: theme.colors.border }]}>
            <Text style={[styles.refCode, { color: theme.colors.textSecondary }]}>
              #{booking.reference.slice(-4)}
            </Text>
          </View>
          <StatusBadge status={booking.status as any} />
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border + '50' }]} />

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons name="football" size={16} color={theme.colors.primary} />
          <Text style={[styles.detailText, { color: theme.colors.text }]}>{booking.sport || 'General'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.detailText, { color: theme.colors.text }]}>{booking.startTime} - {booking.endTime}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="business-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.detailText, { color: theme.colors.text }]}>{booking.serviceName}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="card-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.detailText, { color: getPaymentColor(booking.paymentStatus || 'PENDING'), fontWeight: '700' }]}>
            {booking.paymentStatus || 'PENDING'}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={[styles.typeBadge, { backgroundColor: booking.bookingType === 'ONLINE' ? '#6366F115' : '#10B98115' }]}>
          <Text style={[styles.typeText, { color: booking.bookingType === 'ONLINE' ? '#6366F1' : '#10B981' }]}>
            {booking.bookingType || 'ONLINE'}
          </Text>
        </View>
        <Text style={[styles.createdAt, { color: theme.colors.textSecondary }]}>
          Booked: {booking.createdAt ? format(new Date(booking.createdAt), 'MMM dd, HH:mm') : 'N/A'}
        </Text>
      </View>

      {/* Attendance Status (Special Highlight) */}
      {booking.status.toUpperCase() === 'CONFIRMED' && (
        <View style={[styles.attendanceSection, { backgroundColor: theme.colors.primary + '05' }]}>
          <Text style={[styles.attendanceLabel, { color: theme.colors.textSecondary }]}>Attendance:</Text>
          <View style={styles.attendanceValue}>
            <Text style={[styles.attendanceStatusText, { 
              color: booking.attendanceStatus === 'CHECKED_IN' ? theme.colors.success : 
                     booking.attendanceStatus === 'NO_SHOW' ? theme.colors.error : 
                     theme.colors.textSecondary 
            }]}>
              {booking.attendanceStatus || 'PENDING'}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {booking.status.toUpperCase() === 'CONFIRMED' && isAttendancePending && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.success + '15' }]} 
              onPress={() => onCheckIn?.(booking)}
            >
              <Ionicons name="checkbox" size={18} color={theme.colors.success} />
              <Text style={[styles.actionText, { color: theme.colors.success }]}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.error + '15' }]} 
              onPress={() => onNoShow?.(booking)}
            >
              <Ionicons name="close-circle" size={18} color={theme.colors.error} />
              <Text style={[styles.actionText, { color: theme.colors.error }]}>No Show</Text>
            </TouchableOpacity>
          </>
        )}
        
        {booking.status.toUpperCase() === 'CONFIRMED' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.primary + '15' }]} 
            onPress={() => onReschedule?.(booking)}
          >
            <Ionicons name="calendar" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>Shift</Text>
          </TouchableOpacity>
        )}

        {(booking.status.toUpperCase() === 'CONFIRMED' || booking.status.toUpperCase() === 'PENDING') && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.error + '10' }]} 
            onPress={() => onCancel?.(booking)}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
            <Text style={[styles.actionText, { color: theme.colors.error }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: ms(20),
    padding: ms(16),
    marginBottom: vs(16),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.05,
    shadowRadius: ms(10),
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    flex: 1,
  },
  avatarCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: '800',
  },
  nameSection: {
    flex: 1,
    gap: vs(1),
  },
  userName: {
    fontSize: ms(19),
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  phone: {
    fontSize: ms(12),
    fontWeight: '600',
    opacity: 0.7,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  iconCircle: {
    height: vs(28),
    paddingHorizontal: s(8),
    borderRadius: ms(8),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  refCode: {
    fontSize: ms(10),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: vs(12),
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(12),
    marginBottom: vs(12),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    minWidth: '45%',
  },
  detailText: {
    fontSize: ms(13),
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  typeBadge: {
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  typeText: {
    fontSize: ms(10),
    fontWeight: '800',
  },
  createdAt: {
    fontSize: ms(11),
  },
  attendanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ms(10),
    borderRadius: ms(12),
    marginBottom: vs(16),
    gap: s(8),
  },
  attendanceLabel: {
    fontSize: ms(12),
    fontWeight: '600',
  },
  attendanceValue: {
    flex: 1,
  },
  attendanceStatusText: {
    fontSize: ms(12),
    fontWeight: '800',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    paddingVertical: vs(8),
    borderRadius: ms(12),
    gap: s(6),
  },
  actionText: {
    fontSize: ms(12),
    fontWeight: '700',
  },
});

export default memo(BookingCard);
