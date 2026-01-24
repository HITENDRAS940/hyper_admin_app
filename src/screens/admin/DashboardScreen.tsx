import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet, s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import StatCard from '../../components/shared/cards/StatCard';

const { width } = Dimensions.get('window');

// Local Components for Dashboard
const PerformanceSection = ({ theme }: { theme: any }) => {
  const peakHours = [
    { hour: '6am', value: 20 },
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Performance</Text>
      </View>

      <View style={styles.performanceRow}>
        {/* Occupancy Rate */}
        <View style={[styles.occupancyCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.perfLabel, { color: theme.colors.textSecondary }]}>Occupancy Rate</Text>
          <View style={styles.occupancyContent}>
            <View style={styles.occupancyCircle}>
              <Text style={[styles.occupancyValue, { color: theme.colors.primary }]}>78%</Text>
              <Text style={[styles.occupancySub, { color: theme.colors.textSecondary }]}>today</Text>
            </View>
            <View style={styles.occupancyInfo}>
              <View style={styles.perfStat}>
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.perfStatText, { color: theme.colors.text }]}>84 Slots Booked</Text>
              </View>
              <View style={styles.perfStat}>
                <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.perfStatText, { color: theme.colors.text }]}>24 Slots Free</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Peak Hours Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.perfLabel, { color: theme.colors.textSecondary }]}>Peak Hours</Text>
          <View style={styles.chartContainer}>
            {peakHours.map((item, index) => (
              <View key={index} style={styles.chartBarWrapper}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      height: `${item.value}%`, 
                      backgroundColor: item.value > 80 ? theme.colors.error : theme.colors.primary 
                    }
                  ]} 
                />
                <Text style={[styles.chartLabel, { color: theme.colors.textSecondary }]}>{item.hour}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.performanceRow}>
        {/* Top Sports */}
        <View style={[styles.topListCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.perfLabel, { color: theme.colors.textSecondary }]}>Top 3 Sports</Text>
          <View style={styles.listContainer}>
            {['Football', 'Cricket', 'Tennis'].map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.listIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Text style={[styles.listRank, { color: theme.colors.primary }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>{item}</Text>
                <Text style={[styles.listItemValue, { color: theme.colors.textSecondary }]}>{40 - i * 10}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Venues */}
        <View style={[styles.topListCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.perfLabel, { color: theme.colors.textSecondary }]}>Top 3 Venues</Text>
          <View style={styles.listContainer}>
            {['Arena Prime', 'Sunset Turf', 'City Courts'].map((item, i) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.listIcon, { backgroundColor: theme.colors.secondary + '15' }]}>
                  <Text style={[styles.listRank, { color: theme.colors.secondary }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.listItemText, { color: theme.colors.text }]}>{item}</Text>
                <Text style={[styles.listItemValue, { color: theme.colors.textSecondary }]}>₹{15 - i * 3}k</Text>
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
    { id: 1, type: 'BOOKING', title: 'New booking placed', desc: 'Arena Prime • 6:00 PM', time: '2m ago', icon: 'cart-outline', color: '#4F46E5' },
    { id: 2, type: 'OFFLINE', title: 'Offline booking added', desc: 'Sunset Turf • 8:30 PM', time: '15m ago', icon: 'person-add-outline', color: '#10B981' },
    { id: 3, type: 'BLOCK', title: 'Slot blocked', desc: 'City Courts • Multi-slot', time: '1h ago', icon: 'ban-outline', color: '#F59E0B' },
    { id: 4, type: 'UPDATE', title: 'Venue profile updated', desc: 'Arena Prime • Price change', time: '3h ago', icon: 'create-outline', color: '#EC4899' },
  ];

  return (
    <View style={styles.activitySection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Activity Feed</Text>
        <TouchableOpacity>
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.activityList}>
        {activities.map((item) => (
          <View key={item.id} style={[styles.activityItem, { borderBottomColor: theme.colors.border + '50' }]}>
            <View style={[styles.activityIcon, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.activityDesc, { color: theme.colors.textSecondary }]}>{item.desc}</Text>
            </View>
            <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>{item.time}</Text>
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
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Weekly');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const timeToggles = ['Monthly', 'Weekly', 'Today'];

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: '#F9FAFB' }]}
      safeAreaEdges={['left', 'right']}
    >
      {/* Refined Header */}
      <View style={[styles.cleanHeader, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="moon-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileCircle}>
            <Ionicons name="infinite-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Metrics Grid 2x2 */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <StatCard 
              variant="dark"
              title="Total Menus" 
              value="120" 
              progress={45}
            />
            <StatCard 
              variant="light"
              title="Total Orders" 
              value="180" 
              progress={62}
            />
          </View>
          <View style={styles.metricsRow}>
            <StatCard 
              variant="light"
              title="Total Clients" 
              value="240" 
              progress={80}
            />
            <StatCard 
              variant="light"
              title="Revenue" 
              value="140" 
              progress={85}
            />
          </View>
        </View>

        {/* Section with Time Toggles */}
        <View style={styles.sectionWithToggles}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Revenue</Text>
          <View style={styles.toggleRow}>
            {timeToggles.map(tab => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.toggleBtn, 
                  activeTab === tab && { backgroundColor: theme.colors.primary }
                ]}
              >
                <Text style={[
                  styles.toggleText, 
                  activeTab === tab ? { color: '#FFF' } : { color: theme.colors.textSecondary }
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Performance Section */}
        <PerformanceSection theme={theme} />

        {/* Activity Feed */}
        <ActivityFeed theme={theme} />

        {/* Quick Access to Main Screens */}
        <View style={styles.quickAccessSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, paddingHorizontal: 0, marginBottom: 12 }]}>Management</Text>
          <View style={styles.managementGrid}>
            {[
              { title: 'Venues', icon: 'business', screen: 'ServiceManagement', color: '#6366F1' },
              { title: 'Schedule', icon: 'calendar', screen: 'AllBookings', color: '#10B981' },
              { title: 'Customers', icon: 'people', screen: 'UserManagement', color: '#F59E0B' },
              { title: 'Reports', icon: 'bar-chart', screen: 'EarningsReports', color: '#EC4899' },
            ].map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.manageCard, { backgroundColor: theme.colors.card }]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={[styles.manageIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={[styles.manageTitle, { color: theme.colors.text }]}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
  profileCircle: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: '#0F172A',
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
    paddingTop: vs(10),
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
});

export default DashboardScreen;