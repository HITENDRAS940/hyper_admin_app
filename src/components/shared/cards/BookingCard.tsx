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

  const isAttendancePending =
    booking.attendanceStatus === 'PENDING' || !booking.attendanceStatus;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Header: Customer & Reference */}
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>
              {booking.user?.name?.charAt(0).toUpperCase() || 'G'}
            </Text>
          </View>
          <View style={styles.nameSection}>
            <Text
              style={[styles.userName, { color: theme.colors.text }]}
              numberOfLines={1}
            >
              {booking.user?.name || 'Guest User'}
            </Text>
            {booking.user?.phone && (
              <Text
                style={[styles.phone, { color: theme.colors.textSecondary }]}
              >
                {booking.user.phone}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerIcons}>
          <View
            style={[styles.iconCircle, { borderColor: theme.colors.border }]}
          >
            <Text
              style={[styles.refCode, { color: theme.colors.textSecondary }]}
            >
              #{booking.reference.slice(-4)}
            </Text>
          </View>
          <StatusBadge status={booking.status as any} />
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: theme.colors.border + '50' },
        ]}
      />

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={theme.colors.primary}
          />
          <Text style={[styles.detailText, { color: theme.colors.text }]}>
            {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons
            name="time-outline"
            size={14}
            color={theme.colors.primary}
          />
          <Text style={[styles.detailText, { color: theme.colors.text }]}>
            {booking.startTime} - {booking.endTime}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons
            name="business-outline"
            size={14}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.detailText, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {booking.resourceName}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons
            name="card-outline"
            size={14}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.detailText,
              { color: theme.colors.secondary, fontWeight: '700' },
            ]}
          >
            {booking.amountBreakdown.currency}{' '}
            {booking.amountBreakdown.totalAmount.toFixed(0)}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor:
                booking.bookingType === 'ONLINE' || !booking.bookingType
                  ? '#6366F115'
                  : '#10B98115',
            },
          ]}
        >
          <Text
            style={[
              styles.typeText,
              {
                color:
                  booking.bookingType === 'ONLINE' || !booking.bookingType
                    ? '#6366F1'
                    : '#10B981',
              },
            ]}
          >
            {booking.bookingType || 'ONLINE'}
          </Text>
        </View>
        <Text style={[styles.createdAt, { color: theme.colors.textSecondary }]}>
          {booking.createdAt
            ? format(new Date(booking.createdAt), 'MMM dd, HH:mm')
            : 'N/A'}
        </Text>
      </View>

      {/* Attendance Status (Special Highlight) */}
      {booking.status.toUpperCase() === 'CONFIRMED' && (
        <View
          style={[
            styles.attendanceSection,
            { backgroundColor: theme.colors.primary + '05' },
          ]}
        >
          <Text
            style={[
              styles.attendanceLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Attendance:
          </Text>
          <View style={styles.attendanceValue}>
            <Text
              style={[
                styles.attendanceStatusText,
                {
                  color:
                    booking.attendanceStatus === 'CHECKED_IN'
                      ? theme.colors.success
                      : booking.attendanceStatus === 'NO_SHOW'
                        ? theme.colors.error
                        : theme.colors.textSecondary,
                },
              ]}
            >
              {booking.attendanceStatus || 'PENDING'}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {booking.status.toUpperCase() === 'CONFIRMED' &&
          isAttendancePending && (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.success + '15' },
                ]}
                onPress={() => onCheckIn?.(booking)}
              >
                <Ionicons
                  name="checkbox"
                  size={16}
                  color={theme.colors.success}
                />
                <Text
                  style={[styles.actionText, { color: theme.colors.success }]}
                >
                  Check In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.error + '15' },
                ]}
                onPress={() => onNoShow?.(booking)}
              >
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={theme.colors.error}
                />
                <Text
                  style={[styles.actionText, { color: theme.colors.error }]}
                >
                  No Show
                </Text>
              </TouchableOpacity>
            </>
          )}

        {booking.status.toUpperCase() === 'CONFIRMED' && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary + '15' },
            ]}
            onPress={() => onReschedule?.(booking)}
          >
            <Ionicons name="calendar" size={16} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>
              Shift
            </Text>
          </TouchableOpacity>
        )}

        {(booking.status.toUpperCase() === 'CONFIRMED' ||
          booking.status.toUpperCase() === 'PENDING') && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.error + '10' },
            ]}
            onPress={() => onCancel?.(booking)}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color={theme.colors.error}
            />
            <Text style={[styles.actionText, { color: theme.colors.error }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: ms(16),
    padding: ms(12),
    marginBottom: vs(12),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.05,
    shadowRadius: ms(8),
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    flex: 1,
  },
  avatarCircle: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: '800',
  },
  nameSection: {
    flex: 1,
    gap: 0,
  },
  userName: {
    fontSize: ms(16),
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  phone: {
    fontSize: ms(11),
    fontWeight: '600',
    opacity: 0.7,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  iconCircle: {
    height: vs(24),
    paddingHorizontal: s(6),
    borderRadius: ms(6),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  refCode: {
    fontSize: ms(9),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: vs(8),
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
    marginBottom: vs(8),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
    minWidth: '45%',
  },
  detailText: {
    fontSize: ms(12),
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  typeBadge: {
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    borderRadius: ms(6),
  },
  typeText: {
    fontSize: ms(9),
    fontWeight: '800',
  },
  createdAt: {
    fontSize: ms(10),
  },
  attendanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ms(8),
    borderRadius: ms(10),
    marginBottom: vs(12),
    gap: s(6),
  },
  attendanceLabel: {
    fontSize: ms(11),
    fontWeight: '600',
  },
  attendanceValue: {
    flex: 1,
  },
  attendanceStatusText: {
    fontSize: ms(11),
    fontWeight: '800',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(6),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    paddingVertical: vs(6),
    borderRadius: ms(10),
    gap: s(4),
  },
  actionText: {
    fontSize: ms(11),
    fontWeight: '700',
  },
});

export default memo(BookingCard);
