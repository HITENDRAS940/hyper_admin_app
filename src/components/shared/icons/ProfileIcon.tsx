import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

const ProfileIcon = ({ size = 24, color }: { size?: number, color?: string }) => {
  const { theme } = useTheme();
  return <Ionicons name="person-circle" size={size} color={color || theme.colors.primary} />;
};

export default ProfileIcon;
