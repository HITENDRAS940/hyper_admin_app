import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import StatCard from '../../components/shared/cards/StatCard';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { adminAPI } from '../../services/api';
import QRScannerModal from '../../components/admin/QRScannerModal';
import BookingDetailsModal from '../../components/admin/BookingDetailsModal';
import { ActivityIndicator, Alert } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTabScroll } from '../../hooks/useTabScroll';
import Skeleton from '../../components/shared/Skeleton';

const { width } = Dimensions.get('window');

const PerformanceSection = ({ theme }: { theme: any }) => {
  const peakHours = [
    { hour: '6am', value: 80 },
    { hour: '9am', value: 45 },
    { hour: '12pm', value: 30 },
    { hour: '3pm', value: 55 },
    { hour: '6pm', value: 90 },
    { hour: '9pm', value: 75 },
    { hour: '12am', value: 15 },
  ];

  return (
    <View style={styles.performanceContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Performance
        </Text>
      </View>

      <View style={styles.performanceRow}>
        {/* Occupancy Rate */}
        <View
          style={[styles.occupancyCard, { backgroundColor: theme.colors.card }]}
        >
          <Text
            style={[styles.perfLabel, { color: theme.colors.textSecondary }]}
          >
            Occupancy Rate
          </Text>
          <View style={styles.occupancyContent}>
            <View style={styles.occupancyCircle}>
              <Text
                style={[styles.occupancyValue, { color: theme.colors.primary }]}
              >
                78%
              </Text>
              <Text
                style={[
                  styles.occupancySub,
                  { color: theme.colors.textSecondary },
                ]}
              >
                today
              </Text>
            </View>
            <View style={styles.occupancyInfo}>
              <View style={styles.perfStat}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
                <Text
                  style={[styles.perfStatText, { color: theme.colors.text }]}
                >
                  84 Slots Booked
                </Text>
              </View>
              <View style={styles.perfStat}>
                <View
                  style={[styles.dot, { backgroundColor: theme.colors.border }]}
                />
                <Text
                  style={[styles.perfStatText, { color: theme.colors.text }]}
                >
                  24 Slots Free
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Peak Hours Chart */}
        <View
          style={[styles.chartCard, { backgroundColor: theme.colors.card }]}
        >
          <Text
            style={[styles.perfLabel, { color: theme.colors.textSecondary }]}
          >
            Peak Hours
          </Text>
          <View style={styles.chartContainer}>
            {peakHours.map((item, index) => (
              <View key={index} style={styles.chartBarWrapper}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${item.value}%`,
                      backgroundColor:
                        item.value > 80
                          ? theme.colors.error
                          : theme.colors.primary,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.chartLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.hour}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.performanceRow}>
        {/* Top Sports */}
        <View
          style={[styles.topListCard, { backgroundColor: theme.colors.card }]}
        >
          <Text
            style={[styles.perfLabel, { color: theme.colors.textSecondary }]}
          >
            Top 3 Sports
          </Text>
          <View style={styles.listContainer}>
            {['Football', 'Cricket', 'Tennis'].map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View
                  style={[
                    styles.listIcon,
                    { backgroundColor: theme.colors.primary + '15' },
                  ]}
                >
                  <Text
                    style={[styles.listRank, { color: theme.colors.primary }]}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text
                  style={[styles.listItemText, { color: theme.colors.text }]}
                >
                  {item}
                </Text>
                <Text
                  style={[
                    styles.listItemValue,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {40 - i * 10}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Venues */}
        <View
          style={[styles.topListCard, { backgroundColor: theme.colors.card }]}
        >
          <Text
            style={[styles.perfLabel, { color: theme.colors.textSecondary }]}
          >
            Top 3 Venues
          </Text>
          <View style={styles.listContainer}>
            {['Arena Prime', 'Sunset Turf', 'City Courts'].map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View
                  style={[
                    styles.listIcon,
                    { backgroundColor: theme.colors.secondary + '15' },
                  ]}
                >
                  <Text
                    style={[styles.listRank, { color: theme.colors.secondary }]}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text
                  style={[styles.listItemText, { color: theme.colors.text }]}
                >
                  {item}
                </Text>
                <Text
                  style={[
                    styles.listItemValue,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  ₹{15 - i * 3}k
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const ActivityFeed = ({ theme }: { theme: any }) => {
  const activities = [
    {
      id: 1,
      type: 'BOOKING',
      title: 'New booking placed',
      desc: 'Arena Prime • 6:00 PM',
      time: '2m ago',
      icon: 'cart-outline',
      color: '#4F46E5',
    },
    {
      id: 2,
      type: 'OFFLINE',
      title: 'Offline booking added',
      desc: 'Sunset Turf • 8:30 PM',
      time: '15m ago',
      icon: 'person-add-outline',
      color: '#10B981',
    },
    {
      id: 3,
      type: 'BLOCK',
      title: 'Slot blocked',
      desc: 'City Courts • Multi-slot',
      time: '1h ago',
      icon: 'ban-outline',
      color: '#F59E0B',
    },
    {
      id: 4,
      type: 'UPDATE',
      title: 'Venue profile updated',
      desc: 'Arena Prime • Price change',
      time: '3h ago',
      icon: 'create-outline',
      color: '#EC4899',
    },
  ];

  return (
    <View style={styles.activitySection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Activity Feed
        </Text>
        <TouchableOpacity>
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.activityList}>
        {activities.map((item) => (
          <View
            key={item.id}
            style={[
              styles.activityItem,
              { borderBottomColor: theme.colors.border + '50' },
            ]}
          >
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: item.color + '15' },
              ]}
            >
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View style={styles.activityContent}>
              <Text
                style={[styles.activityTitle, { color: theme.colors.text }]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.activityDesc,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {item.desc}
              </Text>
            </View>
            <Text
              style={[
                styles.activityTime,
                { color: theme.colors.textSecondary },
              ]}
            >
              {item.time}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const DashboardScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const scrollHandler = useTabScroll();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Weekly');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [scannedBooking, setScannedBooking] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await adminAPI.getAnalyticsSummary();
      setData(res);
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleScan = async (data: string) => {
    setScannerVisible(false);
    setIsScanning(true);
    try {
      // Assuming the QR code value IS the reference
      const booking = await adminAPI.getBookingByReference(data);
      setScannedBooking(booking);
      setDetailsVisible(true);
    } catch (error: any) {
      console.error('Error fetching booking by reference:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not find booking with this reference.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const timeToggles = ['Monthly', 'Weekly', 'Today'];

  const todayBooking = data?.todayBooking || { online: 0, offline: 0 };
  const monthlyBooking = data?.monthlyBooking || { online: 0, offline: 0 };
  const todayRevenue = data?.todayRevenue || { online: 0, offline: 0 };
  const monthlyRevenue = data?.monthlyRevenue || { online: 0, offline: 0 };

  const isDataLoading = loading && !refreshing;

  return (
    <ScreenWrapper
      style={[styles.container, { backgroundColor: '#F9FAFB' }]}
    >
      {/* Refined Header */}
      <ScreenHeader 
        title="Dashboard" 
        paddingTop={vs(10)} 
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}
              onPress={() => navigation.navigate('SLOT MANAGEMENT', { screen: 'ManualBooking' })}
            >
              <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.headerBtnText, { color: theme.colors.primary }]}>Manual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => setScannerVisible(true)}
            >
              <Ionicons name="qr-code-outline" size={20} color="#FFF" />
              <Text style={[styles.headerBtnText, { color: '#FFF' }]}>Scan QR</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Metrics Grid 2x2 */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            {isDataLoading ? (
              <Skeleton height={vs(100)} width="48%" borderRadius={ms(16)} />
            ) : (
              <StatCard
                variant="dark"
                title="Today Bookings"
                value={todayBooking.online + todayBooking.offline}
                subMetrics={[
                  {label: 'Online', value: todayBooking.online},
                  {label: 'Offline', value: todayBooking.offline}
                ]}
              />
            )}
            {isDataLoading ? (
              <Skeleton height={vs(100)} width="48%" borderRadius={ms(16)} />
            ) : (
              <StatCard
                variant="light"
                title="Monthly Bookings"
                value={monthlyBooking.online + monthlyBooking.offline}
                subMetrics={[
                  { label: 'Online', value: monthlyBooking.online },
                  { label: 'Offline', value: monthlyBooking.offline },
                ]}
              />
            )}
          </View>
          <View style={styles.metricsRow}>
            {isDataLoading ? (
              <Skeleton height={vs(100)} width="48%" borderRadius={ms(16)} />
            ) : (
              <StatCard
                variant="light"
                title="Today's Revenue"
                value={`₹${(todayRevenue.online + todayRevenue.offline).toLocaleString()}`}
                subMetrics={[
                  { label: 'Online', value: `₹${Number(todayRevenue.online).toLocaleString()}` },
                  { label: 'Offline', value: `₹${Number(todayRevenue.offline).toLocaleString()}` },
                ]}
              />
            )}
            {isDataLoading ? (
              <Skeleton height={vs(100)} width="48%" borderRadius={ms(16)} />
            ) : (
              <StatCard
                variant="dark"
                title="Monthly Revenue"
                value={`₹${(monthlyRevenue.online + monthlyRevenue.offline).toLocaleString()}`}
                subMetrics={[
                  { label: 'Online', value: `₹${Number(monthlyRevenue.online).toLocaleString()}` },
                  { label: 'Offline', value: `₹${Number(monthlyRevenue.offline).toLocaleString()}` },
                ]}
              />
            )}
          </View>
        </View>

        {/* Section with Time Toggles */}
        <View style={styles.sectionWithToggles}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Revenue
          </Text>
          <View style={styles.toggleRow}>
            {timeToggles.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.toggleBtn,
                  activeTab === tab && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    activeTab === tab
                      ? { color: '#FFF' }
                      : { color: theme.colors.textSecondary },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Performance Section */}
        {isDataLoading ? (
          <View style={{ marginVertical: vs(10) }}>
            <Skeleton height={vs(200)} width="100%" borderRadius={ms(16)} />
          </View>
        ) : (
          <PerformanceSection theme={theme} />
        )}

        {/* Activity Feed */}
        {isDataLoading ? (
          <View style={{ gap: vs(12), marginTop: vs(10), padding: s(20) }}>
            <Skeleton height={vs(70)} width="100%" borderRadius={ms(12)} />
            <Skeleton height={vs(70)} width="100%" borderRadius={ms(12)} />
            <Skeleton height={vs(70)} width="100%" borderRadius={ms(12)} />
          </View>
        ) : (
          <ActivityFeed theme={theme} />
        )}

        {/* Quick Access to Main Screens */}
        <View style={styles.quickAccessSection}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                paddingHorizontal: 0,
                marginBottom: 12,
              },
            ]}
          >
            Management
          </Text>
          <View style={styles.managementGrid}>
            {[
              {
                title: 'Venues',
                icon: 'business',
                screen: 'ServiceManagement',
                color: '#6366F1',
              },
              {
                title: 'Schedule',
                icon: 'calendar',
                screen: 'AllBookings',
                color: '#10B981',
              },
              {
                title: 'Customers',
                icon: 'people',
                screen: 'UserManagement',
                color: '#F59E0B',
              },
              {
                title: 'Reports',
                icon: 'bar-chart',
                screen: 'EarningsReports',
                color: '#EC4899',
              },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.manageCard,
                  { backgroundColor: theme.colors.card },
                ]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View
                  style={[
                    styles.manageIcon,
                    { backgroundColor: item.color + '15' },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.color}
                  />
                </View>
                <Text
                  style={[styles.manageTitle, { color: theme.colors.text }]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      <QRScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleScan}
      />

      <BookingDetailsModal
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        booking={scannedBooking}
        onBookingCompleted={fetchAnalytics}
      />

      {isScanning && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginTop: vs(10),
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    gap: s(4),
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerBtnText: {
    fontSize: ms(11),
    fontWeight: '700',
  },
  headerIcon: {
    marginTop: vs(15), // Align with header text padding
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(100),
  },
  metricsGrid: {
    paddingHorizontal: s(20),
    paddingTop: vs(20),
    gap: ms(12),
  },
  metricsRow: {
    flexDirection: 'row',
    gap: s(12),
  },
  sectionWithToggles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: s(24),
    marginTop: vs(32),
    marginBottom: vs(16),
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: ms(12),
    padding: ms(4),
  },
  toggleBtn: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: ms(10),
  },
  toggleText: {
    fontSize: ms(11),
    fontWeight: '700',
  },
  performanceContainer: {
    paddingHorizontal: s(20),
    marginBottom: vs(24),
  },
  performanceRow: {
    flexDirection: 'row',
    gap: s(12),
    marginBottom: vs(12),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(16),
    paddingHorizontal: s(4),
  },
  sectionTitle: {
    fontSize: ms(18),
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  perfLabel: {
    fontSize: ms(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(12),
  },
  occupancyCard: {
    flex: 1,
    padding: ms(16),
    borderRadius: ms(24),
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: ms(5),
  },
  occupancyContent: {
    alignItems: 'center',
  },
  occupancyCircle: {
    width: s(60),
    height: s(60),
    borderRadius: s(30),
    borderWidth: 4,
    borderColor: '#6366F120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  occupancyValue: {
    fontSize: ms(18),
    fontWeight: '800',
  },
  occupancySub: {
    fontSize: ms(8),
    textTransform: 'uppercase',
  },
  occupancyInfo: {
    width: '100%',
    gap: vs(4),
  },
  perfStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  dot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
  },
  perfStatText: {
    fontSize: ms(10),
    fontWeight: '600',
  },
  chartCard: {
    flex: 2,
    padding: ms(16),
    borderRadius: ms(24),
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: ms(5),
  },
  chartContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: vs(10),
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: s(8),
    borderRadius: s(4),
    marginBottom: vs(8),
  },
  chartLabel: {
    fontSize: ms(8),
    fontWeight: '600',
  },
  topListCard: {
    flex: 1,
    padding: ms(16),
    borderRadius: ms(24),
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: ms(5),
  },
  listContainer: {
    gap: vs(10),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
  },
  listIcon: {
    width: s(24),
    height: s(24),
    borderRadius: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  listRank: {
    fontSize: ms(12),
    fontWeight: '800',
  },
  listItemText: {
    flex: 1,
    fontSize: ms(13),
    fontWeight: '600',
  },
  listItemValue: {
    fontSize: ms(12),
    fontWeight: '700',
  },
  activitySection: {
    paddingHorizontal: s(20),
    marginBottom: vs(24),
  },
  activityList: {
    borderRadius: ms(24),
    backgroundColor: '#00000003',
    padding: ms(4),
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ms(16),
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: s(40),
    height: s(40),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: s(12),
  },
  activityTitle: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  activityDesc: {
    fontSize: ms(12),
    lineHeight: ms(18),
  },
  activityTime: {
    fontSize: ms(11),
    fontWeight: '500',
  },
  quickAccessSection: {
    paddingHorizontal: s(20),
  },
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(12),
  },
  manageCard: {
    width: s((Dimensions.get('window').width - 52) / 2),
    padding: ms(16),
    borderRadius: ms(24),
    alignItems: 'center',
    flexDirection: 'row',
    gap: s(12),
    elevation: 2,
    shadowOpacity: 0.03,
    shadowRadius: ms(4),
  },
  manageIcon: {
    width: s(40),
    height: s(40),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageTitle: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default DashboardScreen;
