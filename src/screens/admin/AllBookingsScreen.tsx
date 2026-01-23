import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolate,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { s, vs, ms } from 'react-native-size-matters';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { AdminBooking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import EmptyState from '../../components/shared/EmptyState';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BookingCard from '../../components/shared/cards/BookingCard';

const AllBookingsScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate 15 days for selection (7 past, today, 7 future)
  const dates = useMemo(() => Array.from({ length: 15 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 7 + i);
    return d;
  }), []);

  const filters = useMemo(() => [
    { key: 'ALL', label: 'All', count: bookings.length },
    { key: 'CONFIRMED', label: 'Confirmed', count: bookings.filter(b => b.status.toUpperCase() === 'CONFIRMED').length },
    { key: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status.toUpperCase() === 'PENDING').length },
    { key: 'CANCELLED', label: 'Cancelled', count: bookings.filter(b => b.status.toUpperCase() === 'CANCELLED').length },
    { key: 'COMPLETED', label: 'Completed', count: bookings.filter(b => b.status.toUpperCase() === 'COMPLETED').length },
  ], [bookings]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      // Always fetch with status if not 'ALL' to ensure fresh data from server
      const status = selectedFilter === 'ALL' ? undefined : selectedFilter;
      const response = await adminAPI.getAdminBookings(0, 100, dateStr, status);
      setBookings(response.content || []);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate, selectedFilter]);

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, selectedFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => selectedFilter === 'ALL' 
    ? bookings 
    : bookings.filter(booking => booking.status.toUpperCase() === selectedFilter.toUpperCase()),
    [bookings, selectedFilter]
  );

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const subHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 120],
      [0, -120],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
      height: interpolate(scrollY.value, [0, 120], [120, 0], Extrapolate.CLAMP),
      marginBottom: interpolate(scrollY.value, [0, 120], [vs(10), 0], Extrapolate.CLAMP),
    };
  });


  const handleCheckIn = useCallback(async (booking: AdminBooking) => {
    try {
      await adminAPI.completeBooking(booking.id);
      Alert.alert('Success', 'Customer checked in successfully');
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete booking');
    }
  }, [fetchBookings]);

  const handleNoShow = useCallback(async (booking: AdminBooking) => {
    try {
      await adminAPI.updateAttendanceStatus(booking.id, 'NO_SHOW');
      Alert.alert('Success', 'Marked as No Show');
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to update attendance');
    }
  }, [fetchBookings]);

  const [cancellingBooking, setCancellingBooking] = useState<AdminBooking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const cancellationReasons = [
    'User Requested',
    'Venue Maintenance',
    'Weather Conditions',
    'Double Booking',
    'Technical Error',
    'Other'
  ];

  const handleCancelBooking = useCallback((booking: AdminBooking) => {
    setCancellingBooking(booking);
    setCancellationReason('');
  }, []);

  const confirmCancellation = async () => {
    if (!cancellingBooking) return;
    if (!cancellationReason) {
      Alert.alert('Reason Required', 'Please select or enter a reason for cancellation');
      return;
    }

    try {
      setIsCancelling(true);
      await adminAPI.updateBookingStatus(cancellingBooking.id, 'CANCELLED', cancellationReason);
      Alert.alert('Success', 'Booking cancelled');
      setCancellingBooking(null);
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReschedule = useCallback((booking: AdminBooking) => {
    Alert.alert('Reschedule', 'Rescheduling flow will be integrated with the calendar soon.');
  }, []);

  const renderFilterButton = useCallback((filter: any) => {
    const isSelected = selectedFilter === filter.key;
    return (
      <TouchableOpacity
        key={filter.key}
        style={[
          styles.filterButton,
          { 
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          }
        ]}
        onPress={() => setSelectedFilter(filter.key)}
      >
        <Text style={[
          styles.filterText,
          { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary }
        ]}>
          {filter.label} ({filter.count})
        </Text>
      </TouchableOpacity>
    );
  }, [selectedFilter, theme.colors]);

  const renderDateItem = useCallback((date: Date) => {
    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    
    return (
      <TouchableOpacity
        key={date.toISOString()}
        onPress={() => setSelectedDate(date)}
        style={[
          styles.dateItem,
          isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
        ]}
      >
        <Text style={[styles.dayText, { color: isSelected ? '#FFF' : theme.colors.textSecondary }]}>
          {format(date, 'EEE')}
        </Text>
        <Text style={[styles.dateNumber, { color: isSelected ? '#FFF' : theme.colors.text }]}>
          {format(date, 'd')}
        </Text>
        {isToday && !isSelected && <View style={[styles.todayIndicator, { backgroundColor: theme.colors.primary }]} />}
      </TouchableOpacity>
    );
  }, [selectedDate, theme.colors]);

  const renderBookingItem = useCallback(({ item }: { item: AdminBooking }) => (
    <BookingCard 
      booking={item}
      onCheckIn={handleCheckIn}
      onNoShow={handleNoShow}
      onCancel={handleCancelBooking}
      onReschedule={handleReschedule}
    />
  ), [handleCheckIn, handleNoShow, handleCancelBooking, handleReschedule]);



  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: '#F9FAFB' }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      {/* Clean Header */}
      <View style={[styles.cleanHeader, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Live Bookings</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('BookingHistory')}
            style={styles.iconCircle}
          >
            <Ionicons name="time-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Animated Collapsible Sub-Header */}
      <Animated.View style={[subHeaderStyle, { zIndex: 1, backgroundColor: '#F9FAFB', overflow: 'hidden' }]}>
        {/* Date Selector */}
        <View style={styles.dateSelectorWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dates}
            renderItem={({ item }) => renderDateItem(item)}
            keyExtractor={(item) => item.toISOString()}
            contentContainerStyle={styles.dateList}
            initialScrollIndex={7}
            getItemLayout={(data, index) => ({
              length: s(62), // width (50) + gap (12)
              offset: s(62) * index,
              index,
            })}
          />
        </View>

        <View style={styles.filtersWrapper}>
          <FlatList
            horizontal
            data={filters}
            renderItem={({ item }) => renderFilterButton(item)}
            keyExtractor={item => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          />
        </View>
      </Animated.View>

      <View style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View style={styles.listLoadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : filteredBookings.length === 0 ? (
          <EmptyState 
            icon="calendar-outline"
            title="No Bookings Found"
            description={`No ${selectedFilter.toLowerCase()} bookings available.`}
          />
        ) : (
          <Animated.FlatList
            data={filteredBookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>
      {/* Cancellation Modal */}
      <Modal
        visible={!!cancellingBooking}
        transparent
        animationType="fade"
        onRequestClose={() => setCancellingBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Cancel Booking</Text>
              <TouchableOpacity onPress={() => setCancellingBooking(null)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              Select a reason for cancelling #{cancellingBooking?.reference}
            </Text>

            <View style={styles.reasonsContainer}>
              {cancellationReasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonItem,
                    { 
                      backgroundColor: cancellationReason === reason ? theme.colors.primary + '10' : 'transparent',
                      borderWidth: cancellationReason === reason ? 2 : 1,
                      borderColor: cancellationReason === reason ? theme.colors.primary : theme.colors.border + '50'
                    }
                  ]}
                  onPress={() => setCancellationReason(reason)}
                >
                  <Text style={[
                    styles.reasonText, 
                    { color: cancellationReason === reason ? theme.colors.primary : theme.colors.text }
                  ]}>
                    {reason}
                  </Text>
                  {cancellationReason === reason && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: theme.colors.error, opacity: isCancelling ? 0.7 : 1 }
              ]}
              onPress={confirmCancellation}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Cancellation</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cleanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(24),
    paddingBottom: vs(20),
    backgroundColor: '#F9FAFB',
  },
  headerTitle: {
    fontSize: ms(28),
    fontWeight: '800',
    letterSpacing: -1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
  },
  iconCircle: {
    width: s(40),
    height: s(40),
    borderRadius: s(20),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateSelectorWrapper: {
    paddingVertical: vs(12),
    backgroundColor: '#F9FAFB',
  },
  dateList: {
    paddingHorizontal: s(24),
    gap: s(12),
  },
  dateItem: {
    width: s(50),
    height: vs(65),
    borderRadius: ms(16),
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: vs(4),
  },
  dayText: {
    fontSize: ms(11),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateNumber: {
    fontSize: ms(16),
    fontWeight: '800',
  },
  todayIndicator: {
    width: s(4),
    height: s(4),
    borderRadius: s(2),
    position: 'absolute',
    bottom: vs(8),
  },
  filtersWrapper: {
    marginTop: vs(4),
    marginBottom: vs(8),
  },
  filtersContainer: {
    paddingHorizontal: s(16),
    gap: ms(8),
    paddingBottom: vs(8),
  },
  filterButton: {
    paddingHorizontal: s(16),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: 1,
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.1,
    shadowRadius: ms(4),
    elevation: 2,
  },
  filterText: {
    fontSize: ms(14),
    fontWeight: '600',
  },
  listLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(100),
  },
  list: {
    padding: ms(16),
    paddingBottom: vs(100),
  },
  bookingCard: {
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: vs(16),
    borderWidth: 1,
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.1,
    shadowRadius: ms(8),
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(16),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  turfInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  turfName: {
    fontSize: ms(18),
    fontWeight: '700',
    marginBottom: vs(6),
  },
  cardContent: {
    gap: ms(12),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
  },
  iconContainer: {
    width: s(32),
    height: s(32),
    borderRadius: s(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: ms(15),
    flex: 1,
    fontWeight: '500',
  },
  priceText: {
    fontSize: ms(18),
    fontWeight: '700',
  },
  infoSubText: {
    fontSize: ms(12),
    flex: 1,
  },
  referenceText: {
    fontSize: ms(12),
    fontWeight: '600',
    marginTop: vs(4),
    opacity: 0.7,
  },
  slotsContainer: {
    marginTop: vs(8),
    padding: ms(12),
    borderRadius: ms(12),
  },
  slotsHeader: {
    fontSize: ms(13),
    fontWeight: '600',
    marginBottom: vs(8),
  },
  slotDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(4),
  },
  slotText: {
    fontSize: ms(14),
    flex: 1,
  },
  slotPrice: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginTop: vs(4),
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(24),
  },
  modalContent: {
    width: '100%',
    borderRadius: ms(24),
    padding: ms(24),
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  modalTitle: {
    fontSize: ms(20),
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: ms(14),
    marginBottom: vs(20),
  },
  historyBtn: {
    padding: ms(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: ms(12),
  },
  reasonsContainer: {
    gap: ms(10),
    marginBottom: vs(24),
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ms(14),
    borderRadius: ms(12),
  },
  reasonText: {
    fontSize: ms(15),
    fontWeight: '600',
  },
  confirmButton: {
    height: vs(56),
    borderRadius: ms(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: '700',
  },
});

export default AllBookingsScreen;
