// hooks/useAuth.ts
'use client';

import { useEffect, useState, useCallback, useContext, createContext } from 'react';
import { login, logout, getCurrentUser, verifyToken, refreshToken } from '@/lib/api';

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const EXPIRY_KEY = 'token_expiry';
const REFRESH_INTERVAL = 50 * 60 * 1000; // Refresh token every 50 minutes (1 hour expiry)

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef: { current: NodeJS.Timeout | null } = { current: null };

  // Load token from localStorage on mount
  useEffect(() => {
    const loadToken = () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const expiry = localStorage.getItem(EXPIRY_KEY);

        if (savedToken && expiry) {
          const expiryTime = new Date(expiry).getTime();
          const now = new Date().getTime();

          if (now < expiryTime) {
            setToken(savedToken);
            // Fetch user data
            fetchUser(savedToken);
          } else {
            // Token expired, clear it
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(EXPIRY_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Set up auto token refresh
  useEffect(() => {
    if (token) {
      // Clear existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up new interval
      refreshIntervalRef.current = setInterval(async () => {
        try {
          await handleRefreshToken();
        } catch (error) {
          console.error('Error refreshing token:', error);
          handleLogout();
        }
      }, REFRESH_INTERVAL);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [token]);

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const response = await getCurrentUser(authToken);
      setUser(response.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      handleLogout();
    }
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await login({ email, password });

      const { token: newToken, expiresAt, user } = response;
      setToken(newToken);
      setUser(user);

      // Store token and expiry in localStorage
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(EXPIRY_KEY, expiresAt);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      if (token) {
        await logout(token);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EXPIRY_KEY);

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
  }, [token]);

  const handleRefreshToken = useCallback(async () => {
    if (!token) return;

    try {
      const response = await refreshToken(token);
      const { token: newToken, expiresAt } = response;

      setToken(newToken);
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(EXPIRY_KEY, expiresAt);
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }, [token]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login: handleLogin,
    logout: handleLogout,
    refresh: handleRefreshToken,
  };
}
