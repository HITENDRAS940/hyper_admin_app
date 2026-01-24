import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { Service } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s, vs, ms } from 'react-native-size-matters';

// Shared Components
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/shared/Button';
import AdminServiceCard from '../../components/admin/AdminServiceCard';


const ServiceManagementScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchServices(0);
  }, []);

  const fetchServices = async (pageNum: number = 0, isRefreshing: boolean = false) => {
    try {
      if (pageNum === 0) {
        if (!isRefreshing) setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await adminAPI.getServices(pageNum, 10);
      
      const newServices = response.content || [];
      if (pageNum === 0) {
        setServices(newServices);
      } else {
        setServices(prev => [...prev, ...newServices]);
      }
      
      setHasMore(!response.last && newServices.length > 0);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch services';
      setError(errorMessage);
      if (pageNum === 0) {
        // Only alert on first page load error
        // Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices(0, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      fetchServices(page + 1);
    }
  };

  // Create Handler


  const handleServicePress = (service: Service) => {
    navigation.navigate('AdminServiceDetail', { serviceId: service.id, service });
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: vs(20) }} />;
    return (
      <View style={styles.footerLoader}>
        <LoadingState />
      </View>
    );
  };

  return (
    <ScreenWrapper 
      style={styles.container}
      safeAreaEdges={['left', 'right']}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Refined Header like Dashboard */}
      <View style={[styles.cleanHeader, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Services</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Manage venue listings</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconCircle}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileCircle}
            onPress={() => Alert.alert('Coming Soon', 'Dynamic service creation will be available soon.')}
          >
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Service List */}
      <View style={{ flex: 1 }}>
        {loading && page === 0 ? (
          <LoadingState />
        ) : error && services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="alert-circle-outline"
              title="Something went wrong"
              description={error}
              actionLabel="Try Again"
              onAction={onRefresh}
            />
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="golf-outline"
              title="No Services Found"
              description="Create your first service to get started or check back later."
              actionLabel="Refresh"
              onAction={onRefresh}
            />
          </View>
        ) : (
          <FlatList
            data={services}
            renderItem={({ item }) => (
              <AdminServiceCard 
                service={item} 
                onPress={() => handleServicePress(item)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

    </ScreenWrapper>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Matching Dashboard background
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
  headerSubtitle: {
    fontSize: ms(14),
    fontWeight: '500',
    marginTop: -vs(2),
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
  listContainer: {
    padding: ms(20),
    paddingTop: vs(10),
    paddingBottom: vs(40),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(40),
  },
  footerLoader: {
    paddingVertical: vs(20),
    alignItems: 'center',
  },
});

export default ServiceManagementScreen;
