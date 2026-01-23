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
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      if (!user?.id) {
        setServices([]);
        return;
      }
      const response = await adminAPI.getAdminServices(user.id);
      setServices(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  // Create Handler


  const handleServicePress = (service: Service) => {
    navigation.navigate('AdminServiceDetail', { service });
  };

  return (
    <ScreenWrapper 
      style={styles.container}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + vs(10) }]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Service Management</Text>
              <Text style={styles.headerSubtitle}>Manage your listings</Text>
            </View>

          </View>
        </LinearGradient>
      </View>

      {/* Service List */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <LoadingState />
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="golf"
              title="No Services Yet"
              description="Create your first service to get started"
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
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => Alert.alert('Coming Soon', 'Dynamic service creation will be available soon.')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={32} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modals */}

    </ScreenWrapper>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: ms(24),
    borderBottomRightRadius: ms(24),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.15,
    shadowRadius: ms(8),
    backgroundColor: theme.colors.surface,
  },
  headerGradient: {
    paddingBottom: vs(24),
    paddingHorizontal: s(24),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(28),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: vs(4),
  },
  headerSubtitle: {
    fontSize: ms(16),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  listContainer: {
    padding: ms(20),
    paddingBottom: vs(100),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: s(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: vs(24),
    right: s(24),
    width: s(64),
    height: s(64),
    borderRadius: s(32),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.3,
    shadowRadius: ms(8),
    overflow: 'hidden',
  },
  fabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiceManagementScreen;
