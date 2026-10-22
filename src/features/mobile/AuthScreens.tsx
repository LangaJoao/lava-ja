import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  Platform,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useSession } from "../auth/context/SessionContext";
import { useMobile } from "./store";
import { c, photos } from "./theme";
import { homeFor, roleNames, services, type MobileRole } from "./data";
import { normalizePhone } from "./otp";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Header,
  Icon,
  IconButton,
  Logo,
  Pill,
  Row,
  Screen,
  Section,
  T,
  TextAction,
  s,
} from "./ui";

export async function pickPhoto(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
  });
  return result.canceled ? undefined : result.assets[0]?.uri;
}
export function SplashScreen() {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const timer = setTimeout(() => router.replace("/onboarding"), 1600);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continuar para escolha de perfil"
      onPress={() => router.replace("/onboarding")}
      style={{
        flex: 1,
        backgroundColor: c.red,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: 250,
          backgroundColor: "#FFFFFF08",
          right: -220,
        }}
      />
      <Logo light size={120} />
      <T
        kind="big"
        color={c.white}
        style={{ fontSize: 48, lineHeight: 65, marginTop: 20 }}
      >
        LAVA JÁ
      </T>
      <View
        style={{
          width: 40,
          height: 4,
          borderRadius: 3,
          backgroundColor: c.green,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 25,
          alignItems: "center",
          gap: 12,
        }}
      >
        <T kind="label" color={c.white}>
          Encontra. Reserva. Lava. Ganha.
        </T>
        <View
          style={{
            height: 4,
            width: 140,
            borderRadius: 5,
            backgroundColor: "#FFFFFF40",
          }}
        >
          <View
            style={{
              height: 4,
              width: 40,
              backgroundColor: c.green,
              borderRadius: 5,
            }}
          />
        </View>
      </View>
    </Pressable>
  );
}
export function OnboardingScreen() {
  const [selected, setSelected] = useState<MobileRole>("client");
  const { signIn } = useSession();
  return (
    <Screen
      footer={
        <>
          <Button
            title="Continuar para Registo"
            onPress={() =>
              router.push({ pathname: "/register", params: { role: selected } })
            }
          />
          <View style={{ alignItems: "center" }}>
            <TextAction
              title="Já tenho uma conta? Entrar"
              onPress={() =>
                router.push({ pathname: "/login", params: { role: selected } })
              }
            />
            <T kind="small" color={c.muted}>
              📍 Disponível em Maputo e Matola · Preços em MT
            </T>
            {Platform.OS === "web" && (
              <TextAction
                title="Administração web"
                onPress={() => {
                  signIn("admin");
                  router.replace("/admin");
                }}
              />
            )}
          </View>
        </>
      }
    >
      <View
        style={{
          height: 260,
          marginHorizontal: -22,
          marginTop: -22,
          justifyContent: "flex-end",
          padding: 25,
        }}
      >
        <Image
          source={photos.hero}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["#FFFFFF00", c.bg]}
          style={StyleSheet.absoluteFill}
        />
        <Logo size={80} />
        <T kind="big" color={c.red} style={{ marginTop: 12 }}>
          LAVA JÁ
        </T>
        <T kind="label" color={c.muted}>
          Encontra. Reserva. Lava. Ganha.
        </T>
      </View>
      <T kind="title">Como pretendes usar o Lava Já?</T>
      <T color={c.muted}>
        Escolha o perfil que melhor se adapta às suas necessidades em
        Moçambique.
      </T>
      {(["client", "carwash", "provider"] as MobileRole[]).map((role, i) => (
        <Pressable
          key={role}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === role }}
          onPress={() => setSelected(role)}
          style={[
            s.card,
            {
              borderWidth: selected === role ? 2 : 1,
              borderColor: selected === role ? c.red : c.border,
              backgroundColor: selected === role ? c.pink : c.white,
            },
          ]}
        >
          <Row>
            <View
              style={{
                backgroundColor: c.red,
                width: 52,
                height: 52,
                borderRadius: 30,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={(["account", "store", "car-wash"] as const)[i]}
                color={c.white}
              />
            </View>
            <View style={{ flex: 1 }}>
              <T kind="heading" color={selected === role ? c.red : c.text}>
                Sou {roleNames[role]}
              </T>
              <T kind="small" color={c.muted}>
                {
                  [
                    "Encontrar e reservar lavagens próximas para o meu veículo.",
                    "Gerir o meu estabelecimento, equipa e fluxo de reservas.",
                    "Receber pedidos e prestar serviços de lavagem.",
                  ][i]
                }
              </T>
            </View>
            {selected === role && <Icon name="check-circle" color={c.red} />}
          </Row>
        </Pressable>
      ))}
    </Screen>
  );
}
export function LoginScreen() {
  const params = useLocalSearchParams<{ role?: MobileRole }>();
  const [role, setRole] = useState<MobileRole>(
    params.role && params.role in roleNames ? params.role : "client",
  );
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useSession();
  const { updateProfile } = useMobile();
  const enter = () => {
    if (!contact.trim() || password.length < 4) {
      setError(
        "Indica o e-mail/telemóvel e uma palavra-passe com pelo menos 4 caracteres para a demonstração.",
      );
      return;
    }
    updateProfile({ contact });
    signIn(role);
    router.replace(homeFor(role));
  };
  return (
    <Screen>
      <LinearGradient
        colors={[c.red, c.navy]}
        style={{
          margin: -22,
          marginBottom: 4,
          padding: 25,
          paddingTop: 30,
          height: 220,
        }}
      >
        <IconButton
          name="arrow-left"
          label="Voltar"
          color={c.white}
          onPress={() => router.back()}
        />
        <Logo light size={66} />
        <T kind="title" color={c.white} style={{ marginTop: 12 }}>
          LAVA JÁ
        </T>
        <T color="#E0E4EB">Encontra. Reserva. Lava.</T>
      </LinearGradient>
      <T kind="title">Bem-vindo de volta</T>
      <T color={c.muted}>Inicie sessão para cuidar do seu veículo.</T>
      <Row style={{ flexWrap: "wrap" }}>
        {(Object.keys(roleNames) as MobileRole[]).map((r) => (
          <Pill
            key={r}
            title={roleNames[r]}
            selected={r === role}
            onPress={() => setRole(r)}
          />
        ))}
      </Row>
      <Field
        label="E-mail ou Telemóvel"
        icon="account-outline"
        placeholder="ex: +258 84..."
        value={contact}
        onChangeText={setContact}
        autoCapitalize="none"
        autoComplete="username"
      />
      <View style={{ gap: 8 }}>
        <Field
          label="Palavra-passe"
          icon="lock-outline"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!show}
          autoComplete="password"
        />
        <Row style={{ justifyContent: "space-between" }}>
          <TextAction
            title={show ? "Ocultar senha" : "Mostrar senha"}
            onPress={() => setShow(!show)}
          />
          <TextAction
            title="Esqueceu a senha?"
            onPress={() => router.push("/forgot-password")}
          />
        </Row>
      </View>
      {!!error && <T color={c.red}>{error}</T>}
      <Button title="Entrar agora" onPress={enter} />
      <T style={{ textAlign: "center" }}>ou entrar com</T>
      <Row>
        <Button
          style={{ flex: 1 }}
          secondary
          title="Google"
          icon="google"
          onPress={() =>
            setError(
              "A ligação ao Google ainda não está configurada. Usa o acesso de demonstração abaixo.",
            )
          }
        />
        <Button
          style={{ flex: 1 }}
          secondary
          title="Apple"
          icon="apple"
          onPress={() =>
            setError(
              "A ligação à Apple ainda não está configurada. Usa o acesso de demonstração abaixo.",
            )
          }
        />
      </Row>
      <Button
        secondary
        title={`Explorar como ${roleNames[role]}`}
        onPress={() => {
          signIn(role);
          router.replace(homeFor(role));
        }}
      />
      <T kind="small" color={c.muted}>
        Demonstração local. Não é feita autenticação real nem são guardadas
        palavras-passe.
      </T>
      <TextAction
        title="Não tem uma conta? Criar Conta"
        onPress={() => router.push({ pathname: "/register", params: { role } })}
      />
    </Screen>
  );
}
export function ForgotPasswordScreen() {
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Screen header={<Header title="Recuperar acesso" />}>
      <Logo />
      <T kind="title">Esqueceste a palavra-passe?</T>
      <T color={c.muted}>Indica o e-mail ou telemóvel associado à tua conta.</T>
      <Field
        label="E-mail ou Telemóvel"
        value={contact}
        onChangeText={setContact}
        autoCapitalize="none"
        placeholder="+258 84..."
      />
      <Button
        title="Pedir recuperação"
        disabled={!contact.trim()}
        onPress={() => setSent(true)}
      />
      {sent && (
        <Card>
          <T kind="heading">Pedido de demonstração</T>
          <T>
            O fluxo foi apresentado. O envio de SMS/e-mail depende da ligação ao
            serviço de autenticação.
          </T>
          <Button
            secondary
            title="Voltar a entrar"
            onPress={() => router.replace("/login")}
          />
        </Card>
      )}
    </Screen>
  );
}
export function RegisterScreen() {
  const params = useLocalSearchParams<{ role?: MobileRole }>();
  const role = params.role && params.role in roleNames ? params.role : "client";
  const { profile, updateProfile, requestOtp } = useMobile();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const next = () => {
    const phone = normalizePhone(contact);
    if (!name.trim() || !phone || password.length < 6 || !terms) {
      setError(
        "Preenche o nome, um telemóvel moçambicano válido, senha com 6 caracteres e aceita as condições da demonstração.",
      );
      return;
    }
    updateProfile({ name: name.trim(), contact: phone });
    requestOtp(phone, role);
    router.push({ pathname: "/verify-otp", params: { role } });
  };
  return (
    <Screen
      header={
        <Header
          title={`Registo de ${roleNames[role]}`}
          subtitle={role === "carwash" ? "Passo 1 de 3" : "Vamos começar"}
        />
      }
      footer={<Button title="Verificar número" onPress={next} />}
    >
      <T kind="title">Bem-vindo ao Lava Já</T>
      <T color={c.muted}>Cria o teu perfil e faz parte da nossa comunidade.</T>
      <Field
        label="Nome Completo"
        icon="account-outline"
        placeholder={profile.name}
        value={name}
        onChangeText={setName}
      />
      <Field
        label="Número de Telemóvel"
        icon="phone-outline"
        placeholder="+258 84..."
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      <Field
        label="Palavra-passe"
        icon="lock-outline"
        placeholder="Pelo menos 6 caracteres"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Row>
        <Switch
          accessibilityLabel="Aceitar condições"
          value={terms}
          onValueChange={setTerms}
          trackColor={{ true: c.red }}
        />
        <T style={{ flex: 1 }}>
          Aceito usar esta demonstração com dados locais.
        </T>
      </Row>
      <T kind="small" color={c.muted}>
        Registo demonstrativo: não cria uma conta num servidor.
      </T>
      {!!error && <T color={c.red}>{error}</T>}
    </Screen>
  );
}
export function OtpScreen() {
  const { role: requestedRole } = useLocalSearchParams<{ role?: MobileRole }>();
  const { challenge, requestOtp, verifyOtp } = useMobile();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!challenge || requestedRole !== challenge.role)
    return (
      <Screen header={<Header title="Verificar número" />}>
        <T>
          Preenche primeiro o registo para receberes o código de demonstração.
        </T>
        <Button
          title="Voltar ao registo"
          onPress={() =>
            router.replace({
              pathname: "/register",
              params: { role: requestedRole || "client" },
            })
          }
        />
      </Screen>
    );
  const role = challenge.role;
  const resendSeconds = Math.max(
    0,
    Math.ceil((challenge.resendAt - now) / 1000),
  );
  const expiry = Math.max(0, Math.ceil((challenge.expiresAt - now) / 1000));
  return (
    <Screen
      header={
        <Header title="Verifica o teu número" subtitle={roleNames[role]} />
      }
    >
      <View style={{ alignItems: "center" }}>
        <Icon name="cellphone-check" size={70} color={c.red} />
      </View>
      <T kind="title">Confirma o código OTP</T>
      <T color={c.muted}>Número: {challenge.phone}</T>
      <Card style={{ backgroundColor: c.pink }}>
        <T kind="label">Demonstração · nenhum SMS é enviado</T>
        <T>
          Usa o código {challenge.code}. Expira em {Math.floor(expiry / 60)}:
          {String(expiry % 60).padStart(2, "0")}.
        </T>
      </Card>
      <Field
        label="Código de 6 dígitos"
        placeholder="123456"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={6}
        value={code}
        onChangeText={(v) => setCode(v.replace(/\D/g, ""))}
      />
      <Button
        title="Confirmar número"
        disabled={code.length !== 6 || expiry === 0 || challenge.verified}
        onPress={() => {
          const message = verifyOtp(code);
          setError(message);
          if (!message)
            router.replace(
              role === "client"
                ? "/garage?register=1"
                : role === "carwash"
                  ? "/business-setup?register=1"
                  : "/provider-setup?register=1",
            );
        }}
      />
      <Button
        secondary
        title={
          resendSeconds ? `Reenviar em ${resendSeconds}s` : "Reenviar código"
        }
        disabled={resendSeconds > 0}
        onPress={() => {
          requestOtp(challenge.phone, role);
          setCode("");
          setError("");
          setNow(Date.now());
        }}
      />
      <TextAction
        title="Corrigir número de telemóvel"
        onPress={() =>
          router.replace({ pathname: "/register", params: { role } })
        }
      />
      {!!error && <T color={c.red}>{error}</T>}
    </Screen>
  );
}
export function GarageScreen() {
  const { register, id } = useLocalSearchParams<{
    register?: string;
    id?: string;
  }>();
  const { vehicles, saveVehicle, completeRegistration } = useMobile();
  const { signIn } = useSession();
  const existing = vehicles.find((v) => v.id === id);
  const [editingId, setEditingId] = useState(existing?.id || "");
  const [brand, setBrand] = useState(existing?.brand || "");
  const [plate, setPlate] = useState(existing?.plate || "");
  const [color, setColor] = useState(existing?.color || "");
  const [error, setError] = useState("");
  const save = (another = false) => {
    if (![brand, plate, color].every((v) => v.trim())) {
      setError("Preenche todos os detalhes do veículo.");
      return;
    }
    if (register && !completeRegistration("client")) {
      setError("Verifica o número por OTP antes de concluir o registo.");
      return;
    }
    saveVehicle({
      id: editingId || `vehicle-${Date.now()}`,
      brand,
      plate: plate.toUpperCase(),
      color,
    });
    if (another) {
      setEditingId("");
      setBrand("");
      setPlate("");
      setColor("");
      setError("Veículo guardado. Adiciona o próximo.");
    } else {
      if (!register && router.canGoBack()) router.back();
      else {
        signIn("client");
        router.replace("/mobile/client");
      }
    }
  };
  return (
    <Screen
      footer={
        <>
          <Button title="Guardar e continuar" onPress={() => save()} />
          <TextAction
            title="＋ Adicionar outro veículo"
            onPress={() => save(true)}
          />
        </>
      }
    >
      <View
        style={{
          backgroundColor: c.navy,
          margin: -22,
          marginBottom: 0,
          padding: 22,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          gap: 18,
        }}
      >
        <Row>
          <IconButton
            name="arrow-left"
            label="Voltar"
            color={c.white}
            onPress={() => router.back()}
          />
          {register && <Badge title="Passo 2 de 2" />}
        </Row>
        <T kind="title" color={c.white}>
          Que carro pretendes lavar?
        </T>
        <T color="#CDD3DD">
          Isso ajuda-nos a sugerir os melhores preços e serviços para o teu
          tamanho de veículo.
        </T>
        <Image
          source={photos.silver}
          resizeMode="contain"
          style={{
            width: 190,
            height: 115,
            alignSelf: "center",
            borderRadius: 60,
          }}
        />
      </View>
      {vehicles.length > 0 && (
        <>
          <T kind="label" color={c.muted}>
            O teu veículo actual
          </T>
          {vehicles.map((v, i) => (
            <Card key={v.id}>
              <Row>
                <Icon name="car" color={c.red} size={32} />
                <View style={{ flex: 1 }}>
                  <T kind="heading">{v.brand}</T>
                  <T color={c.muted}>
                    {v.brand} · {v.plate}
                  </T>
                </View>
                {i === 0 && <Badge title="Principal" />}
                <IconButton
                  name="pencil"
                  label={`Editar ${v.brand}`}
                  onPress={() => {
                    setEditingId(v.id);
                    setBrand(v.brand);
                    setPlate(v.plate);
                    setColor(v.color);
                    setError("");
                  }}
                />
              </Row>
            </Card>
          ))}
        </>
      )}
      <Section title="Detalhes do Veículo" />
      <Field
        label="Marca do Carro"
        icon="star-circle"
        placeholder="Ex: Toyota, Ford, Nissan"
        value={brand}
        onChangeText={setBrand}
      />
      <Field
        label="Matrícula"
        icon="card-account-details"
        placeholder="AAA-000-MC"
        value={plate}
        onChangeText={setPlate}
        autoCapitalize="characters"
      />
      <Field
        label="Cor"
        icon="palette"
        placeholder="Branco"
        value={color}
        onChangeText={setColor}
      />
      <Card style={{ backgroundColor: "#EAF0FA" }}>
        <T color={c.muted}>
          Dica: A matrícula permite que o Car Wash te identifique mal chegues ao
          local.
        </T>
      </Card>
      {!!error && <T color={c.red}>{error}</T>}
    </Screen>
  );
}
export function BusinessSetupScreen() {
  const { register } = useLocalSearchParams<{ register?: string }>();
  const { profile, updateProfile } = useMobile();
  const [business, setBusiness] = useState(profile.business);
  const [address, setAddress] = useState(profile.address);
  const [open, setOpen] = useState(profile.open);
  const [close, setClose] = useState(profile.close);
  const [enabled, setEnabled] = useState(profile.enabledServices);
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(
      services.map((s) => [
        s.id,
        String(profile.servicePrices[s.id] ?? s.price),
      ]),
    ),
  );
  const [moza, setMoza] = useState(profile.moza);
  const [mobile, setMobile] = useState(profile.mobile);
  const [notice, setNotice] = useState("");
  const save = (next: boolean) => {
    if (
      !business.trim() ||
      !address.trim() ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(open) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(close) ||
      close <= open ||
      !enabled.length ||
      enabled.some(
        (id) => !Number.isFinite(Number(prices[id])) || Number(prices[id]) <= 0,
      )
    ) {
      setNotice(
        "Verifica o nome, endereço, horários (HH:MM), serviços e preços positivos. O fecho deve ser depois da abertura.",
      );
      return;
    }
    updateProfile({
      business,
      address,
      open,
      close,
      moza,
      mobile,
      enabledServices: enabled,
      servicePrices: Object.fromEntries(
        Object.entries(prices).map(([id, price]) => [id, Number(price)]),
      ),
    });
    if (next)
      router.push(
        register ? "/business-photos?register=1" : "/business-photos",
      );
    else setNotice("Rascunho guardado neste dispositivo.");
  };
  return (
    <Screen
      header={
        <Header
          title="O teu Car Wash"
          subtitle="Passo 2 de 3 · Configura o teu estabelecimento"
        />
      }
      footer={
        <>
          <Button title="Continuar para Fotos" onPress={() => save(true)} />
          <TextAction title="Guardar Rascunho" onPress={() => save(false)} />
        </>
      }
    >
      <Section title="Detalhes do Negócio" />
      <Card>
        <Field
          label="Nome do Estabelecimento"
          icon="store"
          value={business}
          onChangeText={setBusiness}
        />
        <Field
          label="Localização / Endereço"
          icon="map-marker"
          value={address}
          onChangeText={setAddress}
        />
        <Row>
          <View style={{ flex: 1 }}>
            <Field
              label="Abertura"
              value={open}
              onChangeText={setOpen}
              placeholder="08:00"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Fecho"
              value={close}
              onChangeText={setClose}
              placeholder="18:00"
            />
          </View>
        </Row>
      </Card>
      <Section title="Serviços e Preços (MT)" />
      <Card>
        {services.map((service) => (
          <View key={service.id}>
            <Row>
              <IconButton
                name={
                  enabled.includes(service.id)
                    ? "checkbox-marked-circle"
                    : "checkbox-blank-circle-outline"
                }
                color={c.red}
                label={`Seleccionar ${service.name}`}
                onPress={() =>
                  setEnabled((v) =>
                    v.includes(service.id)
                      ? v.filter((id) => id !== service.id)
                      : [...v, service.id],
                  )
                }
              />
              <View style={{ flex: 1 }}>
                <T>{service.name}</T>
                <T kind="small" color={c.muted}>
                  {service.description}
                </T>
              </View>
              <View style={{ width: 85 }}>
                <Field
                  label="MT"
                  value={prices[service.id]}
                  onChangeText={(value) =>
                    setPrices((p) => ({ ...p, [service.id]: value }))
                  }
                  keyboardType="numeric"
                />
              </View>
            </Row>
          </View>
        ))}
      </Card>
      <Card>
        <Row>
          <Switch
            accessibilityLabel="Aceitar pagamentos via Moza"
            value={moza}
            onValueChange={setMoza}
            trackColor={{ true: c.red }}
          />
          <T style={{ flex: 1 }}>Aceitar pagamentos via Moza</T>
        </Row>
        <Row>
          <Switch
            accessibilityLabel="Serviço ao domicílio"
            value={mobile}
            onValueChange={setMobile}
            trackColor={{ true: c.red }}
          />
          <T style={{ flex: 1 }}>Serviço ao domicílio disponível</T>
        </Row>
      </Card>
      {!!notice && <T color={c.red}>{notice}</T>}
    </Screen>
  );
}
export function BusinessPhotosScreen() {
  const { register } = useLocalSearchParams<{ register?: string }>();
  const { profile, updateProfile, completeRegistration } = useMobile();
  const { signIn } = useSession();
  const [error, setError] = useState("");
  async function add() {
    try {
      const uri = await pickPhoto();
      if (uri)
        updateProfile({ businessPhotos: [...profile.businessPhotos, uri] });
    } catch {
      setError(
        "Não foi possível abrir a galeria. Podes continuar sem fotografia.",
      );
    }
  }
  return (
    <Screen
      header={
        <Header
          title="Mostra o teu espaço"
          subtitle="Passo 3 de 3 · Fotografias"
        />
      }
      footer={
        <Button
          title="Concluir e abrir o meu Car Wash"
          onPress={() => {
            if (register && !completeRegistration("carwash")) {
              setError("Verifica primeiro o número por OTP.");
              return;
            }
            signIn("carwash");
            router.replace("/mobile/carwash");
          }}
        />
      }
    >
      <T kind="title">Uma boa primeira impressão</T>
      <T color={c.muted}>
        Adiciona fotografias do estabelecimento. Também podes fazê-lo mais
        tarde.
      </T>
      <Button
        secondary
        title="Adicionar fotografia"
        icon="camera-plus"
        onPress={add}
      />
      {profile.businessPhotos.map((uri) => (
        <Card key={uri}>
          <Image source={{ uri }} style={{ height: 190, borderRadius: 15 }} />
          <TextAction
            title="Remover fotografia"
            onPress={() =>
              updateProfile({
                businessPhotos: profile.businessPhotos.filter((p) => p !== uri),
              })
            }
          />
        </Card>
      ))}
      {!!error && <T color={c.red}>{error}</T>}
    </Screen>
  );
}
export function ProviderSetupScreen() {
  const { register } = useLocalSearchParams<{ register?: string }>();
  const { profile, updateProfile, completeRegistration } = useMobile();
  const { signIn } = useSession();
  const [name, setName] = useState(profile.name);
  const [experience, setExperience] = useState(profile.experience);
  const [specialties, setSpecialties] = useState(profile.specialties);
  const [open, setOpen] = useState(profile.open);
  const [close, setClose] = useState(profile.close);
  const [level, setLevel] = useState(profile.level);
  const [error, setError] = useState("");
  async function photo() {
    try {
      const uri = await pickPhoto();
      if (uri) updateProfile({ photo: uri });
    } catch {
      setError("Não foi possível abrir a galeria. Tenta novamente.");
    }
  }
  const finish = () => {
    if (
      !name.trim() ||
      !specialties.length ||
      !/^\d+$/.test(experience) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(open) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(close) ||
      close <= open
    ) {
      setError(
        "Verifica o nome, experiência, especialidades e horário (HH:MM).",
      );
      return;
    }
    updateProfile({ name, experience, specialties, open, close, level });
    if (register && !completeRegistration("provider")) {
      setError("Verifica primeiro o número por OTP.");
      return;
    }
    signIn("provider");
    router.replace("/mobile/provider");
  };
  return (
    <Screen
      header={
        <Header
          title="Registo de Prestador"
          subtitle="Torna-te um profissional LAVA JÁ"
        />
      }
      footer={<Button title="Concluir registo" onPress={finish} />}
    >
      <View style={{ alignItems: "center", gap: 12 }}>
        <Avatar name={name} photo={profile.photo} />
        <TextAction title="Adicionar foto profissional" onPress={photo} />
      </View>
      <Field
        label="Nome Completo"
        icon="account-outline"
        value={name}
        onChangeText={setName}
        placeholder="Ex: Arnaldo Mondlane"
      />
      <Field
        label="Anos de Experiência"
        icon="medal-outline"
        value={experience}
        onChangeText={setExperience}
        keyboardType="numeric"
      />
      <Section title="Serviços que Realiza" />
      <Row style={{ flexWrap: "wrap" }}>
        {[
          "Lavagem Móvel",
          "Polimento",
          "Limpeza de Estofos",
          "Motor & Chassis",
          "Enceramento",
        ].map((item) => (
          <Pill
            key={item}
            title={item}
            selected={specialties.includes(item)}
            onPress={() =>
              setSpecialties((v) =>
                v.includes(item) ? v.filter((s) => s !== item) : [...v, item],
              )
            }
          />
        ))}
      </Row>
      <Card>
        <Row>
          <Icon name="clock-outline" color={c.red} />
          <T kind="heading">Horário de Trabalho</T>
        </Row>
        <T color={c.muted}>Seg - Sáb</T>
        <Row>
          <View style={{ flex: 1 }}>
            <Field label="Início" value={open} onChangeText={setOpen} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Fim" value={close} onChangeText={setClose} />
          </View>
        </Row>
      </Card>
      <Section title="Nível de Especialidade" />
      <Row style={{ flexWrap: "wrap" }}>
        {["Iniciante", "Intermédio", "Especialista"].map((v) => (
          <Pill
            key={v}
            title={v}
            selected={level === v}
            onPress={() => setLevel(v)}
          />
        ))}
      </Row>
      {!!error && <T color={c.red}>{error}</T>}
    </Screen>
  );
}
