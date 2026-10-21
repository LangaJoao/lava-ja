import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Button({ children, onPress, secondary = false }) {
  return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[s.button, secondary && s.secondary]}><Text style={[s.buttonText, secondary && { color: colors.primary }]}>{children}</Text></TouchableOpacity>;
}

export function Page({ children }) {
  const insets = useSafeAreaInsets();
  return <ScrollView style={s.page} contentContainerStyle={[s.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}>{children}</ScrollView>;
}

export function Header({ title, onLogout }) {
  return <View><Text style={s.eyebrow}>LAVA JÁ · MATOLA</Text><Text style={s.title}>{title}</Text>{onLogout && <Button secondary onPress={onLogout}>Sair da conta</Button>}<Text style={s.note}>Protótipo · dados de demonstração</Text></View>;
}

export const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, width: '100%', maxWidth: 600, alignSelf: 'center', gap: 16 },
  eyebrow: { color: colors.location, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', marginVertical: 12 },
  heading: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  body: { color: colors.textSecondary, fontSize: 16, lineHeight: 24 },
  note: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 12 },
  card: { backgroundColor: colors.cardBackground, borderColor: colors.disabled, borderWidth: 1, borderRadius: 20, padding: 20, gap: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, minHeight: 48, alignItems: 'center' },
  secondary: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.primary },
  buttonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
});
