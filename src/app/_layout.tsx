import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Poppins_500Medium } from "@expo-google-fonts/poppins/500Medium";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins/600SemiBold";
import { Poppins_700Bold } from "@expo-google-fonts/poppins/700Bold";
import { ActivityIndicator, Platform, View } from "react-native";
import {
  SessionProvider,
  useSession,
} from "../features/auth/context/SessionContext";
import { MobileProvider, useMobile } from "../features/mobile/store";
import { c } from "../features/mobile/theme";

function Navigation() {
  const { ready } = useMobile();
  const { role } = useSession();
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  if (!ready || (!loaded && !error))
    return (
      <View
        style={{ flex: 1, justifyContent: "center", backgroundColor: c.bg }}
      >
        <ActivityIndicator color={c.red} />
      </View>
    );
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Protected guard={role === "admin" && Platform.OS === "web"}>
          <Stack.Screen name="admin" />
        </Stack.Protected>
        <Stack.Screen name="mobile" />
        <Stack.Screen name="assistant" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
export default function Layout() {
  return (
    <SessionProvider>
      <MobileProvider>
        <Navigation />
      </MobileProvider>
    </SessionProvider>
  );
}
