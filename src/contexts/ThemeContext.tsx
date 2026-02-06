import React, { createContext, useContext, useState } from 'react';

const colors = {
  primary: '#0F172A', // Darker navy/black
  secondary: '#6366F1', // Premium Indigo
  background: '#F8F9FA', // Clean light background
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  gray: '#94A3B8',
  card: '#FFFFFF',
  shadow: '#000000',
  accent: '#A5B4FC', // Light indigo for progress bars
};

const theme = {
  colors,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
};

type Theme = typeof theme;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Logic to switch theme colors would go here
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
