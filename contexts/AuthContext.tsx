
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, displayName: string, language: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userJson = await AsyncStorage.getItem('user');
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        setAuthState({
          isAuthenticated: true,
          user,
          token,
        });
      }
    } catch (error) {
      console.log('Error loading auth state:', error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if user exists in storage
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      const user = users.find((u: any) => u.username === username && u.password === password);
      
      if (user) {
        const token = `token_${Date.now()}`;
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        setAuthState({
          isAuthenticated: true,
          user,
          token,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const signup = async (
    username: string,
    password: string,
    displayName: string,
    language: string
  ): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if username already exists
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      if (users.find((u: any) => u.username === username)) {
        return false;
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        displayName,
        preferredLanguage: language,
        contacts: [],
      };

      users.push({ ...newUser, password });
      await AsyncStorage.setItem('users', JSON.stringify(users));

      const token = `token_${Date.now()}`;
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));

      setAuthState({
        isAuthenticated: true,
        user: newUser,
        token,
      });

      return true;
    } catch (error) {
      console.log('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!authState.user) return;

    try {
      const updatedUser = { ...authState.user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      // Update in users list
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      const userIndex = users.findIndex((u: any) => u.id === updatedUser.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
    } catch (error) {
      console.log('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
