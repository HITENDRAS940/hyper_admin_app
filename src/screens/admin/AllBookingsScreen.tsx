import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { s, vs, ms } from 'react-native-size-matters';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { AdminBooking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useScroll } from '../../contexts/ScrollContext';
import { withTiming } from 'react-native-reanimated';
import EmptyState from '../../components/shared/EmptyState';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BookingCard from '../../components/shared/cards/BookingCard';
import { screenHeaderStyles } from '../../components/shared/ScreenHeader';
import Skeleton from '../../components/shared/Skeleton';

// Constants moved outside component for better performance
const CANCELLATION_REASONS = [
  'User Requested',
  'Venue Maintenance',
  'Weather Conditions',
  'Double Booking',
  'Technical Error',
  'Other',
];

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
  const dates = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 7 + i);
        return d;
      }),
    [],
  );

  const filters = useMemo(() => {
    // Single-pass filtering for better performance
    const counts = {
      CONFIRMED: 0,
      PENDING: 0,
      CANCELLED: 0,
      COMPLETED: 0,
    };

    bookings.forEach((b) => {
      const status = b.status.toUpperCase();
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });

    return [
      { key: 'ALL', label: 'All', count: bookings.length },
      { key: 'CONFIRMED', label: 'Confirmed', count: counts.CONFIRMED },
      { key: 'PENDING', label: 'Pending', count: counts.PENDING },
      { key: 'CANCELLED', label: 'Cancelled', count: counts.CANCELLED },
      { key: 'COMPLETED', label: 'Completed', count: counts.COMPLETED },
    ];
  }, [bookings]);

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

  const filteredBookings = useMemo(
    () =>
      selectedFilter === 'ALL'
        ? bookings
        : bookings.filter(
            (booking) =>
              booking.status.toUpperCase() === selectedFilter.toUpperCase(),
          ),
    [bookings, selectedFilter],
  );

  const SCALED_SUBHEADER_MARGIN = vs(10);
  const MAX_SUBHEADER_HEIGHT = vs(150);
  const HEADER_BASE_HEIGHT = vs(70) + insets.top;

  // Advanced Scroll: diffClamp for "Peek" behavior
  const scrollY = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  const { tabBarTranslateY } = useScroll();
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentScrollY = event.contentOffset.y;
      const diff = currentScrollY - lastScrollY.value;

      // Update translateY based on scroll direction (Smart Header)
      translateY.value = Math.min(
        0,
        Math.max(-MAX_SUBHEADER_HEIGHT, translateY.value - diff),
      );

      // Tab Bar Sliding logic
      if (currentScrollY > 100) {
        if (diff > 5 && tabBarTranslateY.value === 0) {
          tabBarTranslateY.value = withTiming(120, { duration: 300 });
        } else if (diff < -5 && tabBarTranslateY.value > 0) {
          tabBarTranslateY.value = withTiming(0, { duration: 300 });
        }
      } else if (currentScrollY <= 0) {
        tabBarTranslateY.value = withTiming(0, { duration: 300 });
      }

      // Reset to 0 if at very top (bounces/overscroll)
      if (currentScrollY <= 0) {
        translateY.value = 0;
      }

      scrollY.value = currentScrollY;
      lastScrollY.value = currentScrollY;
    },
  });

  const vs5 = vs(5);
  const vs20 = vs(20);
  const vs30 = vs(30);
  const vs40 = vs(40);

  const headerStyle = useAnimatedStyle(() => {
    // Show shadow on main header ONLY when sub-header is tucked away
    const shadowOpacity = interpolate(
      translateY.value,
      [-MAX_SUBHEADER_HEIGHT, -MAX_SUBHEADER_HEIGHT + vs20],
      [0.08, 0],
      Extrapolate.CLAMP,
    );
    return {
      shadowOpacity,
      elevation: translateY.value <= -MAX_SUBHEADER_HEIGHT + vs5 ? 4 : 0,
      zIndex: 10,
    };
  });

  const subHeaderStyle = useAnimatedStyle(() => {
    // Show shadow on sub-header when it's visible
    const shadowOpacity = interpolate(
      translateY.value,
      [-MAX_SUBHEADER_HEIGHT + vs20, -MAX_SUBHEADER_HEIGHT + vs40],
      [0, 0.08],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(
        translateY.value,
        [-MAX_SUBHEADER_HEIGHT, -MAX_SUBHEADER_HEIGHT + vs30],
        [0, 1],
        Extrapolate.CLAMP,
      ),
      position: 'absolute',
      top: HEADER_BASE_HEIGHT,
      left: 0,
      right: 0,
      zIndex: 5,
      // Add shadow properties to sub-header
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      shadowOpacity,
      elevation: translateY.value > -MAX_SUBHEADER_HEIGHT + vs20 ? 3 : 0,
    };
  });

  const handleCheckIn = useCallback(
    async (booking: AdminBooking) => {
      try {
        await adminAPI.completeBooking(booking.id);
        Alert.alert('Success', 'Customer checked in successfully');
        fetchBookings();
      } catch (error) {
        Alert.alert('Error', 'Failed to complete booking');
      }
    },
    [fetchBookings],
  );

  const handleNoShow = useCallback(
    async (booking: AdminBooking) => {
      try {
        await adminAPI.updateAttendanceStatus(booking.id, 'NO_SHOW');
        Alert.alert('Success', 'Marked as No Show');
        fetchBookings();
      } catch (error) {
        Alert.alert('Error', 'Failed to update attendance');
      }
    },
    [fetchBookings],
  );

  const [cancellingBooking, setCancellingBooking] =
    useState<AdminBooking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelBooking = useCallback((booking: AdminBooking) => {
    setCancellingBooking(booking);
    setCancellationReason('');
  }, []);

  const confirmCancellation = async () => {
    if (!cancellingBooking) return;
    if (!cancellationReason) {
      Alert.alert(
        'Reason Required',
        'Please select or enter a reason for cancellation',
      );
      return;
    }

    try {
      setIsCancelling(true);
      await adminAPI.updateBookingStatus(
        cancellingBooking.id,
        'CANCELLED',
        cancellationReason,
      );
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
    Alert.alert(
      'Reschedule',
      'Rescheduling flow will be integrated with the calendar soon.',
    );
  }, []);

  const renderFilterButton = useCallback(
    (filter: any) => {
      const isSelected = selectedFilter === filter.key;
      return (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            {
              backgroundColor: isSelected
                ? theme.colors.primary
                : theme.colors.card,
              borderColor: isSelected
                ? theme.colors.primary
                : theme.colors.border,
            },
          ]}
          onPress={() => setSelectedFilter(filter.key)}
        >
          <Text
            style={[
              styles.filterText,
              { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary },
            ]}
          >
            {filter.label} ({filter.count})
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedFilter, theme.colors],
  );

  const renderDateItem = useCallback(
    (date: Date) => {
      const isSelected =
        format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
      const isToday =
        format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

      return (
        <TouchableOpacity
          key={date.toISOString()}
          onPress={() => setSelectedDate(date)}
          style={[
            styles.dateItem,
            isSelected && {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color: isSelected ? '#FFF' : theme.colors.textSecondary },
            ]}
          >
            {format(date, 'EEE')}
          </Text>
          <Text
            style={[
              styles.dateNumber,
              { color: isSelected ? '#FFF' : theme.colors.text },
            ]}
          >
            {format(date, 'd')}
          </Text>
          {isToday && !isSelected && (
            <View
              style={[
                styles.todayIndicator,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}
        </TouchableOpacity>
      );
    },
    [selectedDate, theme.colors],
  );

  const renderBookingItem = useCallback(
    ({ item }: { item: AdminBooking }) => (
      <BookingCard
        booking={item}
        onCheckIn={handleCheckIn}
        onNoShow={handleNoShow}
        onCancel={handleCancelBooking}
        onReschedule={handleReschedule}
      />
    ),
    [handleCheckIn, handleNoShow, handleCancelBooking, handleReschedule],
  );

  return (
    <ScreenWrapper
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right']}
    >
      {/* Clean Sticky Header */}
      <Animated.View
        style={[
          screenHeaderStyles.header,
          headerStyle,
          {
            height: HEADER_BASE_HEIGHT,
            paddingTop: insets.top,
            paddingBottom: 0,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Text style={[screenHeaderStyles.title, { color: theme.colors.text }]}>
          Live Bookings
        </Text>
        <View style={screenHeaderStyles.actions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('BookingHistory')}
            activeOpacity={0.7}
            style={styles.iconCircle}
          >
            <Animated.View>
              <Ionicons
                name="time-outline"
                size={22}
                color={theme.colors.text}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Animated Collapsible Sub-Header (Absolute) */}
      <Animated.View
        style={[
          subHeaderStyle,
          { backgroundColor: theme.colors.background, overflow: 'hidden' },
        ]}
      >
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
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          />
        </View>
      </Animated.View>

      <View style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View
            style={[
              styles.list,
              { paddingTop: MAX_SUBHEADER_HEIGHT + vs(10) },
            ]}
          >
            <View style={{ gap: vs(16) }}>
              <Skeleton height={vs(150)} width="100%" borderRadius={ms(16)} />
              <Skeleton height={vs(150)} width="100%" borderRadius={ms(16)} />
              <Skeleton height={vs(150)} width="100%" borderRadius={ms(16)} />
            </View>
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
            contentContainerStyle={[
              styles.list,
              { paddingTop: MAX_SUBHEADER_HEIGHT + vs(10) },
            ]}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                progressViewOffset={MAX_SUBHEADER_HEIGHT + vs(10)}
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
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Cancel Booking
              </Text>
              <TouchableOpacity onPress={() => setCancellingBooking(null)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.modalSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Select a reason for cancelling #{cancellingBooking?.reference}
            </Text>

            <View style={styles.reasonsContainer}>
              {CANCELLATION_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor:
                        cancellationReason === reason
                          ? theme.colors.primary + '10'
                          : 'transparent',
                      borderWidth: cancellationReason === reason ? 2 : 1,
                      borderColor:
                        cancellationReason === reason
                          ? theme.colors.primary
                          : theme.colors.border + '50',
                    },
                  ]}
                  onPress={() => setCancellationReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      {
                        color:
                          cancellationReason === reason
                            ? theme.colors.primary
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {reason}
                  </Text>
                  {cancellationReason === reason && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  backgroundColor: theme.colors.error,
                  opacity: isCancelling ? 0.7 : 1,
                },
              ]}
              onPress={confirmCancellation}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Text style={styles.confirmButtonText}>Cancelling...</Text>
              ) : (
                <Text style={styles.confirmButtonText}>
                  Confirm Cancellation
                </Text>
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
  iconCircle: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateSelectorWrapper: {
    paddingVertical: vs(8),
    backgroundColor: '#F8F9FA',
  },
  dateList: {
    paddingHorizontal: s(24),
    gap: s(12),
  },
  dateItem: {
    width: s(52),
    height: vs(68),
    borderRadius: ms(18),
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: vs(2),
  },
  dayText: {
    fontSize: ms(10),
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  dateNumber: {
    fontSize: ms(18),
    fontWeight: '800',
  },
  todayIndicator: {
    width: s(4),
    height: s(4),
    borderRadius: s(2),
    marginTop: vs(2),
  },
  filtersWrapper: {
    marginTop: vs(4),
    marginBottom: vs(4),
  },
  filtersContainer: {
    paddingHorizontal: s(20),
    gap: ms(10),
    paddingBottom: vs(12),
  },
  filterButton: {
    paddingHorizontal: s(18),
    paddingVertical: vs(10),
    borderRadius: ms(24),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: ms(13),
    fontWeight: '700',
  },
  listLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
