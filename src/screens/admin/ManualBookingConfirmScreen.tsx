import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { adminAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const ManualBookingConfirmScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { service, resource, slots, date } = route.params;

  // Aggregate slot data
  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const upper = timeStr.trim().toUpperCase();
    const amPmMatch = upper.match(/(\d+):(\d+)\s*(AM|PM)/);
    
    if (amPmMatch) {
      let hours = parseInt(amPmMatch[1], 10);
      const minutes = parseInt(amPmMatch[2], 10);
      const modifier = amPmMatch[3];
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }

    const parts = upper.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  const sortedSlots = [...slots].sort((a: any, b: any) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const startTime = sortedSlots[0].startTime;
  const endTime = sortedSlots[sortedSlots.length - 1].endTime;
  const totalSlotPrice = slots.reduce((accValue: number, s: any) => accValue + s.price, 0);

  const [amount, setAmount] = useState(totalSlotPrice.toString());
  const [onlinePaid, setOnlinePaid] = useState('0');
  const [venueCollected, setVenueCollected] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const formatTime = (time: string) => {
    if (!time) return '00:00:00';
    
    // Convert to uppercase for consistent matching
    const upperTime = time.trim().toUpperCase();
    
    // Handle cases like "9:30 AM" or "09:30 AM"
    const amPmMatch = upperTime.match(/(\d+):(\d+)\s*(AM|PM)/);
    if (amPmMatch) {
      let hours = parseInt(amPmMatch[1], 10);
      const minutes = amPmMatch[2];
      const modifier = amPmMatch[3];

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    }

    // Handle cases like "09:30" or "09:30:00"
    const parts = upperTime.split(':');
    if (parts.length === 3) return upperTime;
    if (parts.length === 2) return `${upperTime}:00`;
    
    return upperTime;
  };

  const handleConfirm = async () => {
    if (!remarks.trim()) {
      Alert.alert('Required', 'Please enter customer details or remarks');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        serviceId: Number(service.id),
        resourceId: Number(resource.id),
        activityCode: resource.activities?.[0]?.code || 'DEFAULT',
        bookingDate: date,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        amount: Number(amount),
        onlineAmountPaid: Number(onlinePaid),
        venueAmountCollected: Number(venueCollected),
        remarks: remarks,
      };

      const response = await adminAPI.manualBooking(payload);
      setSuccessData(response);
    } catch (error: any) {
      console.error('Error creating manual booking:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to create manual booking'
      );
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    const breakdown = successData.amountBreakdown || {};
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={s(80)} color={theme.colors.success || '#4CAF50'} />
            <Text style={[styles.successTitle, { color: theme.colors.text }]}>Booking Confirmed!</Text>
            <Text style={[styles.successSubtitle, { color: theme.colors.textSecondary }]}>
              Reference: <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{successData.reference}</Text>
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, marginTop: vs(20) }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: vs(15) }]}>Booking Details</Text>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Service</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{successData.serviceName}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Date & Time</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {successData.bookingDate} • {successData.startTime} - {successData.endTime}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.summaryItem}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Total Amount</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>₹{breakdown.totalAmount}</Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.summaryItem, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Online Paid</Text>
                <Text style={[styles.value, { color: '#4CAF50' }]}>₹{breakdown.onlineAmount}</Text>
              </View>
              <View style={[styles.summaryItem, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Venue Amount</Text>
                <Text style={[styles.value, { color: theme.colors.primary }]}>₹{breakdown.venueAmount}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.confirmButton, { backgroundColor: theme.colors.primary, marginTop: 'auto' }]}
            onPress={() => navigation.navigate('DASHBOARD')}
          >
            <Text style={styles.confirmButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      <ScreenHeader 
        title="Confirm Booking" 
        subtitle="Finalize Details"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Service</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{service.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Resource</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{resource.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Date & Time</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {date} • {slots.length} Slots ({startTime.substring(0, 5)} - {endTime.substring(0, 5)})
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Total Amount (₹)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: s(10) }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Online Paid (₹)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={onlinePaid}
                  onChangeText={setOnlinePaid}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Venue Collected (₹)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={venueCollected}
                  onChangeText={setVenueCollected}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: vs(20) }]}>Customer Info</Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Remarks / Customer Details</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={4}
                placeholder="e.g. John Doe, +91 9876543210"
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity 
            style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: s(20),
    paddingBottom: vs(100),
  },
  summaryCard: {
    padding: s(16),
    borderRadius: ms(16),
    gap: vs(12),
    marginBottom: vs(24),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryItem: {
    gap: vs(2),
  },
  label: {
    fontSize: ms(11),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: ms(15),
    fontWeight: '700',
  },
  form: {
    gap: vs(16),
  },
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: '700',
  },
  inputGroup: {
    gap: vs(8),
  },
  inputLabel: {
    fontSize: ms(13),
    fontWeight: '600',
  },
  input: {
    height: vs(48),
    borderRadius: ms(12),
    borderWidth: 1,
    paddingHorizontal: s(16),
    fontSize: ms(14),
  },
  textArea: {
    height: vs(100),
    paddingTop: vs(12),
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    padding: s(20),
    borderTopWidth: 1,
    borderTopColor: '#00000005',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  confirmButton: {
    height: vs(50),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    padding: s(20),
    justifyContent: 'center',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: vs(20),
  },
  successTitle: {
    fontSize: ms(24),
    fontWeight: '800',
    marginTop: vs(15),
  },
  successSubtitle: {
    fontSize: ms(16),
    marginTop: vs(5),
  },
  divider: {
    height: 1,
    marginVertical: vs(10),
  },
});

export default ManualBookingConfirmScreen;
