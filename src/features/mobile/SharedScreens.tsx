import { useState } from "react";
import { Redirect, router, Tabs, useLocalSearchParams } from "expo-router";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../auth/context/SessionContext";
import { useMobile } from "./store";
import { dayKey, periodRange, reportFor } from "./finance";
import { c, photos } from "./theme";
import { homeFor, money, roleNames, type MobileRole } from "./data";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Field,
  Header,
  Icon,
  type IconName,
  IconButton,
  MapPreview,
  Pill,
  Row,
  Screen,
  Section,
  T,
  TextAction,
} from "./ui";
import { Chart } from "./OperationScreens";
import { pickPhoto } from "./AuthScreens";

const tabs: Record<
  MobileRole,
  { route: string; title: string; icon: IconName }[]
> = {
  client: [
    { route: "index", title: "Início", icon: "home" },
    { route: "explore", title: "Explorar", icon: "compass" },
    { route: "reservations", title: "Reservas", icon: "calendar-text" },
    { route: "points", title: "Pontos", icon: "star-circle" },
    { route: "profile", title: "Perfil", icon: "account-outline" },
  ],
  carwash: [
    { route: "index", title: "Início", icon: "view-dashboard" },
    { route: "reservations", title: "Reservas", icon: "calendar-blank" },
    { route: "services", title: "Serviços", icon: "car-wash" },
    {
      route: "performance",
      title: "Desempenho",
      icon: "chart-timeline-variant",
    },
    { route: "profile", title: "Perfil", icon: "store" },
  ],
  provider: [
    { route: "index", title: "Início", icon: "home" },
    { route: "orders", title: "Pedidos", icon: "clipboard-text-outline" },
    { route: "agenda", title: "Agenda", icon: "calendar-blank" },
    { route: "earnings", title: "Ganhos", icon: "wallet" },
    { route: "profile", title: "Perfil", icon: "account-outline" },
  ],
};
export function MobileTabs({ role }: { role: MobileRole }) {
  const session = useSession();
  const insets = useSafeAreaInsets();
  if (!session.role) return <Redirect href={`/login?role=${role}`} />;
  if (session.role !== role) return <Redirect href={homeFor(session.role)} />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.red,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.white,
          borderTopColor: c.border,
          height: 66 + insets.bottom,
          paddingTop: 7,
          paddingBottom: Math.max(insets.bottom, 7),
        },
        tabBarLabelStyle: { fontFamily: "Poppins_500Medium", fontSize: 10 },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      {tabs[role].map((t) => (
        <Tabs.Screen
          key={t.route}
          name={t.route}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size }) => (
              <Icon name={t.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
export function ProfileScreen() {
  const { role, signIn, signOut } = useSession();
  const { profile, vehicles, updateProfile, storageError } = useMobile();
  const [name, setName] = useState(profile.name);
  const [contact, setContact] = useState(profile.contact);
  const [notice, setNotice] = useState("");
  async function photo() {
    try {
      const uri = await pickPhoto();
      if (uri) updateProfile({ photo: uri });
    } catch {
      setNotice("Não foi possível abrir a galeria.");
    }
  }
  return (
    <Screen header={<Header title="O meu Perfil" back={false} />}>
      <Card style={{ alignItems: "center" }}>
        <Avatar name={profile.name} photo={profile.photo} />
        <T kind="title">{profile.name}</T>
        <Badge
          title={roleNames[(role || "client") as MobileRole] || "Administrador"}
        />
        <TextAction title="Alterar fotografia" onPress={photo} />
      </Card>
      <Field label="Nome Completo" value={name} onChangeText={setName} />
      <Field
        label="E-mail ou Telemóvel"
        value={contact}
        onChangeText={setContact}
      />
      <Button
        title="Guardar alterações"
        disabled={!name.trim() || !contact.trim()}
        onPress={() => {
          updateProfile({ name: name.trim(), contact: contact.trim() });
          setNotice("Perfil guardado neste dispositivo.");
        }}
      />
      {!!notice && <T color={c.green}>{notice}</T>}
      {role === "client" && (
        <>
          <Section title="A minha garagem" />
          {vehicles.map((v) => (
            <Card key={v.id}>
              <Row>
                <Icon name="car" color={c.red} />
                <View style={{ flex: 1 }}>
                  <T kind="label">{v.brand}</T>
                  <T color={c.muted}>
                    {v.plate} · {v.color}
                  </T>
                </View>
                <IconButton
                  name="pencil"
                  label={`Editar ${v.brand}`}
                  onPress={() => router.push(`/garage?id=${v.id}`)}
                />
              </Row>
            </Card>
          ))}
          <Button
            secondary
            title="Adicionar veículo"
            icon="plus"
            onPress={() => router.push("/garage")}
          />
        </>
      )}
      {role === "carwash" && (
        <>
          <Card>
            <T kind="heading">{profile.business}</T>
            <T color={c.muted}>{profile.address}</T>
            <T>
              {profile.open} – {profile.close}
            </T>
          </Card>
          <Button
            secondary
            title="Editar estabelecimento"
            onPress={() => router.push("/business-setup")}
          />
          <Button
            secondary
            title="Gerir fotografias"
            onPress={() => router.push("/business-photos")}
          />
        </>
      )}
      {role === "provider" && (
        <Button
          secondary
          title="Especialidades e horário"
          onPress={() => router.push("/provider-setup")}
        />
      )}
      <Section title="Explorar perfis" />
      <T kind="small" color={c.muted}>
        Demonstração local: podes alternar entre perfis para experimentar todo o
        fluxo. Não existe controlo de acesso de servidor.
      </T>
      {(Object.keys(roleNames) as MobileRole[])
        .filter((r) => r !== role)
        .map((r) => (
          <Button
            key={r}
            secondary
            title={`Mudar para ${roleNames[r]}`}
            onPress={() => {
              signIn(r);
              router.replace(homeFor(r));
            }}
          />
        ))}
      <Button
        secondary
        title="Ajuda e sobre a aplicação"
        onPress={() => router.push("/help")}
      />
      <Button
        title="Sair da conta"
        onPress={() => {
          signOut();
          router.replace("/onboarding");
        }}
      />
      {storageError && (
        <T color={c.red}>
          Não foi possível guardar os dados locais. As alterações podem
          perder-se ao fechar a aplicação.
        </T>
      )}
    </Screen>
  );
}
export function NotificationsScreen() {
  const { orders } = useMobile();
  const mine = orders.filter((o) => o.mine);
  return (
    <Screen header={<Header title="Notificações" />}>
      {mine.length ? (
        mine.map((order) => (
          <Card key={order.id}>
            <Row>
              <Icon name="bell-outline" color={c.red} />
              <View style={{ flex: 1 }}>
                <T kind="label">
                  {order.status === "completed"
                    ? "O teu carro está pronto!"
                    : "Actualização da tua reserva"}
                </T>
                <T color={c.muted}>
                  {order.wash} · {order.date}, {order.time}
                </T>
              </View>
            </Row>
            <Button
              secondary
              title="Ver reserva"
              onPress={() => router.push(`/reservation/${order.id}`)}
            />
          </Card>
        ))
      ) : (
        <Empty
          title="Sem notificações"
          message="As novidades das tuas reservas vão aparecer aqui."
        />
      )}
    </Screen>
  );
}
export function HelpScreen() {
  return (
    <Screen header={<Header title="Ajuda & Sobre" />}>
      <T kind="title">Lava Já</T>
      <T color={c.muted}>Encontra. Reserva. Lava. Ganha.</T>
      <Card>
        <T kind="heading">Como funciona?</T>
        <T>
          Cliente: escolhe um Car Wash, serviço, veículo e horário. Depois
          acompanha a reserva e ganha pontos quando o serviço é concluído.
        </T>
        <T>
          Car Wash: aceita pedidos, inicia o atendimento e conclui a checklist.
        </T>
        <T>
          Prestador: activa a disponibilidade, gere os pedidos e acompanha os
          teus ganhos.
        </T>
      </Card>
      <Card>
        <T kind="heading">Modo de demonstração</T>
        <T>
          Os dados são guardados neste dispositivo e partilhados entre os perfis
          da demonstração. Pagamentos, autenticação, chamadas e conversas
          inteligentes não usam serviços reais.
        </T>
      </Card>
    </Screen>
  );
}
type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  chart?: boolean;
  places?: boolean;
  learning?: boolean;
};
const topics = ["Margem de Lucro", "Custo de Materiais", "Fidelizar Clientes"];
const lessons: Record<string, string> = {
  "Margem de Lucro":
    "A margem de lucro é a parte da receita que sobra depois dos custos. Exemplo: se cobras 600 MT e gastas 360 MT, sobram 240 MT, ou 40%. Regista materiais, transporte e tempo de trabalho para conheceres a tua margem.",
  "Custo de Materiais":
    "Regista o custo de champô, água, electricidade, panos e cera por serviço. Divide o custo de cada embalagem pelo número de utilizações e junta o transporte. Assim podes definir preços que cobrem o teu trabalho.",
  "Fidelizar Clientes":
    "Cumpre os horários, confirma o serviço antes de começar e pede uma avaliação no fim. Uma experiência consistente e os pontos Lava Já ajudam o cliente a voltar.",
};
export function AssistantScreen() {
  const { kind: inputKind } = useLocalSearchParams<{ kind?: string }>();
  const kind =
    inputKind === "business" || inputKind === "provider"
      ? inputKind
      : "explore";
  const explore = kind === "explore";
  const provider = kind === "provider";
  const { orders, activePartnerIds } = useMobile();
  const active = orders.find((o) => o.mine && o.status === "active");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: explore
        ? "Enquanto cuidamos do teu carro, que tal aproveitares o teu tempo? Posso sugerir cafés ou lojas aqui perto na Polana."
        : provider
          ? "Olá! Sou o teu assistente. Posso ajudar-te a analisar os teus ganhos ou a definir melhores preços. O que gostarias de saber?"
          : "Olá! Sou o teu assistente de negócio. Posso ajudar-te a compreender as receitas, analisar reservas e encontrar oportunidades para fazer crescer o teu Car Wash. O que gostarias de saber?",
    },
    {
      id: "example-user",
      sender: "user",
      text: explore
        ? "Quero um lugar tranquilo para tomar café e trabalhar um pouco."
        : provider
          ? "Quanto ganhei esta semana?"
          : "Quais foram os meus melhores dias este mês?",
    },
    {
      id: "example-answer",
      sender: "assistant",
      text: explore
        ? "Boa escolha! Estas são opções ilustrativas para relaxar a menos de 10 minutos a pé:"
        : provider
          ? "Aqui está o resumo da tua semana (dados demonstrativos). Acompanha os teus ganhos por dia e identifica os horários de maior procura."
          : "Com base nos dados de demonstração, os sábados apresentam maior facturação. Podes testar campanhas nos dias de menor movimento e acompanhar o número de reservas.",
      chart: !explore,
      places: explore,
    },
  ]);
  const send = (text: string) => {
    if (!text.trim()) return;
    const topic = topics.find((t) =>
      text.toLowerCase().includes(t.toLowerCase()),
    );
    const channel = provider ? "provider" : "carwash";
    const completed = orders.filter(
      (o) => o.channel === channel && o.status === "completed",
    );
    const range = periodRange("month", dayKey());
    const summary = reportFor(
      orders,
      range.start,
      range.end,
      provider ? activePartnerIds.provider : activePartnerIds.carwash,
    );
    const revenue = summary.grossCents / 100;
    const query = text.toLowerCase();
    const result: Message = {
      id: `reply-${messages.length}`,
      sender: "assistant",
      text: explore
        ? "Estas são sugestões locais de demonstração. Encontra um lugar para relaxar enquanto o teu carro é tratado."
        : topic
          ? lessons[topic]
          : query.includes("serviç") || query.includes("reserva")
            ? `Na demonstração tens ${orders.filter((o) => o.channel === channel).length} pedidos e ${completed.length} serviços concluídos. Acompanha os pedidos pendentes para organizar melhor a agenda.`
            : query.includes("preço")
              ? "Define os preços a partir dos materiais, tempo, transporte e margem pretendida. Compara serviços equivalentes e evita cobrar menos do que o custo de realizar o trabalho."
              : query.includes("cliente")
                ? lessons["Fidelizar Clientes"]
                : query.includes("dia")
                  ? "Neste exemplo ilustrativo, o sábado apresenta maior facturação. Experimenta campanhas nos dias de menor movimento e acompanha o número de reservas."
                  : `Neste mês, o bruto registado é ${money(revenue)}, a comissão é ${money(summary.feeCents / 100)} e o líquido do parceiro é ${money(summary.netCents / 100)}. Regista os teus custos para acompanhares o resultado do negócio.`,
      places: explore,
      chart: !explore && !topic && !query.includes("reserva"),
      learning: !!topic,
    };
    setMessages((current) => [
      ...current,
      { id: `user-${messages.length}`, sender: "user", text: text.trim() },
      result,
    ]);
    setInput("");
  };
  const title = explore
    ? "Lava Já Explore"
    : provider
      ? "Assistente de Negócio"
      : "Lava Já Business AI";
  return (
    <Screen
      header={
        <Header
          title={title}
          subtitle={
            explore
              ? "Guia Local Inteligente"
              : provider
                ? "Cresce com o Lava Já"
                : "O teu parceiro na gestão do negócio"
          }
          right={
            <IconButton
              name="close"
              label="Fechar assistente"
              onPress={() => router.back()}
            />
          }
        />
      }
      footer={
        <>
          <Row style={{ flexWrap: "wrap", gap: 7 }}>
            {(explore
              ? ["Tomar café", "Almoçar", "Lojas"]
              : ["Ganhos", "Preços", "Clientes"]
            ).map((v) => (
              <Pill key={v} title={v} onPress={() => send(v)} />
            ))}
          </Row>
          <Row>
            <View style={{ flex: 1 }}>
              <Field
                label="Mensagem"
                icon={explore ? "magnify" : "message-text-outline"}
                placeholder={
                  explore
                    ? "O que procuras por perto?"
                    : "Escreve a tua dúvida…"
                }
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => send(input)}
                returnKeyType="send"
              />
            </View>
            <IconButton
              name="send"
              color={c.red}
              label="Enviar mensagem"
              onPress={() => send(input)}
            />
          </Row>
        </>
      }
    >
      <View
        style={{
          width: 40,
          height: 4,
          backgroundColor: c.border,
          alignSelf: "center",
          borderRadius: 4,
        }}
      />
      <Badge
        title="Respostas locais de demonstração · sem IA ligada"
        color={c.red}
      />
      {explore && active && (
        <Card style={{ backgroundColor: c.pink }}>
          <T kind="label">A lavar no {active.wash}</T>
          <T color={c.muted}>
            Faltam aproximadamente 25 min · estimativa demonstrativa
          </T>
          <TextAction
            title="Ver Carro"
            onPress={() => router.push(`/reservation/${active.id}`)}
          />
        </Card>
      )}
      {!explore && (
        <>
          <T kind="small" color={c.muted}>
            Sugestões de perguntas
          </T>
          {(provider
            ? [
                "Quanto ganhei esta semana?",
                "Como posso definir melhores preços?",
                "Quais foram os meus melhores dias?",
              ]
            : [
                "Quanto facturei este mês?",
                "Quais são os meus melhores dias?",
                "Que serviços têm maior procura?",
                "O que é margem de lucro?",
              ]
          ).map((v) => (
            <Pill key={v} title={v} icon="creation" onPress={() => send(v)} />
          ))}
        </>
      )}
      {messages.map((message) => (
        <View
          key={message.id}
          style={{
            alignSelf: message.sender === "user" ? "flex-end" : "stretch",
            maxWidth: message.sender === "user" ? "87%" : "100%",
          }}
        >
          <Card
            style={{
              backgroundColor: message.sender === "user" ? c.red : c.white,
              borderColor: message.sender === "user" ? c.red : c.border,
              borderTopLeftRadius: message.sender === "assistant" ? 0 : 22,
              borderBottomRightRadius: message.sender === "user" ? 0 : 22,
            }}
          >
            <T color={message.sender === "user" ? c.white : c.text}>
              {message.text}
            </T>
            {message.chart && (
              <>
                <T kind="label">
                  {provider ? "Ganhos por dia" : "Receita por Dia"} · exemplo
                </T>
                <Chart
                  values={provider ? [40, 27, 50, 15, 70, 85] : undefined}
                  labels={provider ? ["S", "T", "Q", "Q", "S", "S"] : undefined}
                />
                <Card style={{ backgroundColor: c.mint }}>
                  <Row>
                    <Icon name="lightbulb-outline" />
                    <T style={{ flex: 1 }}>
                      Cria uma promoção à terça-feira para equilibrar a tua
                      agenda semanal.
                    </T>
                  </Row>
                </Card>
              </>
            )}
            {message.places && (
              <>
                <PlaceCard id="nautilus" />
                <PlaceCard id="doce" />
              </>
            )}
          </Card>
        </View>
      ))}
      {!explore && (
        <>
          <Section title="Aprende a Gerir" />
          {topics.map((topic) => (
            <Button
              key={topic}
              secondary
              title={topic}
              icon="school-outline"
              onPress={() =>
                router.push({ pathname: "/lesson", params: { topic } })
              }
            />
          ))}
        </>
      )}
    </Screen>
  );
}
const places = {
  nautilus: {
    name: "Nautilus Polana",
    photo: photos.cafe,
    distance: "350 m",
    walk: "4 min a pé",
    tag: "Wi-Fi Rápido",
    description:
      "Uma sugestão ilustrativa de café na Polana para descansar ou trabalhar enquanto esperas.",
  },
  doce: {
    name: "Uma pausa doce",
    photo: photos.food,
    distance: "650 m",
    walk: "8 min a pé",
    tag: "Café & refeições",
    description:
      "Uma sugestão ilustrativa de espaço para uma refeição ligeira.",
  },
};
function PlaceCard({ id }: { id: keyof typeof places }) {
  const place = places[id];
  return (
    <Card style={{ padding: 12 }}>
      <Image
        source={place.photo}
        style={{ width: "100%", height: 130, borderRadius: 15 }}
      />
      <T kind="heading">{place.name}</T>
      <Badge title={place.tag} />
      <T kind="small" color={c.red}>
        {place.walk} · {place.distance}
      </T>
      <Button
        secondary
        title="Ver no mapa"
        icon="map-marker"
        onPress={() => router.push(`/place?id=${id}&map=1`)}
      />
      <TextAction
        title="Detalhes"
        onPress={() => router.push(`/place?id=${id}`)}
      />
    </Card>
  );
}
export function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: keyof typeof places }>();
  const place = places[id];
  return (
    <Screen header={<Header title={place?.name || "Local"} />}>
      {place ? (
        <>
          <Image
            source={place.photo}
            style={{ width: "100%", height: 220, borderRadius: 22 }}
          />
          <T kind="title">{place.name}</T>
          <Badge title={place.tag} />
          <T>{place.description}</T>
          <T color={c.red}>
            {place.walk} · {place.distance}
          </T>
          <MapPreview />
          <T kind="small" color={c.muted}>
            Mapa de referência de Matola. O trajecto e os dados reais deste
            local ainda não estão ligados a um serviço de mapas.
          </T>
        </>
      ) : (
        <Empty
          title="Local não encontrado"
          message="Regressa ao assistente para veres as sugestões."
        />
      )}
    </Screen>
  );
}
export function LessonScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  return (
    <Screen header={<Header title="Aprende a Gerir" />}>
      <Icon name="school-outline" color={c.red} size={50} />
      <T kind="title">{topic}</T>
      <Card>
        <T>
          {lessons[topic] ||
            "Organiza a tua actividade, acompanha os custos e mantém um serviço consistente."}
        </T>
      </Card>
      <Button title="Perguntar ao assistente" onPress={() => router.back()} />
    </Screen>
  );
}
