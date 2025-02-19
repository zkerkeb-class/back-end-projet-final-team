'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/utils/axios';
interface User {
  id: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    const token = await localStorage.getItem('accessToken');
    if (token) {
      try {
        // Verify token validity with getMe
        const response = await api.get('/auth/getMe');
        console.log('User details: ', response.data);
        const userData = {
          id: response.data.userId,
          email: response.data.email,
          token: response.data.accessToken,
        };
        setUser(userData);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
      }
    }
    setIsLoading(false);
  };

  // Check auth on mount and when route changes
  useEffect(() => {
    checkAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/auth/login',
        {
          email,
          password,
        },
      );

      console.log(response.data);
      const userData = {
        id: response.data.user.id,
        email: response.data.user.email,
        token: response.data.accessToken,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', userData.token);
      setUser(userData);
      router.push('/jams');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
