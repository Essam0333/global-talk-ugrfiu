
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  updateUser: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: true,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      console.log('Loading user from storage...');
      const userJson = await AsyncStorage.getItem('user');
      
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log('User loaded successfully:', user.username);
        setAuthState({
          isAuthenticated: true,
          user,
          token: 'default_token',
        });
      } else {
        console.log('No user found, creating default user...');
        const defaultUser: User = {
          id: `user_${Date.now()}`,
          username: 'user',
          displayName: 'User',
          preferredLanguage: 'en',
          contacts: [],
        };
        await AsyncStorage.setItem('user', JSON.stringify(defaultUser));
        console.log('Default user created:', defaultUser.username);
        setAuthState({
          isAuthenticated: true,
          user: defaultUser,
          token: 'default_token',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      const defaultUser: User = {
        id: `user_${Date.now()}`,
        username: 'user',
        displayName: 'User',
        preferredLanguage: 'en',
        contacts: [],
      };
      setAuthState({
        isAuthenticated: true,
        user: defaultUser,
        token: 'default_token',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!authState.user) {
      console.log('No user to update');
      return;
    }

    try {
      console.log('Updating user with:', updates);
      const updatedUser = { ...authState.user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      
      console.log('User updated successfully');
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ ...authState, updateUser }}>
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
