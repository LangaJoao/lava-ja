import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { type ComponentProps, type ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
  type ColorValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { c, fonts, photos } from "./theme";
export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
export function Icon({
  name,
  size = 24,
  color = c.text,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
export function T({
  children,
  kind = "body",
  color,
  style,
}: {
  children: ReactNode;
  kind?: "body" | "title" | "heading" | "label" | "small" | "big";
  color?: string;
  style?: ComponentProps<typeof Text>["style"];
}) {
  return (
    <Text style={[s[kind], color ? { color } : null, style]}>{children}</Text>
  );
}
export function Row({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.row, style]}>{children}</View>;
}
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Button({
  title,
  onPress,
  secondary,
  disabled,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <Row style={{ justifyContent: "center", gap: 9 }}>
        {icon && (
          <Icon name={icon} size={21} color={secondary ? c.red : c.white} />
        )}
        <T
          kind="label"
          color={secondary ? c.red : c.white}
          style={{ textAlign: "center" }}
        >
          {title}
        </T>
      </Row>
    </Pressable>
  );
}
export function TextAction({
  title,
  onPress,
  color = c.red,
}: {
  title: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ paddingVertical: 12, minHeight: 44, justifyContent: "center" }}
    >
      <T kind="label" color={color}>
        {title}
      </T>
    </Pressable>
  );
}
export function IconButton({
  name,
  onPress,
  label,
  color = c.text,
}: {
  name: IconName;
  onPress: () => void;
  label: string;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={s.iconButton}
    >
      <Icon name={name} color={color} />
    </Pressable>
  );
}
export function Field({
  label,
  icon,
  error,
  ...props
}: TextInputProps & { label: string; icon?: IconName; error?: string }) {
  return (
    <View style={{ gap: 7 }}>
      <T kind="label">{label}</T>
      <Row style={[s.inputWrap, error ? { borderColor: c.red } : null]}>
        {icon && <Icon name={icon} size={21} />}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor="#94A3B8"
          style={s.input}
          {...props}
        />
      </Row>
      {error && (
        <T kind="small" color={c.red}>
          {error}
        </T>
      )}
    </View>
  );
}
export function Pill({
  title,
  selected,
  onPress,
  icon,
}: {
  title: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[
        s.pill,
        selected && { backgroundColor: c.red, borderColor: c.red },
      ]}
    >
      <Row style={{ gap: 7 }}>
        {icon && (
          <Icon name={icon} size={18} color={selected ? c.white : c.red} />
        )}
        <T kind="small" color={selected ? c.white : c.text}>
          {title}
        </T>
      </Row>
    </Pressable>
  );
}
export function Badge({
  title,
  color = c.green,
}: {
  title: string;
  color?: string;
}) {
  return (
    <View
      style={{
        backgroundColor: color === c.green ? c.mint : c.pink,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: "flex-start",
      }}
    >
      <T kind="small" color={color}>
        {title}
      </T>
    </View>
  );
}
export function Header({
  title,
  subtitle,
  back = true,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  return (
    <Row style={s.header}>
      {back && (
        <IconButton
          name="arrow-left"
          label="Voltar"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/onboarding")
          }
        />
      )}
      <View style={{ flex: 1 }}>
        <T kind="heading">{title}</T>
        {subtitle && (
          <T kind="small" color={c.muted}>
            {subtitle}
          </T>
        )}
      </View>
      {right}
    </Row>
  );
}
export function Screen({
  children,
  header,
  footer,
  dark,
  scroll = true,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  dark?: boolean;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: dark ? c.navy : c.bg,
        paddingTop: insets.top,
      }}
    >
      {header}
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
      {footer && (
        <View
          style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
      <T kind="heading">{title}</T>
      {action && onPress && <TextAction title={action} onPress={onPress} />}
    </Row>
  );
}
export function Empty({ title, message }: { title: string; message: string }) {
  return (
    <Card style={{ alignItems: "center", paddingVertical: 32 }}>
      <Icon name="calendar-blank-outline" size={38} color={c.muted} />
      <T kind="heading">{title}</T>
      <T color={c.muted} style={{ textAlign: "center" }}>
        {message}
      </T>
    </Card>
  );
}
export function Logo({ light, size = 80 }: { light?: boolean; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.31,
        backgroundColor: light ? c.white : c.red,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon
        name="car-wash"
        size={size * 0.58}
        color={light ? c.red : c.white}
      />
    </View>
  );
}
export function Avatar({ name, photo }: { name: string; photo?: string }) {
  return photo ? (
    <Image source={{ uri: photo }} style={s.avatar} />
  ) : (
    <View style={s.avatar}>
      <T kind="heading" color={c.red}>
        {name
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")}
      </T>
    </View>
  );
}
export function MapPreview({ onSelect }: { onSelect?: (id: string) => void }) {
  return (
    <View style={{ height: 190, borderRadius: 22, overflow: "hidden" }}>
      <Image
        source={photos.map}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
      {onSelect &&
        ["brilho", "liberdade", "uem"].map((id, i) => (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={`Ver ${id}`}
            onPress={() => onSelect(id)}
            style={{
              position: "absolute",
              left: `${[20, 34, 64][i]}%`,
              top: [34, 75, 45][i],
              width: 44,
              height: 44,
              borderRadius: 30,
              padding: 6,
            }}
          >
            <View />
          </Pressable>
        ))}
      <View
        style={{
          position: "absolute",
          right: 4,
          bottom: 2,
          backgroundColor: "#FFFFFFE8",
          paddingHorizontal: 5,
        }}
      >
        <T kind="small" style={{ fontSize: 10 }}>
          © OpenStreetMap contributors · referência
        </T>
      </View>
    </View>
  );
}
export const s = StyleSheet.create({
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: c.text,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 36,
    color: c.text,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 28,
    color: c.text,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 21,
    color: c.text,
  },
  small: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: c.text,
  },
  big: { fontFamily: fonts.bold, fontSize: 36, lineHeight: 47, color: c.text },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  card: {
    backgroundColor: c.white,
    borderRadius: 22,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: c.border,
  },
  content: {
    padding: 22,
    gap: 22,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  button: {
    backgroundColor: c.red,
    borderRadius: 21,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 50,
    justifyContent: "center",
  },
  secondary: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: "#CDD7E5",
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 49,
    backgroundColor: c.white,
    gap: 9,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingVertical: 10,
    color: c.text,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  pill: {
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.white,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    minHeight: 44,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 17,
    backgroundColor: c.white,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  footer: {
    backgroundColor: c.white,
    padding: 22,
    gap: 12,
    borderTopWidth: 1,
    borderColor: c.border,
  },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 8 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: c.pink,
    alignItems: "center",
    justifyContent: "center",
  },
});
