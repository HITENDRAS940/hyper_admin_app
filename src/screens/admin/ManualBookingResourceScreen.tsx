import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { adminAPI } from '../../services/api';
import { Service, Resource } from '../../types';
import { useNavigation, useRoute } from '@react-navigation/native';

const ManualBookingResourceScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { service } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getResources(Number(service.id));
      setResources(res);
      
      if (res.length === 1) {
        handleResourceSelect(res[0]);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setLoading(false);
    }
  };

  const handleResourceSelect = (resource: Resource) => {
    navigation.navigate('ManualBookingSlot', { service, resource });
  };

  const renderResourceCard = ({ item }: { item: Resource }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => handleResourceSelect(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#10B98115' }]}>
        <Ionicons name="layers" size={24} color="#10B981" />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {item.description || 'No description available'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <ScreenHeader 
        title="Select Resource" 
        subtitle={service.name}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading resources...
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={resources}
            renderItem={renderResourceCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="layers-outline" size={64} color={theme.colors.textSecondary + '50'} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No resources found
                </Text>
              </View>
            }
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: vs(12),
    fontSize: ms(14),
    fontWeight: '500',
  },
  listContainer: {
    padding: s(20),
    gap: vs(12),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(16),
    borderRadius: ms(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: vs(4),
  },
  iconContainer: {
    width: s(48),
    height: s(48),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(16),
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    marginBottom: vs(4),
  },
  cardSubtitle: {
    fontSize: ms(12),
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    marginTop: vs(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: vs(16),
    fontSize: ms(16),
    fontWeight: '500',
  },
});

export default ManualBookingResourceScreen;
