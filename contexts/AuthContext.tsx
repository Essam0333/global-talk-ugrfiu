
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  updateUser: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: true, // Always authenticated
    user: null,
    token: null,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('Loading user...');
      const userJson = await AsyncStorage.getItem('user');
      
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log('User loaded:', user);
        setAuthState({
          isAuthenticated: true,
          user,
          token: 'default_token',
        });
      } else {
        // Create a default user
        const defaultUser: User = {
          id: 'user_default',
          username: 'user',
          displayName: 'User',
          preferredLanguage: 'en',
          contacts: [],
        };
        await AsyncStorage.setItem('user', JSON.stringify(defaultUser));
        console.log('Default user created:', defaultUser);
        setAuthState({
          isAuthenticated: true,
          user: defaultUser,
          token: 'default_token',
        });
      }
    } catch (error) {
      console.log('Error loading user:', error);
      // Even on error, create a default user
      const defaultUser: User = {
        id: 'user_default',
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
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!authState.user) return;

    try {
      console.log('Updating user:', updates);
      const updatedUser = { ...authState.user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      
      console.log('User updated successfully');
    } catch (error) {
      console.log('Update user error:', error);
    }
  };

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
