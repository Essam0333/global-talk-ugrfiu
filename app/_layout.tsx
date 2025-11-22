
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { View, ActivityIndicator } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('SplashScreen.preventAutoHideAsync failed');
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded || fontError) {
          console.log('Fonts loaded:', fontsLoaded, 'Error:', fontError);
          await SplashScreen.hideAsync();
          setAppIsReady(true);
        }
      } catch (e) {
        console.error('Error preparing app:', e);
        setAppIsReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <ChatProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="group/create" options={{ headerShown: false }} />
            <Stack.Screen name="starred" options={{ headerShown: false }} />
            <Stack.Screen name="privacy" options={{ headerShown: false }} />
          </Stack>
        </ChatProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
