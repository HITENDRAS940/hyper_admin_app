import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import BaseModal, { baseModalStyles } from './BaseModal';

interface AvailabilityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (isAvailable: boolean) => Promise<void>;
  currentAvailability: boolean;
  serviceName: string;
}

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  visible,
  onClose,
  onSave,
  currentAvailability,
  serviceName,
}) => {
  const { theme } = useTheme();
  const [isAvailable, setIsAvailable] = useState(currentAvailability);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAvailable(currentAvailability);
  }, [currentAvailability, visible]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(isAvailable);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Service Availability"
      closeDisabled={loading}
    >
      <View style={styles.body}>
        <Text style={[styles.serviceName, { color: theme.colors.primary }]}>
          {serviceName}
        </Text>

        <View
          style={[
            styles.statusContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
              {isAvailable ? 'Online & Bookable' : 'Offline / Private'}
            </Text>
            <Text
              style={[
                styles.statusSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              {isAvailable
                ? 'Users can see and book slots'
                : 'Service is hidden from search'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{
              false: '#CBD5E1',
              true: theme.colors.primary + '80',
            }}
            thumbColor={isAvailable ? theme.colors.primary : '#F8FAFC'}
            disabled={loading}
          />
        </View>

        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          <Ionicons name="information-circle-outline" size={14} />
          Changes will manifest immediately for all users.
        </Text>
      </View>

      <View style={baseModalStyles.footer}>
        <TouchableOpacity
          style={[
            baseModalStyles.cancelButton,
            { borderColor: theme.colors.border },
          ]}
          onPress={onClose}
          disabled={loading}
        >
          <Text
            style={[
              baseModalStyles.cancelText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            baseModalStyles.confirmButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={baseModalStyles.confirmText}>Update Status</Text>
          )}
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  body: {
    padding: s(20),
  },
  serviceName: {
    fontSize: ms(14),
    fontWeight: '600',
    marginBottom: vs(12),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(16),
    borderRadius: ms(12),
    marginBottom: vs(16),
  },
  statusTitle: {
    fontSize: ms(16),
    fontWeight: '600',
    marginBottom: vs(4),
  },
  statusSubtitle: {
    fontSize: ms(12),
  },
  infoText: {
    fontSize: ms(12),
    fontStyle: 'italic',
  },
});

export default AvailabilityModal;
