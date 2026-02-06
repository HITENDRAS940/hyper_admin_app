import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import BaseModal from './BaseModal';

interface ServiceSlot {
  id: number;
  slotId: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
}

interface SlotsManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedSlots: any[]) => Promise<void>;
  slots: ServiceSlot[];
  loading: boolean;
  onRefresh?: () => void;
  serviceName: string;
}

const SlotsManagementModal: React.FC<SlotsManagementModalProps> = ({
  visible,
  onClose,
  onSave,
  slots,
  loading,
  onRefresh,
  serviceName,
}) => {
  const { theme } = useTheme();
  const [localSlots, setLocalSlots] = useState<ServiceSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [changedSlotIds, setChangedSlotIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLocalSlots(JSON.parse(JSON.stringify(slots))); // Deep copy
    setChangedSlotIds(new Set());
  }, [slots, visible]);

  const handleUpdateSlot = (id: number, updates: Partial<ServiceSlot>) => {
    setLocalSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === id || slot.slotId === id) {
          setChangedSlotIds((prevSet) => new Set(prevSet).add(id));
          return { ...slot, ...updates };
        }
        return slot;
      }),
    );
  };

  const handleSave = async () => {
    try {
      if (changedSlotIds.size === 0) {
        onClose();
        return;
      }

      setSaving(true);
      const updatedSlots = localSlots.filter(
        (slot) =>
          changedSlotIds.has(slot.id) || changedSlotIds.has(slot.slotId),
      );

      await onSave(updatedSlots);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save slot changes');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    if (time.includes('T')) {
      return new Date(time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return time;
  };

  const renderSlotItem = ({ item }: { item: ServiceSlot }) => (
    <View
      style={[styles.slotItem, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.slotInfo}>
        <Text style={[styles.slotTime, { color: theme.colors.text }]}>
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
        <Text style={[styles.slotId, { color: theme.colors.textSecondary }]}>
          ID: {item.slotId || item.id}
        </Text>
      </View>

      <View style={styles.slotActions}>
        <View style={styles.priceInputContainer}>
          <Text
            style={[
              styles.currencyLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            ₹
          </Text>
          <TextInput
            style={[
              styles.priceInput,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            value={item.price.toString()}
            keyboardType="numeric"
            onChangeText={(val) =>
              handleUpdateSlot(item.id || item.slotId, {
                price: parseFloat(val) || 0,
              })
            }
          />
        </View>

        <Switch
          value={item.enabled}
          onValueChange={(val) =>
            handleUpdateSlot(item.id || item.slotId, { enabled: val })
          }
          trackColor={{ false: '#CBD5E1', true: theme.colors.primary + '80' }}
          thumbColor={item.enabled ? theme.colors.primary : '#F8FAFC'}
        />
      </View>
    </View>
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Manage Slots"
      subtitle={serviceName}
      animationType="slide"
      presentationStyle="bottom"
      sheetHeight="80%"
      headerRight={
        onRefresh ? (
          <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
            <Ionicons name="refresh" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : undefined
      }
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={localSlots}
          keyExtractor={(item, index) =>
            (item.id || item.slotId || index).toString()
          }
          renderItem={renderSlotItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: theme.colors.textSecondary }}>
                No slots configured
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <Text
          style={[styles.changeCount, { color: theme.colors.textSecondary }]}
        >
          {changedSlotIds.size} change(s) pending
        </Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor:
                changedSlotIds.size > 0 ? theme.colors.primary : '#CBD5E1',
            },
          ]}
          onPress={handleSave}
          disabled={saving || changedSlotIds.size === 0}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveText}>Save All Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: s(5),
  },
  listContent: {
    padding: s(20),
  },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(16),
    borderRadius: ms(12),
    marginBottom: vs(12),
  },
  slotInfo: {
    flex: 1,
  },
  slotTime: {
    fontSize: ms(15),
    fontWeight: '600',
    marginBottom: vs(4),
  },
  slotId: {
    fontSize: ms(11),
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(16),
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: s(8),
    width: s(80),
  },
  currencyLabel: {
    fontSize: ms(14),
    marginRight: s(2),
  },
  priceInput: {
    flex: 1,
    fontSize: ms(14),
    paddingVertical: vs(6),
    height: vs(36),
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(40),
  },
  footer: {
    padding: s(20),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeCount: {
    fontSize: ms(12),
  },
  saveButton: {
    paddingHorizontal: s(24),
    height: vs(44),
    borderRadius: ms(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: 'bold',
  },
});

export default SlotsManagementModal;
