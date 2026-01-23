import React, { createContext, useContext, useState, useEffect } from 'react';
import { ManagerUser } from '../types';
import { setLogoutCallback } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: ManagerUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AUTH_TOKEN_KEY = 'token';

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ManagerUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setLogoutCallback(() => {
      logout();
    });
    checkPersistedToken();
  }, []);

  const checkPersistedToken = async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        const payload = decodeJWT(token);
        if (payload && payload.role === 'ROLE_ADMIN') {
          setUser({
            id: payload.userId.toString(),
            name: payload.name,
            role: 'admin',
            isActive: true,
            email: payload.sub,
            phone: payload.phone
          });
        }
      }
    } catch (error) {
      console.error('Failed to check persisted token:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const login = async (token: string) => {
    setIsLoading(true);
    try {
      const payload = decodeJWT(token);
      if (!payload || payload.role !== 'ROLE_ADMIN') {
        throw new Error('Access denied. Admin role required.');
      }
      
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      setUser({
        id: payload.userId.toString(),
        name: payload.name,
        role: 'admin',
        isActive: true,
        email: payload.sub,
        phone: payload.phone
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
