import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../contexts/ThemeContext';
import StatusBadge from '../shared/StatusBadge';
import { adminAPI } from '../../services/api';
import { ActivityIndicator, Alert } from 'react-native';

interface BookingDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  booking: any;
  onBookingCompleted?: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  visible,
  onClose,
  booking,
  onBookingCompleted,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = React.useState(false);

  if (!booking) return null;

  const handleCompleteBooking = async () => {
    try {
      setLoading(true);
      await adminAPI.completeBooking(booking.id);
      Alert.alert('Success', 'Booking marked as completed successfully.');
      if (onBookingCompleted) {
        onBookingCompleted();
      }
      onClose();
    } catch (error: any) {
      console.error('Error completing booking:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to complete booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = booking.status === 'COMPLETED';

  const DetailRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View style={styles.detailRow}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
        <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Booking Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.statusSection}>
              <StatusBadge status={booking.status} />
              <Text style={[styles.reference, { color: theme.colors.textSecondary }]}>
                Ref: {booking.reference}
              </Text>
            </View>

            <View style={styles.detailsGrid}>
              <DetailRow 
                label="Service" 
                value={booking.serviceName} 
                icon="business-outline" 
              />
              <DetailRow 
                label="Date" 
                value={booking.bookingDate} 
                icon="calendar-outline" 
              />
              <DetailRow 
                label="Time" 
                value={`${booking.startTime} - ${booking.endTime}`} 
                icon="time-outline" 
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border + '50' }]} />

            <View style={styles.paymentSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Summary</Text>
              
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, { color: theme.colors.textSecondary }]}>Total Amount</Text>
                <Text style={[styles.paymentValue, { color: theme.colors.text }]}>
                  {booking.amountBreakdown.currency} {booking.amountBreakdown.totalAmount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, { color: theme.colors.textSecondary }]}>Online Paid</Text>
                <Text style={[styles.paymentValue, { color: '#10B981' }]}>
                  {booking.amountBreakdown.currency} {booking.amountBreakdown.onlineAmount.toFixed(2)}
                </Text>
              </View>

              <View style={[styles.paymentRow, styles.venueRow, { backgroundColor: theme.colors.primary + '08' }]}>
                <View>
                  <Text style={[styles.paymentLabel, { color: theme.colors.primary, fontWeight: '700' }]}>To be collected at Venue</Text>
                  <Text style={[styles.venueStatus, { color: booking.amountBreakdown.venueAmountCollected ? '#10B981' : '#F59E0B' }]}>
                    {booking.amountBreakdown.venueAmountCollected ? 'Already Collected' : 'Pending Collection'}
                  </Text>
                </View>
                <Text style={[styles.totalVenueAmount, { color: theme.colors.primary }]}>
                  {booking.amountBreakdown.currency} {booking.amountBreakdown.venueAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>

            {!isCompleted && (
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  { backgroundColor: theme.colors.primary },
                  loading && { opacity: 0.7 }
                ]}
                onPress={handleCompleteBooking}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={{ marginRight: s(8) }} />
                    <Text style={styles.doneButtonText}>Complete Booking</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.doneButton, { borderColor: theme.colors.border, borderWidth: 1 }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.doneButtonText, { color: theme.colors.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: s(20),
  },
  modalContent: {
    borderRadius: ms(24),
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ms(20),
    borderBottomWidth: 1,
    borderBottomColor: '#00000008',
  },
  title: {
    fontSize: ms(18),
    fontWeight: '800',
  },
  closeBtn: {
    padding: ms(4),
  },
  scrollContent: {
    padding: ms(20),
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: vs(24),
  },
  reference: {
    fontSize: ms(12),
    fontWeight: '600',
    marginTop: vs(8),
  },
  detailsGrid: {
    gap: vs(16),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: s(40),
    height: s(40),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: ms(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(2),
  },
  value: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: vs(24),
  },
  paymentSection: {
    gap: vs(12),
  },
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    marginBottom: vs(8),
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: ms(13),
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  venueRow: {
    marginTop: vs(8),
    padding: ms(12),
    borderRadius: ms(12),
  },
  venueStatus: {
    fontSize: ms(10),
    fontWeight: '600',
    marginTop: vs(2),
  },
  totalVenueAmount: {
    fontSize: ms(18),
    fontWeight: '800',
  },
  doneButton: {
    marginHorizontal: ms(20),
    marginBottom: ms(20),
    paddingVertical: vs(12),
    borderRadius: ms(14),
    alignItems: 'center',
  },
  completeButton: {
    margin: ms(20),
    marginBottom: ms(8),
    paddingVertical: vs(14),
    borderRadius: ms(14),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: '700',
  },
});

export default BookingDetailsModal;
