import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { Service } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s, vs, ms } from 'react-native-size-matters';

// Shared Components
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import AdminServiceCard from '../../components/admin/AdminServiceCard';
import ScreenHeader from '../../components/shared/ScreenHeader';
import usePaginatedFetch from '../../hooks/usePaginatedFetch';

const ServiceManagementScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  const fetchServices = useCallback(
    (page: number, size: number) => adminAPI.getServices(page, size),
    [],
  );

  const {
    data: services,
    loading,
    refreshing,
    loadingMore,
    error,
    page,
    onRefresh,
    onLoadMore: handleLoadMore,
  } = usePaginatedFetch<Service>({ fetchFn: fetchServices });

  const handleServicePress = (service: Service) => {
    navigation.navigate('AdminServiceDetail', {
      serviceId: service.id,
      service,
    });
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
    <ScreenWrapper style={styles.container} safeAreaEdges={['left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Refined Header like Dashboard */}
      <ScreenHeader
        title="Services"
        subtitle="Manage venue listings"
        paddingTop={insets.top + 10}
        actions={[
          {
            icon: 'arrow-back',
            variant: 'outline',
            iconSize: 22,
            onPress: () => navigation.goBack(),
          },
          {
            icon: 'add',
            variant: 'filled',
            iconSize: 28,
            onPress: () =>
              Alert.alert(
                'Coming Soon',
                'Dynamic service creation will be available soon.',
              ),
          },
        ]}
      />

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

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9FAFB', // Matching Dashboard background
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
