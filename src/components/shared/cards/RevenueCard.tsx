import React from 'react';
import { View, Text } from 'react-native';

interface RevenueCardProps {
  data: {
    totalRevenue: number;
    totalBookings: number;
    bookedSlots: number;
    availableSlots: number;
  };
}

const RevenueCard: React.FC<RevenueCardProps> = ({ data }) => (
  <View>
    <Text>Revenue: {data.totalRevenue}</Text>
  </View>
);

export default RevenueCard;
