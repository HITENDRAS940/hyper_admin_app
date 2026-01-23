import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Service Availability</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={[styles.serviceName, { color: theme.colors.primary }]}>{serviceName}</Text>
            
            <View style={[styles.statusContainer, { backgroundColor: theme.colors.background }]}>
              <View>
                <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
                  {isAvailable ? 'Online & Bookable' : 'Offline / Private'}
                </Text>
                <Text style={[styles.statusSubtitle, { color: theme.colors.textSecondary }]}>
                  {isAvailable 
                    ? 'Users can see and book slots' 
                    : 'Service is hidden from search'}
                </Text>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#CBD5E1', true: theme.colors.primary + '80' }}
                thumbColor={isAvailable ? theme.colors.primary : '#F8FAFC'}
                disabled={loading}
              />
            </View>

            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              <Ionicons name="information-circle-outline" size={14} /> 
              Changes will manifest immediately for all users.
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: theme.colors.border }]} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.saveText}>Update Status</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  modalContent: {
    width: '100%',
    borderRadius: ms(16),
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(20),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: ms(18),
    fontWeight: 'bold',
  },
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
  footer: {
    flexDirection: 'row',
    padding: s(20),
    gap: s(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    height: vs(44),
    borderRadius: ms(10),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: ms(14),
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    height: vs(44),
    borderRadius: ms(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: 'bold',
  },
});

export default AvailabilityModal;
