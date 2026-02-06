import React from 'react';
import { Ionicons } from '@expo/vector-icons';
const Icon = ({
  width = 24,
  height = 24,
  fill = '#000',
}: {
  width?: number;
  height?: number;
  fill?: string;
}) => <Ionicons name="arrow-back" size={width} color={fill} />;
export default Icon;
