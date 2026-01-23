import React from 'react';
import { Ionicons } from '@expo/vector-icons';
const Icon = ({ size = 24, color = '#000' }: { size?: number, color?: string }) => <Ionicons name="location" size={size} color={color} />;
export default Icon;
