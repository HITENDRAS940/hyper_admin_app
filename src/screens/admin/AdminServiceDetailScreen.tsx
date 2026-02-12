// filepath: /Users/hitendrasingh/Desktop/admin-app/src/screens/admin/AdminServiceDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI, serviceAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { s, vs, ms } from 'react-native-size-matters';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Shared Components
import RevenueCard from '../../components/shared/cards/RevenueCard';
import SlotGridCard from '../../components/shared/cards/SlotGridCard';
import BookingCard from '../../components/shared/cards/BookingCard';
import SlotsManagementModal from '../../components/shared/modals/SlotsManagementModal';
import AvailabilityModal from '../../components/shared/modals/AvailabilityModal';
import ManualBookingModal from '../../components/shared/modals/ManualBookingModal';
import DisableSlotByDateModal from '../../components/shared/modals/DisableSlotByDateModal';
import ArenaSettingsTab from '../../components/admin/ArenaSettingsTab';
import ScreenHeader from '../../components/shared/ScreenHeader';

// Utilities
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { calculateRevenueData } from '../../utils/revenueUtils';
import { mapSlotsWithBookingInfo } from '../../utils/slotUtils';

// Types
import { Service, SlotConfig } from '../../types';

interface ServiceSlot {
  id: number;
  slotId: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
  isDisabledDate?: boolean;
  disableReason?: string;
}

interface ServiceBooking {
  id: number;
  user: {
    name: string;
    phone: string;
  };
  reference: string;
  amount: number;
  status: string;
  serviceName: string;
  slotTime: string;
  slots: Array<{
    slotId: number;
    startTime: string;
    endTime: string;
    price: number;
  }>;
  bookingDate: string;
  createdAt: string;
}

interface RevenueData {
  totalRevenue: number;
  totalBookings: number;
  bookedSlots: number;
  availableSlots: number;
}

type ModalStep =
  | 'none'
  | 'slots'
  | 'availability'
  | 'manualBooking'
  | 'disableSlot';

const AdminServiceDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { service } = route.params;

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [slotsWithBookings, setSlotsWithBookings] = useState<ServiceSlot[]>([]);
  const [bookedSlotIds, setBookedSlotIds] = useState<number[]>([]);
  const [disabledSlotIds, setDisabledSlotIds] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<ModalStep>('none');
  const [activeTab, setActiveTab] = useState<'slots' | 'bookings' | 'profile'>(
    'slots',
  );
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  // Modal-specific state
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [currentServiceData, setCurrentServiceData] = useState(service);

  // Data Fetching
  useEffect(() => {
    if (activeTab === 'slots') {
      if (viewMode === 'daily') {
        fetchSlotData();
      } else {
        fetchWeeklyData();
      }
    } else {
      fetchBookingData();
    }
  }, [selectedDate, activeTab, viewMode]);

  const fetchWeeklyData = async () => {
    try {
      setLoadingWeekly(true);
      const start = selectedDate;
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
      });

      const data = await Promise.all(
        days.map(async (day) => {
          const dateStr = formatDateToYYYYMMDD(day);
          const res = await serviceAPI.getSlotStatus(service.id, dateStr);
          return {
            date: day,
            dateStr,
            ...res.data,
          };
        }),
      );

      setWeeklyData(data);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoadingWeekly(false);
    }
  };

  const fetchSlotData = async () => {
    try {
      setLoadingSlots(true);
      const dateStr = formatDateToYYYYMMDD(selectedDate);

      const slotStatusResponse = await serviceAPI.getSlotStatus(
        service.id,
        dateStr,
      );
      const { disabled: disabledSlotIds, booked: bookedSlotIds } =
        slotStatusResponse.data;

      const disabledIds = (disabledSlotIds || []).map((id: any) => Number(id));
      const bookedIds = (bookedSlotIds || []).map((id: any) => Number(id));

      setDisabledSlotIds(disabledIds);
      setBookedSlotIds(bookedIds);

      const baseSlots = currentServiceData.slots || service.slots || [];

      const slotsData: ServiceSlot[] = baseSlots.map((slot: any) => {
        const dbId = slot.id || slot.slotId;
        return {
          ...slot,
          slotId: dbId,
          enabled: slot.enabled !== false,
          isBooked: false,
        };
      });

      slotsData.sort((a, b) => {
        let timeA = a.startTime;
        let timeB = b.startTime;
        if (timeA.includes('T')) timeA = timeA.split('T')[1];
        if (timeB.includes('T')) timeB = timeB.split('T')[1];
        return timeA.localeCompare(timeB);
      });

      setSlotsWithBookings(slotsData);
    } catch (error: any) {
      console.error('Error fetching slot data:', error);
      Alert.alert('Error', 'Failed to fetch slot details');

      const rawSlotsData = mapSlotsWithBookingInfo(
        service.slots || [],
        new Set(),
      );
      setSlotsWithBookings(
        rawSlotsData.map((slot: any) => ({ ...slot, slotId: slot.id })),
      );
    } finally {
      setLoadingSlots(false);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBookingData = async () => {
    try {
      setLoadingBookings(true);
      const dateStr = formatDateToYYYYMMDD(selectedDate);

      const bookingsData = await adminAPI.getServiceBookings(
        service.id,
        dateStr,
      );

      let bookingsList: ServiceBooking[] = [];

      if (Array.isArray(bookingsData)) {
        bookingsList = bookingsData;
      } else if (bookingsData && Array.isArray(bookingsData.bookings)) {
        bookingsList = bookingsData.bookings;
      } else if (
        bookingsData &&
        bookingsData.data &&
        Array.isArray(bookingsData.data)
      ) {
        bookingsList = bookingsData.data;
      }

      const filteredBookings = bookingsList.filter((b: ServiceBooking) => {
        return b.bookingDate === dateStr;
      });

      setBookings(filteredBookings);

      const revenueData = calculateRevenueData();
      setRevenue(revenueData as any);
    } catch (error: any) {
      console.error('Error fetching booking data:', error);
      Alert.alert('Error', 'Failed to fetch bookings');
      setBookings([]);
      setRevenue(null);
    } finally {
      setLoadingBookings(false);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'slots') {
      fetchSlotData();
    } else {
      fetchBookingData();
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleManageSlots = async () => {
    await loadSlots();
    setCurrentStep('slots');
  };

  const handleManageAvailability = () => {
    setCurrentStep('availability');
  };

  const loadSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await adminAPI.getServiceSlots(service.id);
      const dbSlots = response.data;

      if (dbSlots && dbSlots.length > 0) {
        const mappedSlots = dbSlots.map((dbSlot: any, index: number) => ({
          slotId: dbSlot.id || dbSlot.slotId || index + 1,
          startTime: dbSlot.startTime,
          endTime: dbSlot.endTime,
          price: dbSlot.price,
          enabled: dbSlot.enabled === true,
        }));

        setSlots(mappedSlots);
      }
    } catch (error: any) {
      console.error('Error loading slots:', error);
      Alert.alert('Error', 'Failed to load slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDeleteService = () => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service?.name || 'this service'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteService(service.id);
              Alert.alert('Success', 'Service deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete service');
            }
          },
        },
      ],
    );
  };

  const handleManualBooking = () => {
    setCurrentStep('manualBooking');
  };

  const handleDisableSlot = () => {
    setCurrentStep('disableSlot');
  };

  const handleDisableSlotConfirm = async (slotId: number, reason: string) => {
    try {
      const dateStr = formatDateToYYYYMMDD(selectedDate);

      await adminAPI.disableSlotForDate({
        serviceId: service.id,
        slotId: slotId,
        date: dateStr,
        reason: reason,
      });

      Alert.alert('Success', 'Slot disabled successfully');
      if (activeTab === 'slots') fetchSlotData();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to disable slot',
      );
      throw error;
    }
  };

  const handleManualBookingConfirm = async (slotIds: number[]) => {
    try {
      const dateStr = formatDateToYYYYMMDD(selectedDate);

      await adminAPI.createManualBooking({
        serviceId: service.id,
        slotIds: slotIds,
        bookingDate: dateStr,
      });

      if (activeTab === 'slots') fetchSlotData();
      else if (activeTab === 'bookings') fetchBookingData();
    } catch (error: any) {
      throw error;
    }
  };

  const handleProfileSave = async (updatedData: Partial<Service>) => {
    try {
      setLoading(true);
      await adminAPI.updateServiceProfile(service.id, updatedData);
      setCurrentServiceData((prev: any) => ({ ...prev, ...updatedData }));
      Alert.alert('Success', 'Arena profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSlotsSave = async (updatedSlots: SlotConfig[]) => {
    try {
      for (const slot of updatedSlots) {
        const slotId = Number(slot.slotId);
        if (slot.price !== undefined) {
          await adminAPI.updateSlotPrice(service.id, slotId, slot.price);
        }

        if (slot.enabled) {
          await adminAPI.enableSlot(service.id, slotId);
        } else {
          await adminAPI.disableSlot(service.id, slotId);
        }
      }

      if (activeTab === 'slots') fetchSlotData();
      else fetchBookingData();
    } catch (error: any) {
      throw error;
    }
  };

  const handleAvailabilitySave = async (isAvailable: boolean) => {
    try {
      if (isAvailable) {
        await adminAPI.setServiceAvailable(service.id);
      } else {
        await adminAPI.setServiceNotAvailable(service.id);
      }

      if (activeTab === 'slots') fetchSlotData();
      else fetchBookingData();
    } catch (error: any) {
      throw error;
    }
  };

  const closeModal = () => {
    setCurrentStep('none');
  };

  const renderBookingsList = () => {
    if (bookings.length === 0) {
      return (
        <View style={styles.emptyBookings}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No bookings for this date
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.bookingsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Bookings ({bookings.length})
        </Text>

        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking as any} />
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper
      style={[styles.container, { backgroundColor: '#F9FAFB' }]}
    >
      <ScreenHeader
        title={service.name}
        subtitle={service.location}
        paddingTop={vs(10)}
        actions={[
          {
            icon: 'trash-outline',
            variant: 'outline',
            onPress: handleDeleteService,
          },
        ]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.actionButtonsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionButtonsRow}
          >
            {[
              { label: 'Slots', icon: 'time', action: handleManageSlots, color: theme.colors.primary },
              { label: 'Availability', icon: 'toggle', action: handleManageAvailability, color: theme.colors.primary },
              { label: 'Book', icon: 'add-circle', action: handleManualBooking, color: '#10B981' },
              { label: 'Disable', icon: 'ban', action: handleDisableSlot, color: '#F97316' },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.actionChip,
                  {
                    backgroundColor: item.color + '10',
                    borderColor: item.color + '20',
                  },
                ]}
                onPress={item.action}
              >
                <Ionicons name={item.icon as any} size={18} color={item.color} />
                <Text style={[styles.actionChipText, { color: item.color }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.viewModeToggle}>
          {['daily', 'weekly'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                viewMode === mode && styles.activeMode,
                viewMode === mode && { backgroundColor: theme.colors.card },
              ]}
              onPress={() => setViewMode(mode as any)}
            >
              <Text
                style={[
                  styles.modeText,
                  viewMode === mode && styles.activeModeText,
                  viewMode === mode && { color: theme.colors.primary },
                ]}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={[styles.dateSelector, { backgroundColor: theme.colors.card }]}
        >
          <TouchableOpacity
            onPress={() => changeDate(viewMode === 'daily' ? -1 : -7)}
            style={styles.dateButton}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.dateDisplay}>
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {viewMode === 'daily'
                ? format(selectedDate, 'EEE, MMM dd')
                : `${format(selectedDate, 'MMM dd')} - ${format(new Date(new Date(selectedDate).setDate(selectedDate.getDate() + 6)), 'MMM dd')}`}
            </Text>
            {viewMode === 'daily' &&
              formatDateToYYYYMMDD(selectedDate) ===
                formatDateToYYYYMMDD(new Date()) && (
                <View
                  style={[
                    styles.todayBadge,
                    { backgroundColor: theme.colors.primary + '10' },
                  ]}
                >
                  <Text
                    style={[styles.todayText, { color: theme.colors.primary }]}
                  >
                    Today
                  </Text>
                </View>
              )}
          </View>

          <TouchableOpacity
            onPress={() => changeDate(viewMode === 'daily' ? 1 : 7)}
            style={styles.dateButton}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <View
            style={[styles.tabSelector, { backgroundColor: '#F1F5F9' }]}
          >
            {['slots', 'bookings', 'profile'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setActiveTab(tab as any)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === tab ? '#FFF' : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.mainContent}>
          {activeTab === 'slots' ? (
            viewMode === 'daily' ? (
              loadingSlots ? (
                <View style={styles.center}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Loading slots...
                  </Text>
                </View>
              ) : (
                <View style={styles.cardContainer}>
                  {slotsWithBookings.length > 0 ? (
                    <SlotGridCard
                      slots={slotsWithBookings}
                      bookedSlotIds={bookedSlotIds}
                      disabledSlotIds={disabledSlotIds}
                    />
                  ) : (
                    <View style={styles.emptyBookings}>
                      <Text
                        style={[
                          styles.emptyText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        No slots configured
                      </Text>
                    </View>
                  )}
                </View>
              )
            ) : loadingWeekly ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Gathering weekly availability...
                </Text>
              </View>
            ) : (
              <View style={styles.weeklyContainer}>
                {weeklyData.map((day, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.weeklyDayCard,
                      { backgroundColor: theme.colors.card },
                    ]}
                    onPress={() => {
                      setSelectedDate(day.date);
                      setViewMode('daily');
                    }}
                  >
                    <View style={styles.weeklyDayHeader}>
                      <Text
                        style={[
                          styles.weeklyDayName,
                          { color: theme.colors.text },
                        ]}
                      >
                        {format(day.date, 'EEEE')}
                      </Text>
                      <Text
                        style={[
                          styles.weeklyDayDate,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {format(day.date, 'MMM dd')}
                      </Text>
                    </View>

                    <View style={styles.weeklyStats}>
                      <View style={styles.weeklyStatItem}>
                        <View
                          style={[
                            styles.statDot,
                            { backgroundColor: '#10B981' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statText,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Available:{' '}
                          {service.slots?.length -
                            (day.booked?.length || 0) -
                            (day.disabled?.length || 0)}
                        </Text>
                      </View>
                      <View style={styles.weeklyStatItem}>
                        <View
                          style={[
                            styles.statDot,
                            { backgroundColor: '#EF4444' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statText,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          Booked: {day.booked?.length || 0}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )
          ) : activeTab === 'bookings' ? (
            loadingBookings ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Loading bookings...
                </Text>
              </View>
            ) : (
              <>
                {revenue && (
                  <View style={styles.cardContainer}>
                    <RevenueCard
                      data={{
                        totalRevenue: revenue.totalRevenue,
                        totalBookings: revenue.totalBookings,
                        bookedSlots: revenue.bookedSlots,
                        availableSlots: revenue.availableSlots,
                      }}
                    />
                  </View>
                )}
                <View style={styles.cardContainer}>{renderBookingsList()}</View>
              </>
            )
          ) : (
            <ArenaSettingsTab
              service={currentServiceData}
              onSave={handleProfileSave}
              loading={loading}
            />
          )}
        </View>
      </ScrollView>

      <SlotsManagementModal
        visible={currentStep === 'slots'}
        onClose={closeModal}
        onSave={handleSlotsSave}
        slots={slots as any}
        loading={slotsLoading}
        onRefresh={() => loadSlots()}
        serviceName={service.name}
      />

      <AvailabilityModal
        visible={currentStep === 'availability'}
        onClose={closeModal}
        onSave={handleAvailabilitySave}
        currentAvailability={service.isAvailable || false}
        serviceName={service.name}
      />

      <ManualBookingModal
        visible={currentStep === 'manualBooking'}
        onClose={closeModal}
        onConfirm={handleManualBookingConfirm}
        slots={slotsWithBookings}
        serviceName={service.name}
        selectedDate={formatDateToYYYYMMDD(selectedDate)}
        bookedSlotIds={bookedSlotIds}
        disabledSlotIds={disabledSlotIds}
      />

      <DisableSlotByDateModal
        visible={currentStep === 'disableSlot'}
        onClose={closeModal}
        onConfirm={handleDisableSlotConfirm}
        slots={slotsWithBookings}
        selectedDate={selectedDate}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(40),
  },
  actionButtonsContainer: {
    paddingVertical: vs(16),
  },
  actionButtonsRow: {
    paddingHorizontal: s(16),
    gap: s(12),
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(10),
    paddingHorizontal: s(16),
    borderRadius: ms(12),
    borderWidth: 1,
    gap: s(8),
  },
  actionChipText: {
    fontSize: ms(13),
    fontWeight: '700',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    marginHorizontal: s(16),
    marginTop: vs(8),
    marginBottom: vs(16),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.04,
    shadowRadius: ms(8),
    elevation: 2,
  },
  dateButton: {
    width: s(32),
    height: s(32),
    borderRadius: ms(10),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(4),
  },
  dateText: {
    fontSize: ms(15),
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  todayBadge: {
    paddingHorizontal: s(8),
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  todayText: {
    fontSize: ms(10),
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  viewModeToggle: {
    flexDirection: 'row',
    marginHorizontal: s(16),
    marginTop: vs(8),
    backgroundColor: '#F1F5F9',
    borderRadius: ms(12),
    padding: s(4),
  },
  modeButton: {
    flex: 1,
    paddingVertical: vs(10),
    alignItems: 'center',
    borderRadius: ms(10),
  },
  activeMode: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#64748B',
  },
  activeModeText: {
    fontWeight: '800',
  },
  weeklyContainer: {
    gap: vs(12),
  },
  weeklyDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(16),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  weeklyDayHeader: {
    flex: 1,
  },
  weeklyDayName: {
    fontSize: ms(16),
    fontWeight: '800',
  },
  weeklyDayDate: {
    fontSize: ms(12),
    marginTop: vs(2),
    fontWeight: '600',
  },
  weeklyStats: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: s(8),
  },
  weeklyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
  },
  statDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
  },
  statText: {
    fontSize: ms(11),
    fontWeight: '600',
  },
  mainContent: {
    paddingHorizontal: s(20),
  },
  cardContainer: {
    marginBottom: vs(16),
  },
  bookingsContainer: {
    marginBottom: vs(20),
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: vs(16),
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: vs(40),
  },
  emptyText: {
    fontSize: ms(14),
    marginTop: vs(12),
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(40),
  },
  loadingText: {
    marginTop: vs(12),
    fontSize: ms(14),
    fontWeight: '600',
  },
  tabContainer: {
    paddingHorizontal: s(16),
    marginBottom: vs(24),
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: ms(14),
    padding: ms(4),
  },
  tabButton: {
    flex: 1,
    paddingVertical: vs(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(12),
  },
  tabText: {
    fontSize: ms(14),
    fontWeight: '700',
  },
});

export default AdminServiceDetailScreen;
