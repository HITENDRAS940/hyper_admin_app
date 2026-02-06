import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import BaseModal, { baseModalStyles } from './BaseModal';

interface ServiceSlot {
  id: number;
  slotId: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
}

interface ManualBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (slotIds: number[]) => Promise<void>;
  slots: ServiceSlot[];
  serviceName: string;
  selectedDate: string;
  bookedSlotIds: number[];
  disabledSlotIds: number[];
}

const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  visible,
  onClose,
  onConfirm,
  slots,
  serviceName,
  selectedDate,
  bookedSlotIds,
  disabledSlotIds,
}) => {
  const { theme } = useTheme();
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedSlotIds([]);
  }, [visible]);

  const toggleSlot = (id: number) => {
    setSelectedSlotIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const isSlotDisabled = (slot: ServiceSlot) => {
    const id = slot.slotId || slot.id;
    return (
      bookedSlotIds.includes(id) ||
      disabledSlotIds.includes(id) ||
      !slot.enabled
    );
  };

  const handleConfirm = async () => {
    if (selectedSlotIds.length === 0) {
      Alert.alert(
        'Selection Required',
        'Please select at least one slot to book.',
      );
      return;
    }

    try {
      setSaving(true);
      await onConfirm(selectedSlotIds);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create manual booking');
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

  const totalPrice = slots
    .filter((s) => selectedSlotIds.includes(s.slotId || s.id))
    .reduce((sum, s) => sum + (s.price || 0), 0);

  const renderSlotItem = ({ item }: { item: ServiceSlot }) => {
    const id = item.slotId || item.id;
    const isSelected = selectedSlotIds.includes(id);
    const isDisabled = isSlotDisabled(item);

    return (
      <TouchableOpacity
        style={[
          styles.slotItem,
          {
            backgroundColor: isSelected
              ? theme.colors.primary + '15'
              : theme.colors.background,
            borderColor: isSelected
              ? theme.colors.primary
              : theme.colors.border,
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
        onPress={() => !isDisabled && toggleSlot(id)}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.slotTime,
            { color: isSelected ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {formatTime(item.startTime)}
        </Text>
        <Text style={[styles.slotPrice, { color: theme.colors.textSecondary }]}>
          ₹{item.price}
        </Text>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={theme.colors.primary}
            />
          </View>
        )}
        {isDisabled && (
          <View style={styles.lockBadge}>
            <Ionicons
              name="lock-closed"
              size={12}
              color={theme.colors.textSecondary}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Manual Offline Booking"
      subtitle={`${serviceName} • ${selectedDate}`}
      animationType="slide"
      presentationStyle="bottom"
      sheetHeight="80%"
    >
      <View style={styles.body}>
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Selected Slots
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {selectedSlotIds.length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Total Price
            </Text>
            <Text
              style={[styles.summaryValue, { color: theme.colors.primary }]}
            >
              ₹{totalPrice}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Select Time Slots
        </Text>
        <FlatList
          data={slots}
          keyExtractor={(item, index) =>
            (item.id || item.slotId || index).toString()
          }
          renderItem={renderSlotItem}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>

      <View style={baseModalStyles.footer}>
        <TouchableOpacity
          style={[
            baseModalStyles.cancelButton,
            { borderColor: theme.colors.border },
          ]}
          onPress={onClose}
          disabled={saving}
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
            {
              backgroundColor:
                selectedSlotIds.length > 0 ? theme.colors.primary : '#CBD5E1',
            },
          ]}
          onPress={handleConfirm}
          disabled={saving || selectedSlotIds.length === 0}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={baseModalStyles.confirmText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: s(20),
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: ms(12),
    padding: s(16),
    marginBottom: vs(20),
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: ms(12),
    marginBottom: vs(4),
  },
  summaryValue: {
    fontSize: ms(18),
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: ms(14),
    fontWeight: '600',
    marginBottom: vs(12),
  },
  listContent: {
    paddingBottom: vs(20),
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: s(10),
    marginBottom: vs(10),
  },
  slotItem: {
    flex: 1,
    maxWidth: (s(360) - s(65)) / 3,
    height: vs(60),
    borderRadius: ms(10),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotTime: {
    fontSize: ms(13),
    fontWeight: 'bold',
  },
  slotPrice: {
    fontSize: ms(11),
    marginTop: vs(2),
  },
  checkBadge: {
    position: 'absolute',
    top: -s(5),
    right: -s(5),
    backgroundColor: '#FFF',
    borderRadius: ms(10),
  },
  lockBadge: {
    position: 'absolute',
    top: s(2),
    right: s(2),
  },
});

export default ManualBookingModal;
