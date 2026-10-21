import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SessionProvider, useSession } from '../features/auth/context/SessionContext';

function Navigation() {
  const { role } = useSession();
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Protected guard={role === 'client' && Platform.OS !== 'web'}><Stack.Screen name="client" /></Stack.Protected>
    <Stack.Protected guard={role === 'admin' && Platform.OS === 'web'}><Stack.Screen name="admin" /></Stack.Protected>
  </Stack>;
}

export default function Layout() {
  return <SessionProvider><StatusBar style="dark" /><Navigation /></SessionProvider>;
}
