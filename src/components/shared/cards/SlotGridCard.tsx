import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { s, vs, ms } from 'react-native-size-matters';
import { useTheme } from '../../../contexts/ThemeContext';

interface ServiceSlot {
  id: number;
  slotId: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
}

interface SlotGridCardProps {
  slots: ServiceSlot[];
  bookedSlotIds: number[];
  disabledSlotIds: number[];
  onSlotPress?: (slot: ServiceSlot) => void;
}

const SlotGridCard: React.FC<SlotGridCardProps> = ({ 
  slots, 
  bookedSlotIds, 
  disabledSlotIds,
  onSlotPress 
}) => {
  const { theme } = useTheme();

  const getSlotStatus = (slot: ServiceSlot) => {
    if (bookedSlotIds.includes(Number(slot.slotId)) || bookedSlotIds.includes(Number(slot.id))) {
      return 'booked';
    }
    if (disabledSlotIds.includes(Number(slot.slotId)) || disabledSlotIds.includes(Number(slot.id)) || !slot.enabled) {
      return 'disabled';
    }
    return 'available';
  };

  const getStatusColor = (status: 'booked' | 'disabled' | 'available') => {
    switch (status) {
      case 'booked': return '#EF4444'; // Red
      case 'disabled': return '#94A3B8'; // Grey
      case 'available': return '#10B981'; // Green
    }
  };

  const formatTime = (time: string) => {
    // Handle ISO strings or HH:mm
    if (!time) return '';
    if (time.includes('T')) {
      const date = new Date(time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return time;
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {slots.map((slot, index) => {
          const status = getSlotStatus(slot);
          const statusColor = getStatusColor(status);
          
          return (
            <TouchableOpacity
              key={slot.id || index}
              style={[
                styles.slotItem,
                { borderColor: statusColor + '40', backgroundColor: statusColor + '10' }
              ]}
              onPress={() => onSlotPress?.(slot)}
              activeOpacity={0.7}
            >
              <Text style={[styles.timeText, { color: statusColor }]}>
                {formatTime(slot.startTime)}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.priceText, { color: theme.colors.textSecondary }]}>
                ₹{slot.price}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#94A3B8' }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Blocked</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: s(10),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: s(-5),
  },
  slotItem: {
    width: (s(360) - s(60)) / 4, // Approx 4 columns with padding
    aspectRatio: 1,
    margin: s(5),
    borderRadius: ms(8),
    borderWidth: 1,
    padding: s(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: ms(11),
    fontWeight: 'bold',
  },
  statusDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    marginVertical: vs(4),
  },
  priceText: {
    fontSize: ms(10),
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: vs(15),
    paddingTop: vs(15),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    marginRight: s(5),
  },
  legendText: {
    fontSize: ms(12),
  },
});

export default SlotGridCard;
