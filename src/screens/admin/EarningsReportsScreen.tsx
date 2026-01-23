import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Share } from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useTheme } from '../../contexts/ThemeContext';
import GradientHeader from '../../components/shared/GradientHeader';
import { Ionicons } from '@expo/vector-icons';
import { s, vs, ms } from 'react-native-size-matters';
import StatCard from '../../components/shared/cards/StatCard';
import { adminAPI } from '../../services/api';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

const EarningsReportsScreen = () => {
  const { theme } = useTheme();
  
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalyticsSummary();
      setData(res.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const handleExportCSV = async () => {
    if (!data) return;
    
    try {
      let csvContent = 'Metric,Value\n';
      csvContent += `Total Revenue,₹${data.revenue?.total || 0}\n`;
      csvContent += `Total Bookings,${data.bookings?.total || 0}\n`;
      csvContent += `Cancellation Rate,${data.cancellationRate || 0}%\n\n`;
      
      csvContent += 'Bookings by Sport,Count,Revenue\n';
      data.bookingsBySport?.forEach((s: any) => {
        csvContent += `${s.sport},${s.count},₹${s.revenue}\n`;
      });
      
      const fileName = `Report_${format(new Date(), 'yyyyMMdd')}.csv`;
      
      await Share.share({
        message: csvContent,
        title: fileName,
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <GradientHeader title="Reports" subtitle="Loading analytics..." />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  const revenue = data?.revenue || { total: 0, trend: 0 };
  const bookingsBySport = data?.bookingsBySport || [];
  const topServices = data?.topServices || [];
  const peakHours = data?.peakHours || [];

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      <GradientHeader
        title="Earnings"
        subtitle="Revenue & Venue Performance"
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.exportGradient}
          >
            <Ionicons name="download-outline" size={20} color="#FFF" />
            <Text style={styles.exportText}>Export Report (CSV)</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Main Revenue Card */}
        <View style={[styles.mainRevenueContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.revenueLabel}>Total Earnings (Monthly)</Text>
          <Text style={styles.revenueValue}>₹{revenue.total?.toLocaleString()}</Text>
          <View style={styles.revenueTrend}>
            <Ionicons name={revenue.trend >= 0 ? "arrow-up" : "arrow-down"} size={16} color={revenue.trend >= 0 ? "#4ADE80" : "#F87171"} />
            <Text style={[styles.trendText, { color: revenue.trend >= 0 ? "#4ADE80" : "#F87171" }]}>
              {revenue.trend >= 0 ? '+' : ''}{revenue.trend}% from last month
            </Text>
          </View>
        </View>

        {/* Breakdown Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard title="This Week" value={`₹${(data?.weeklyRevenue || 0).toLocaleString()}`} icon="cash-outline" color="#10B981" />
            <StatCard title="Today" value={`₹${(data?.dailyRevenue || 0).toLocaleString()}`} icon="today-outline" color="#3B82F6" />
          </View>
          <View style={[styles.statsRow, { marginTop: vs(12) }]}>
            <StatCard title="Total Bookings" value={`${data?.bookings?.total || 0}`} icon="calendar-outline" color="#6366F1" />
            <StatCard title="Cancellation Rate" value={`${data?.cancellationRate || 0}%`} icon="close-circle-outline" color="#F87171" />
          </View>
        </View>

        {/* Bookings by Sport */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Bookings by Sport</Text>
        </View>
        <View style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
          {bookingsBySport.map((item: any, index: number) => (
             <View key={index} style={styles.sportItem}>
                <View style={styles.sportInfo}>
                  <Text style={[styles.sportName, { color: theme.colors.text }]}>{item.sport}</Text>
                  <Text style={[styles.sportRevenue, { color: theme.colors.textSecondary }]}>₹{item.revenue.toLocaleString()}</Text>
                </View>
                <View style={styles.sportBarContainer}>
                   <View 
                    style={[
                      styles.sportBar, 
                      { 
                        width: `${(item.count / (data?.bookings?.total || 1)) * 100}%`,
                        backgroundColor: theme.colors.primary
                      }
                    ]} 
                   />
                </View>
                <Text style={[styles.sportCount, { color: theme.colors.primary }]}>{item.count}</Text>
             </View>
          ))}
        </View>

        {/* Peak Hours Chart */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Peak Hours (Today)</Text>
        </View>
        <View style={[styles.peakChartCard, { backgroundColor: theme.colors.card }]}>
           <View style={styles.peakChartContainer}>
            {peakHours.map((item: any, index: number) => (
              <View key={index} style={styles.peakBarWrapper}>
                <View 
                  style={[
                    styles.peakBar, 
                    { 
                      height: `${item.occupancy}%`, 
                      backgroundColor: item.occupancy > 80 ? theme.colors.error : theme.colors.primary 
                    }
                  ]} 
                />
                <Text style={[styles.peakLabel, { color: theme.colors.textSecondary }]}>{item.hour}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Booking Distribution */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Booking Method</Text>
        </View>
        <View style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
           <View style={styles.distributionContainer}>
              <View style={styles.distributionItem}>
                 <Text style={[styles.distLabel, { color: theme.colors.textSecondary }]}>Online Payments</Text>
                 <Text style={[styles.distValue, { color: theme.colors.text }]}>{data?.bookings?.online || 0}</Text>
                 <View style={styles.distBarBg}>
                    <View style={[styles.distBar, { width: `${(data?.bookings?.online / (data?.bookings?.total || 1)) * 100}%`, backgroundColor: '#6366F1' }]} />
                 </View>
              </View>
              <View style={styles.distributionItem}>
                 <Text style={[styles.distLabel, { color: theme.colors.textSecondary }]}>Offline / Cash</Text>
                 <Text style={[styles.distValue, { color: theme.colors.text }]}>{data?.bookings?.offline || 0}</Text>
                 <View style={styles.distBarBg}>
                    <View style={[styles.distBar, { width: `${(data?.bookings?.offline / (data?.bookings?.total || 1)) * 100}%`, backgroundColor: '#10B981' }]} />
                 </View>
              </View>
           </View>
        </View>

        {/* Top Performing Services */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Performing Venues</Text>
        </View>

        <View style={styles.topServicesContainer}>
          {topServices.length > 0 ? topServices.map((service: any, index: number) => (
            <View key={index} style={[styles.serviceCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceNameText, { color: theme.colors.text }]}>{service.name}</Text>
                <Text style={[styles.serviceBookings, { color: theme.colors.textSecondary }]}>{service.bookings} bookings</Text>
              </View>
              <Text style={[styles.serviceRevenue, { color: theme.colors.primary }]}>₹{service.revenue.toLocaleString()}</Text>
            </View>
          )) : (
            <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 10 }}>No data available</Text>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: s(20),
    paddingBottom: vs(40),
  },
  mainRevenueContainer: {
    padding: ms(24),
    borderRadius: ms(24),
    marginBottom: vs(24),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(10) },
    shadowOpacity: 0.2,
    shadowRadius: ms(20),
  },
  revenueLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: ms(14),
    fontWeight: '600',
    marginBottom: vs(8),
  },
  revenueValue: {
    color: '#FFFFFF',
    fontSize: ms(36),
    fontWeight: '800',
    marginBottom: vs(12),
  },
  revenueTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  trendText: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  statsGrid: {
    marginBottom: vs(24),
  },
  statsRow: {
    flexDirection: 'row',
    gap: s(12),
  },
  sectionHeader: {
    marginBottom: vs(16),
  },
  sectionTitle: {
    fontSize: ms(20),
    fontWeight: '800',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    marginBottom: vs(16),
    borderRadius: ms(16),
    overflow: 'hidden',
  },
  exportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(12),
    gap: s(8),
  },
  exportText: {
    color: '#FFF',
    fontSize: ms(15),
    fontWeight: '700',
  },
  chartCard: {
    borderRadius: ms(24),
    padding: ms(20),
    marginBottom: vs(24),
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
    gap: s(12),
  },
  sportInfo: {
    width: s(80),
  },
  sportName: {
    fontSize: ms(14),
    fontWeight: '700',
  },
  sportRevenue: {
    fontSize: ms(11),
  },
  sportBarContainer: {
    flex: 1,
    height: vs(12),
    backgroundColor: '#F1F5F9',
    borderRadius: ms(6),
    overflow: 'hidden',
  },
  sportBar: {
    height: '100%',
    borderRadius: ms(6),
  },
  sportCount: {
    width: s(30),
    fontSize: ms(14),
    fontWeight: '700',
    textAlign: 'right',
  },
  peakChartCard: {
    borderRadius: ms(24),
    padding: ms(20),
    marginBottom: vs(24),
    height: vs(180),
  },
  peakChartContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  peakBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  peakBar: {
    width: s(6),
    borderRadius: s(3),
    marginBottom: vs(8),
  },
  peakLabel: {
    fontSize: ms(8),
    fontWeight: '600',
  },
  distributionContainer: {
    gap: vs(20),
  },
  distributionItem: {
    gap: vs(8),
  },
  distLabel: {
    fontSize: ms(13),
    fontWeight: '600',
  },
  distValue: {
    fontSize: ms(18),
    fontWeight: '800',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  distBarBg: {
    height: vs(10),
    backgroundColor: '#F1F5F9',
    borderRadius: ms(5),
    overflow: 'hidden',
  },
  distBar: {
    height: '100%',
    borderRadius: ms(5),
  },
  topServicesContainer: {
    gap: vs(12),
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ms(16),
    borderRadius: ms(20),
  },
  serviceInfo: {
    gap: vs(4),
  },
  serviceNameText: {
    fontSize: ms(16),
    fontWeight: '700',
  },
  serviceBookings: {
    fontSize: ms(13),
    fontWeight: '500',
  },
  serviceRevenue: {
    fontSize: ms(16),
    fontWeight: '800',
  },
});

export default EarningsReportsScreen;
