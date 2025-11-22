
import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  console.log('Index screen - isAuthenticated:', isAuthenticated);
  console.log('Index screen - user:', user);

  // Show loading while checking auth state
  if (isAuthenticated === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on authentication status
  if (isAuthenticated && user) {
    console.log('Redirecting to home screen');
    return <Redirect href="/(tabs)/(home)/" />;
  }

  console.log('Redirecting to welcome screen');
  return <Redirect href="/welcome" />;
}
