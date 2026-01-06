import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { LocationProvider } from '../contexts/LocationContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
// import FlashMessage from 'react-native-flash-message';

export default function RootLayout() {
  // useFrameworkReady();

  return (
    <AuthProvider>
      <AuthGuard>
        <NotificationProvider>
          <LocationProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            {/* <FlashMessage position="top" /> */}
          </LocationProvider>
        </NotificationProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
