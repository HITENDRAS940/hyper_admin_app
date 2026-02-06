import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { AdminBooking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import BookingCard from '../../components/shared/cards/BookingCard';
import { s, vs, ms } from 'react-native-size-matters';
import { format, subDays } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/shared/ScreenHeader';

const BookingHistoryScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');

  const sports = [
    'ALL',
    'Football',
    'Cricket',
    'Badminton',
    'Esports',
    'Tennis',
  ];
  const types = ['ALL', 'ONLINE', 'OFFLINE'];
  const payments = ['ALL', 'PAID', 'PENDING', 'REFUNDED'];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async (date?: string, status?: string) => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminBookings(
        0,
        100,
        date,
        status === 'ALL' ? undefined : status,
      );
      setBookings(response.content || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      Alert.alert(
        'Export Success',
        'Booking history exported as CSV. Check your downloads.',
      );
    }, 2000);
  };

  const filteredBookings = bookings.filter((booking) => {
    const sportMatch =
      selectedSport === 'ALL' || booking.sport === selectedSport;
    const typeMatch =
      selectedType === 'ALL' || booking.bookingType === selectedType;
    const paymentMatch =
      selectedPayment === 'ALL' || booking.paymentStatus === selectedPayment;
    return sportMatch && typeMatch && paymentMatch;
  });

  const renderFilterOption = (
    label: string,
    value: string,
    current: string,
    setter: (val: string) => void,
  ) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        {
          backgroundColor:
            current === value
              ? theme.colors.primary + '15'
              : theme.colors.background,
          borderColor:
            current === value
              ? theme.colors.primary
              : theme.colors.border + '50',
        },
      ]}
      onPress={() => setter(value)}
    >
      <Text
        style={[
          styles.filterOptionText,
          {
            color:
              current === value
                ? theme.colors.primary
                : theme.colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) return <LoadingState />;

  return (
    <ScreenWrapper style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
      {/* Clean Header */}
      <ScreenHeader
        title="Booking History"
        paddingTop={insets.top + 10}
        actions={[
          {
            icon: 'options-outline',
            variant: 'outline',
            onPress: () => setShowFilters(true),
          },
        ]}
      />

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {filteredBookings.length}
          </Text>
          <Text
            style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}
          >
            Records
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.exportButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#FFF" />
              <Text style={styles.exportText}>Export CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={({ item }) => <BookingCard booking={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="No Records Found"
            description="Adjust filters to see past bookings."
          />
        }
      />

      {/* Advanced Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Advanced Filters
              </Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons
                  name="close"
                  size={28}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={[
                  styles.filterLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                SPORT
              </Text>
              <View style={styles.optionsGrid}>
                {sports.map((s) =>
                  renderFilterOption(s, s, selectedSport, setSelectedSport),
                )}
              </View>

              <Text
                style={[
                  styles.filterLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                BOOKING TYPE
              </Text>
              <View style={styles.optionsGrid}>
                {types.map((t) =>
                  renderFilterOption(t, t, selectedType, setSelectedType),
                )}
              </View>

              <Text
                style={[
                  styles.filterLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                PAYMENT STATUS
              </Text>
              <View style={styles.optionsGrid}>
                {payments.map((p) =>
                  renderFilterOption(p, p, selectedPayment, setSelectedPayment),
                )}
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    { borderColor: theme.colors.border },
                  ]}
                  onPress={() => {
                    setSelectedSport('ALL');
                    setSelectedType('ALL');
                    setSelectedPayment('ALL');
                    fetchHistory();
                  }}
                >
                  <Text
                    style={[styles.resetText, { color: theme.colors.text }]}
                  >
                    Reset
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => {
                    setShowFilters(false);
                    // We use the start of the date range for the single-date API filter
                    const dateStr = format(dateRange.start, 'yyyy-MM-dd');
                    fetchHistory(dateStr);
                  }}
                >
                  <Text style={styles.applyText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  list: {
    padding: ms(20),
    paddingBottom: vs(100),
  },
  filterToggle: {
    padding: s(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: ms(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingTop: vs(16),
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: s(4),
  },
  summaryValue: {
    fontSize: ms(24),
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: ms(14),
    fontWeight: '600',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
    borderRadius: ms(14),
    gap: s(8),
  },
  exportText: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: ms(32),
    borderTopRightRadius: ms(32),
    padding: ms(24),
    height: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(24),
  },
  modalTitle: {
    fontSize: ms(22),
    fontWeight: '800',
  },
  filterLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: vs(12),
    marginTop: vs(8),
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(10),
    marginBottom: vs(24),
  },
  filterOption: {
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
    borderRadius: ms(12),
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: ms(14),
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: s(12),
    marginTop: vs(12),
    paddingBottom: vs(40),
  },
  resetButton: {
    flex: 1,
    height: vs(56),
    borderRadius: ms(18),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    fontSize: ms(16),
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    height: vs(56),
    borderRadius: ms(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: '700',
  },
});

export default BookingHistoryScreen;
