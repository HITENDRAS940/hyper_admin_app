import React, { createContext, useContext, useState } from 'react';
import { ManagerUser } from '../types';
import { setAuthToken } from '../services/api';

interface AuthContextType {
  user: ManagerUser | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

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

  const login = async (token: string) => {
    setIsLoading(true);
    try {
      const payload = decodeJWT(token);
      setAuthToken(token);
      if (!payload || payload.role !== 'ROLE_ADMIN') {
        throw new Error('Access denied. Admin role required.');
      }

      setUser({
        id: payload.userId.toString(),
        name: payload.name,
        role: 'admin',
        isActive: true,
        phone: payload.sub
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
