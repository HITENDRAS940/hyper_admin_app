import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface ServiceSlot {
  id: number;
  slotId: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface DisableSlotByDateModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (slotId: number, reason: string) => Promise<void>;
  slots: ServiceSlot[];
  selectedDate: Date;
}

const DisableSlotByDateModal: React.FC<DisableSlotByDateModalProps> = ({
  visible,
  onClose,
  onConfirm,
  slots,
  selectedDate,
}) => {
  const { theme } = useTheme();
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [reason, setReason] = useState('Maintenance/Operational Reason');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedSlotIds([]);
    setReason('Maintenance/Operational Reason');
  }, [visible]);

  const toggleSlot = (id: number) => {
    setSelectedSlotIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleConfirm = async () => {
    if (selectedSlotIds.length === 0) {
      Alert.alert(
        'Selection Required',
        'Please select at least one slot to block.',
      );
      return;
    }

    try {
      setSaving(true);
      // If the parent onConfirm only takes one ID, we'll have to loop or update it.
      // Based on the screen code, it takes (slotId: number, reason: string).
      // We will loop through selectedSlotIds.
      for (const id of selectedSlotIds) {
        await onConfirm(id, reason);
      }
      onClose();
    } catch (error: any) {
      // Error is handled by parent, but we should stop and notify.
      Alert.alert(
        'Error',
        'Some slots could not be disabled. Check console for details.',
      );
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

  const renderSlotItem = ({ item }: { item: ServiceSlot }) => {
    const isSelected = selectedSlotIds.includes(item.slotId || item.id);
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
          },
        ]}
        onPress={() => toggleSlot(item.slotId || item.id)}
      >
        <Text
          style={[
            styles.slotTime,
            { color: isSelected ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {formatTime(item.startTime)}
        </Text>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Block Slots for Date
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
              >
                {format(selectedDate, 'EEEE, dd MMMM yyyy')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Select Slots to Block
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

            <View style={styles.reasonContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Reason for Blocking
              </Text>
              <TextInput
                style={[
                  styles.reasonInput,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={reason}
                onChangeText={setReason}
                placeholder="Enter reason (e.g. Maintenance)"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { borderColor: theme.colors.border },
              ]}
              onPress={onClose}
              disabled={saving}
            >
              <Text
                style={[
                  styles.cancelText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  backgroundColor:
                    selectedSlotIds.length > 0 ? '#EF4444' : '#CBD5E1',
                },
              ]}
              onPress={handleConfirm}
              disabled={saving || selectedSlotIds.length === 0}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.confirmText}>
                  Block {selectedSlotIds.length} Slot(s)
                </Text>
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: ms(24),
    borderTopRightRadius: ms(24),
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
  subtitle: {
    fontSize: ms(13),
    marginTop: vs(2),
  },
  closeButton: {
    padding: s(5),
  },
  body: {
    flex: 1,
    padding: s(20),
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
    maxWidth: (s(360) - s(60)) / 3,
    height: vs(44),
    borderRadius: ms(10),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(4),
  },
  slotTime: {
    fontSize: ms(13),
    fontWeight: '500',
  },
  reasonContainer: {
    marginTop: vs(20),
  },
  reasonInput: {
    width: '100%',
    height: vs(48),
    borderRadius: ms(10),
    borderWidth: 1,
    paddingHorizontal: s(15),
    fontSize: ms(14),
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
  confirmButton: {
    flex: 2,
    height: vs(44),
    borderRadius: ms(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: 'bold',
  },
});

export default DisableSlotByDateModal;
