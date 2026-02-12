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
import { Service, Resource, ResourceSlot } from '../../types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format, addDays, isSameDay } from 'date-fns';

const ManualBookingSlotScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { service, resource } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<ResourceSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState<ResourceSlot[]>([]);

  useEffect(() => {
    fetchSlots(resource.id, selectedDate);
  }, []);

  const fetchSlots = async (resourceId: number, date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await adminAPI.getResourceSlots(resourceId, dateStr);
      const sortedSlots = (res || []).sort((a: ResourceSlot, b: ResourceSlot) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      setSlots(sortedSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    fetchSlots(resource.id, date);
  };

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const upper = timeStr.trim().toUpperCase();
    const amPmMatch = upper.match(/(\d+):(\d+)\s*(AM|PM)/);
    
    if (amPmMatch) {
      let hours = parseInt(amPmMatch[1], 10);
      const minutes = parseInt(amPmMatch[2], 10);
      const modifier = amPmMatch[3];
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }

    const parts = upper.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  const handleSlotSelect = (slot: ResourceSlot) => {
    if (slot.status !== 'AVAILABLE') return;
    
    if (selectedSlots.length === 0) {
      setSelectedSlots([slot]);
      return;
    }

    const isAlreadySelected = selectedSlots.some(s => s.slotId === slot.slotId);
    
    if (isAlreadySelected) {
      // If only one selected, just deselect
      if (selectedSlots.length === 1) {
        setSelectedSlots([]);
        return;
      }

      const sorted = [...selectedSlots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      if (slot.slotId === first.slotId) {
        setSelectedSlots(selectedSlots.filter(s => s.slotId !== slot.slotId));
      } else if (slot.slotId === last.slotId) {
        setSelectedSlots(selectedSlots.filter(s => s.slotId !== slot.slotId));
      } else {
        // Middle deselected, reset to just this slot to start a new range
        setSelectedSlots([slot]);
      }
      return;
    }

    // Range selection logic
    const allSlotsSorted = [...slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const currentSorted = [...selectedSlots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    
    const firstSelectedIdx = allSlotsSorted.findIndex(s => s.slotId === currentSorted[0].slotId);
    const lastSelectedIdx = allSlotsSorted.findIndex(s => s.slotId === currentSorted[currentSorted.length - 1].slotId);
    const clickedIdx = allSlotsSorted.findIndex(s => s.slotId === slot.slotId);

    let startIdx = clickedIdx;
    let endIdx = clickedIdx;

    if (clickedIdx < firstSelectedIdx) {
      // Selecting range before current selection
      startIdx = clickedIdx;
      endIdx = lastSelectedIdx;
    } else if (clickedIdx > lastSelectedIdx) {
      // Selecting range after current selection
      startIdx = firstSelectedIdx;
      endIdx = clickedIdx;
    } else {
      setSelectedSlots([slot]);
      return;
    }

    const range = allSlotsSorted.slice(startIdx, endIdx + 1);
    const isRangeAvailable = range.every(s => s.status === 'AVAILABLE');

    if (isRangeAvailable) {
      setSelectedSlots(range);
    } else {
      setSelectedSlots([slot]);
    }
  };

  const handleConfirmBooking = () => {
    if (selectedSlots.length === 0) return;
    
    // Pass aggregate info
    navigation.navigate('ManualBookingConfirm', { 
      service, 
      resource,
      slots: selectedSlots,
      date: format(selectedDate, 'yyyy-MM-dd')
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      // Try parsing as ISO
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return format(date, 'hh:mm a');
      }

      // Try parsing as HH:mm or HH:mm:ss
      const timeParts = timeStr.split(':');
      if (timeParts.length >= 2) {
        const d = new Date();
        d.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0);
        return format(d, 'hh:mm a');
      }
      return timeStr;
    } catch (e) {
      return timeStr;
    }
  };

  const renderSlotItem = ({ item }: { item: ResourceSlot }) => {
    const isSelected = selectedSlots.some(s => s.slotId === item.slotId);
    const isAvailable = item.status === 'AVAILABLE';

    return (
      <TouchableOpacity
        style={[
          styles.slotItem,
          { 
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
            opacity: isAvailable ? 1 : 0.5,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: 1,
          }
        ]}
        onPress={() => handleSlotSelect(item)}
        disabled={!isAvailable}
      >
        <Text style={[styles.slotTime, { color: isSelected ? '#FFF' : theme.colors.text }]}>
          {item.displayName || formatTime(item.startTime)}
        </Text>
        <Text style={[styles.slotPrice, { color: isSelected ? '#FFF' : theme.colors.primary }]}>
          ₹{item.price}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDateSelector = () => {
    const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
    
    return (
      <View style={styles.dateSelectorContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={dates}
          keyExtractor={(item) => item.toISOString()}
          contentContainerStyle={styles.dateList}
          renderItem={({ item }) => {
            const isSelected = isSameDay(item, selectedDate);
            return (
              <TouchableOpacity
                style={[
                  styles.dateItem,
                  { 
                    backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border
                  }
                ]}
                onPress={() => handleDateSelect(item)}
              >
                <Text style={[styles.dateDay, { color: isSelected ? '#FFF' : theme.colors.textSecondary }]}>
                  {format(item, 'EEE')}
                </Text>
                <Text style={[styles.dateNum, { color: isSelected ? '#FFF' : theme.colors.text }]}>
                  {format(item, 'dd')}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  return (
    <ScreenWrapper style={styles.container}>
      <ScreenHeader 
        title="Select Slot" 
        subtitle={resource.name}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Date</Text>
          {renderDateSelector()}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text, paddingHorizontal: s(20), marginTop: vs(20) }]}>
          Available Slots
        </Text>

        <FlatList
          data={slots}
          renderItem={renderSlotItem}
          numColumns={3}
          keyExtractor={(item) => item.slotId.toString()}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.slotRow}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={64} color={theme.colors.textSecondary + '50'} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No slots found
                </Text>
              </View>
            ) : (
              <View style={styles.loadingSlotsContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            )
          }
        />
        
        {selectedSlots.length > 0 && (
          <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.selectionInfo}>
              <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>
                {selectedSlots.length} {selectedSlots.length === 1 ? 'Slot' : 'Slots'} Selected
              </Text>
              <Text style={[styles.footerValue, { color: theme.colors.text }]}>
                ₹{selectedSlots.reduce((acc, s) => acc + s.price, 0)} Total
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleConfirmBooking}
            >
              <Text style={styles.bookButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  headerSection: {
    paddingHorizontal: s(20),
    paddingTop: vs(20),
  },
  loadingSlotsContainer: {
    padding: vs(20),
    alignItems: 'center',
  },
  listContainer: {
    padding: s(20),
    paddingBottom: vs(100),
  },
  sectionTitle: {
    fontSize: ms(13),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(12),
  },
  dateSelectorContainer: {
    marginHorizontal: -s(20),
  },
  dateList: {
    paddingHorizontal: s(20),
    gap: s(10),
  },
  dateItem: {
    width: s(45),
    height: vs(55),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  dateDay: {
    fontSize: ms(10),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateNum: {
    fontSize: ms(16),
    fontWeight: '700',
  },
  slotRow: {
    gap: s(10),
    marginBottom: vs(10),
  },
  slotItem: {
    flex: 1,
    height: vs(60),
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotTime: {
    fontSize: ms(12),
    fontWeight: '700',
  },
  slotPrice: {
    fontSize: ms(10),
    fontWeight: '600',
    marginTop: vs(2),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: s(20),
    borderTopWidth: 1,
    borderTopColor: '#00000005',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  selectionInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: ms(11),
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: ms(14),
    fontWeight: '700',
    marginTop: vs(2),
  },
  bookButton: {
    paddingHorizontal: s(24),
    paddingVertical: vs(12),
    borderRadius: ms(12),
  },
  bookButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: ms(14),
  },
  emptyContainer: {
    flex: 1,
    marginTop: vs(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: vs(16),
    fontSize: ms(16),
    fontWeight: '500',
  },
});

export default ManualBookingSlotScreen;
