import { useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Image, Pressable, ScrollView, View } from "react-native";
import { useMobile } from "./store";
import { ratingFor } from "./finance";
import { c, photos } from "./theme";
import {
  catalogFor,
  money,
  services,
  statusNames,
  washes,
  type Order,
} from "./data";
import {
  Badge,
  Button,
  Card,
  Empty,
  Field,
  Header,
  Icon,
  IconButton,
  MapPreview,
  Pill,
  Row,
  Screen,
  Section,
  T,
  TextAction,
  s,
} from "./ui";

export function WashCard({ wash }: { wash: (typeof washes)[number] }) {
  const { orders } = useMobile();
  const rating = ratingFor(orders, wash.id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${wash.name}`}
      onPress={() => router.push(`/wash/${wash.id}`)}
      style={[s.card, { padding: 0, overflow: "hidden" }]}
    >
      <View>
        <Image
          source={photos[wash.photo]}
          style={{ height: 160, width: "100%" }}
          resizeMode={wash.photo === "silver" ? "contain" : "cover"}
        />
        <View style={{ position: "absolute", right: 12, top: 12 }}>
          <Badge title="ABERTO" />
        </View>
      </View>
      <View style={{ padding: 18, gap: 8 }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T kind="heading" style={{ flex: 1 }}>
            {wash.name}
          </T>
          <Icon name="star" size={19} color={c.yellow} />
          <T kind="small">
            {rating.count ? rating.average.toFixed(1) : wash.rating || "Novo"}
          </T>
        </Row>
        <T kind="small" color={c.muted}>
          📍 {wash.distance} km ·{" "}
          <T kind="small" color={c.red}>
            Desde {money(wash.price)}
          </T>
        </T>
      </View>
    </Pressable>
  );
}
export function ClientHomeScreen({ explore = false }: { explore?: boolean }) {
  const { profile, points, washCatalog, orders } = useMobile();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Perto de mim");
  const list = washCatalog
    .filter((w) =>
      `${w.name} ${w.address}`.toLowerCase().includes(query.toLowerCase()),
    )
    .filter((w) => filter !== "4.5+ Estrelas" || w.rating >= 4.5)
    .sort((a, b) =>
      filter === "Melhor Preço"
        ? a.price - b.price
        : filter === "4.5+ Estrelas"
          ? b.rating - a.rating
          : a.distance - b.distance,
    );
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Row>
          <Icon name="map-marker" color={c.red} />
          <View style={{ flex: 1 }}>
            <T kind="small" color={c.muted}>
              Localização actual
            </T>
            <T kind="label">Matola, Moçambique</T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver pontos"
            onPress={() => router.push("/mobile/client/points")}
            style={{
              backgroundColor: c.navy,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 20,
            }}
          >
            <T kind="small" color={c.white}>
              ⭐ {points.toLocaleString("pt-PT")} pts
            </T>
          </Pressable>
          <IconButton
            name="bell-outline"
            label="Notificações"
            onPress={() => router.push("/notifications")}
          />
        </Row>
        <T kind="title">
          {explore
            ? "Explora os Car Wash perto de ti"
            : `Olá, ${profile.name.split(" ")[0]}! 👋\nOnde vamos lavar o teu carro hoje?`}
        </T>
        <Field
          label="Encontrar Car Wash"
          icon="magnify"
          placeholder="Onde queres lavar o teu carro?"
          value={query}
          onChangeText={setQuery}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {[
            "Perto de mim",
            "Melhor Preço",
            "4.5+ Estrelas",
            "Aberto agora",
          ].map((v) => (
            <Pill
              key={v}
              title={v}
              selected={filter === v}
              onPress={() => setFilter(v)}
            />
          ))}
        </ScrollView>
        <MapPreview onSelect={(id) => router.push(`/wash/${id}`)} />
        <Button
          secondary
          title="Reservar Prestador · Rampa de bairro"
          icon="car-wash"
          onPress={() => router.push("/provider-booking")}
        />
        {orders
          .filter((o) => o.mine && o.status === "completed" && !o.review)
          .map((o) => (
            <Card key={o.id}>
              <T kind="label">O teu serviço em {o.wash} foi concluído</T>
              <Button
                title="Confirmar e avaliar"
                onPress={() => router.push(`/reservation/${o.id}`)}
              />
            </Card>
          ))}
        <Section
          title="Car Wash próximos"
          action={explore ? undefined : "Ver todos"}
          onPress={() => router.push("/mobile/client/explore")}
        />
        {list.map((w) => (
          <WashCard key={w.id} wash={w} />
        ))}
        {!list.length && (
          <Empty
            title="Sem resultados"
            message="Experimenta outro nome ou endereço."
          />
        )}
        <View style={{ height: 50 }} />
      </Screen>
      <View style={{ position: "absolute", right: 20, bottom: 18 }}>
        <Button
          title="Perguntar à IA"
          icon="creation"
          onPress={() => router.push("/assistant?kind=explore")}
        />
      </View>
    </View>
  );
}
export function ExploreScreen() {
  return <ClientHomeScreen explore />;
}
export function WashDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, washCatalog, activePartnerIds, orders } = useMobile();
  const wash = washCatalog.find((w) => w.id === id);
  const rating = ratingFor(orders, id);
  const [selected, setSelected] = useState("simple");
  const catalog = catalogFor(
    id === activePartnerIds.carwash ? "brilho" : id,
    profile,
  );
  const service = catalog.find((s) => s.id === selected) || catalog[0];
  if (!wash)
    return (
      <Screen header={<Header title="Car Wash" />}>
        <Empty
          title="Car Wash não encontrado"
          message="Regressa à pesquisa para escolher um estabelecimento."
        />
      </Screen>
    );
  return (
    <Screen
      footer={
        <Row>
          <View style={{ flex: 1 }}>
            <T kind="small" color={c.muted}>
              Total estimado
            </T>
            <T kind="heading" color={c.red}>
              {money(service?.price ?? 0)}
            </T>
          </View>
          <Button
            title="Reservar Agora"
            disabled={!service}
            style={{ flex: 1.4 }}
            onPress={() =>
              router.push({
                pathname: "/booking",
                params: { wash: wash.id, service: service.id },
              })
            }
          />
        </Row>
      }
    >
      <View
        style={{
          height: 260,
          margin: -22,
          marginBottom: 0,
          backgroundColor: c.navy,
        }}
      >
        <Image
          source={photos[wash.photo]}
          style={{ width: "100%", height: 180, opacity: 0.75 }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            left: 16,
            top: 8,
            backgroundColor: "#FFFFFFE8",
            borderRadius: 30,
          }}
        >
          <IconButton
            name="arrow-left"
            label="Voltar"
            onPress={() => router.back()}
          />
        </View>
        <View style={{ position: "absolute", right: 20, top: 20 }}>
          <Badge title="ABERTO AGORA" />
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 18,
            paddingHorizontal: 23,
            gap: 6,
          }}
        >
          <T kind="title" color={c.white}>
            {wash.name}
          </T>
          <T kind="small" color="#E2E8F0">
            {wash.address} · ★{" "}
            {rating.count ? rating.average.toFixed(1) : wash.rating || "Novo"} (
            {rating.count} avaliações)
          </T>
        </View>
      </View>
      <Row>
        {[
          ["Distância", `${wash.distance} km`],
          ["Espera Est.", "15 min"],
          ["Preço Médio", "500 MT"],
        ].map(([label, value]) => (
          <Card key={label} style={{ flex: 1, padding: 12, gap: 5 }}>
            <T kind="small" color={c.muted}>
              {label}
            </T>
            <T kind="label">{value}</T>
          </Card>
        ))}
      </Row>
      <Section title="Nossos Serviços" />
      {!catalog.length && (
        <Empty
          title="Serviços indisponíveis"
          message="Este estabelecimento ainda não tem serviços activos."
        />
      )}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {catalog.map((item, i) => (
          <Pressable
            key={item.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: service?.id === item.id }}
            onPress={() => setSelected(item.id)}
            style={{
              padding: 18,
              gap: 8,
              borderBottomWidth: i < catalog.length - 1 ? 1 : 0,
              borderColor: c.border,
              backgroundColor: service?.id === item.id ? "#FFF7F8" : c.white,
            }}
          >
            <Row>
              <View style={{ flex: 1 }}>
                <T kind="label">{item.name}</T>
                <T kind="small" color={c.muted}>
                  ◷ {item.minutes} min
                </T>
              </View>
              <T kind="label" color={c.red}>
                {money(item.price)}
              </T>
              <Icon
                name={
                  service?.id === item.id ? "radiobox-marked" : "radiobox-blank"
                }
                color={c.red}
                size={20}
              />
            </Row>
          </Pressable>
        ))}
      </Card>
      <Section title="Localização" />
      <MapPreview />
      <T color={c.muted}>{wash.address}</T>
      <Section title="Avaliações" />
      <Card>
        <T kind="label">
          {rating.count
            ? `★ ${rating.average.toFixed(1)} · ${rating.count} avaliações`
            : "Ainda não há avaliações de clientes"}
        </T>
        {orders
          .filter((o) => o.partnerId === id && o.review)
          .map((o) => (
            <View key={o.id}>
              <T kind="label">
                {"★".repeat(o.review!.stars)} · {o.client}
              </T>
              <T color={c.muted}>{o.review!.comment || "Sem comentário"}</T>
            </View>
          ))}
      </Card>
    </Screen>
  );
}
export function BookingScreen() {
  const params = useLocalSearchParams<{ wash: string; service: string }>();
  const { vehicles, profile, createBooking, washCatalog, activePartnerIds } =
    useMobile();
  const wash = washCatalog.find((w) => w.id === params.wash);
  const service = catalogFor(
    params.wash === activePartnerIds.carwash ? "brilho" : params.wash,
    profile,
  ).find((s) => s.id === params.service);
  const paymentOptions = [
    "Moza Banco (Conta Móvel)",
    "M-Pesa",
    "e-Mola",
    "Pagar no Local",
  ].filter(
    (option) =>
      option !== "Moza Banco (Conta Móvel)" ||
      params.wash !== activePartnerIds.carwash ||
      profile.moza,
  );
  const slots = [
    "08:00",
    "09:00",
    "10:30",
    "11:15",
    "14:00",
    "15:30",
    "17:00",
  ].filter(
    (slot) =>
      params.wash !== activePartnerIds.carwash ||
      (slot >= profile.open && slot < profile.close),
  );
  const [payment, setPayment] = useState(paymentOptions[0]);
  const [vehicle, setVehicle] = useState(vehicles[0]?.id || "");
  const [date, setDate] = useState("Hoje");
  const [time, setTime] = useState(
    slots.includes("10:30") ? "10:30" : slots[0] || "",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  if (!wash || !service)
    return (
      <Screen header={<Header title="Reserva" />}>
        <Empty
          title="Selecciona um serviço"
          message="Abre um Car Wash para começar a reserva."
        />
        <Button
          title="Explorar"
          onPress={() => router.replace("/mobile/client/explore")}
        />
      </Screen>
    );
  const confirm = () => {
    if (lock.current) return;
    if (!slots.includes(time) || !paymentOptions.includes(payment)) {
      setError("Selecciona um horário e método de pagamento disponíveis.");
      return;
    }
    const car = vehicles.find((v) => v.id === vehicle);
    if (!car) {
      setError("Adiciona ou selecciona um veículo.");
      return;
    }
    lock.current = true;
    setSaving(true);
    const id = createBooking({
      client: profile.name,
      car: `${car.brand} · ${car.plate}`,
      serviceId: service.id,
      price: service.price,
      time,
      date,
      channel: "carwash",
      partnerId: wash.id,
      wash: wash.name,
      payment,
    });
    router.replace({ pathname: "/booking-confirmation", params: { id } });
  };
  return (
    <Screen
      header={<Header title="Pagamento & Reserva" />}
      footer={
        <>
          <Row style={{ justifyContent: "space-between" }}>
            <T>Total a pagar</T>
            <View>
              <T kind="title" color={c.red}>
                {money(service.price)}
              </T>
              <T kind="small" color={c.muted}>
                Inclui IVA e taxas · demonstração
              </T>
            </View>
          </Row>
          <Button
            title={saving ? "A confirmar…" : "Confirmar e Pagar"}
            icon="lock"
            disabled={saving || !slots.length}
            onPress={confirm}
          />
        </>
      }
    >
      <T kind="label" color={c.muted}>
        Serviço Seleccionado
      </T>
      <Card>
        <Row>
          <View style={{ flex: 1 }}>
            <T kind="heading">{service.name}</T>
            <T color={c.muted}>
              {wash.name} · {service.minutes} min
            </T>
          </View>
          <T kind="heading" color={c.red}>
            {money(service.price)}
          </T>
        </Row>
      </Card>
      <Card style={{ backgroundColor: c.navy }}>
        <Row>
          <Icon name="gift-outline" color={c.red} size={35} />
          <View style={{ flex: 1 }}>
            <T kind="heading" color={c.white}>
              Ganha Pontos LAVA JÁ
            </T>
            <T color="#D8DEEA">
              Completa esta reserva e ganha{" "}
              {Math.floor(service.price / 100) * 10} pontos.
            </T>
          </View>
          <Icon name="star" color={c.yellow} />
        </Row>
      </Card>
      <Section title="Veículo" />
      {vehicles.map((v) => (
        <Pill
          key={v.id}
          title={`${v.brand} · ${v.plate}`}
          selected={vehicle === v.id}
          onPress={() => setVehicle(v.id)}
        />
      ))}
      <TextAction
        title="＋ Adicionar veículo"
        onPress={() => router.push("/garage")}
      />
      <Section title="Dia e horário" />
      <Row>
        {["Hoje", "Amanhã"].map((d) => (
          <Pill
            key={d}
            title={d}
            selected={date === d}
            onPress={() => setDate(d)}
          />
        ))}
      </Row>
      <Row style={{ flexWrap: "wrap" }}>
        {slots.map((t) => (
          <Pill
            key={t}
            title={t}
            selected={time === t}
            onPress={() => setTime(t)}
          />
        ))}
      </Row>
      <T kind="label" color={c.muted}>
        Método de Pagamento
      </T>
      {paymentOptions.map((p) => (
        <Pressable
          key={p}
          accessibilityRole="radio"
          accessibilityState={{ checked: payment === p }}
          onPress={() => setPayment(p)}
          style={[
            s.card,
            {
              backgroundColor: payment === p ? c.pink : c.white,
              borderColor: payment === p ? c.red : c.border,
            },
          ]}
        >
          <Row>
            <Icon
              name={p === "Pagar no Local" ? "cash" : "cellphone"}
              color={c.red}
            />
            <T style={{ flex: 1 }}>{p}</T>
            <Icon
              name={payment === p ? "check-circle" : "circle-outline"}
              color={c.red}
            />
          </Row>
        </Pressable>
      ))}
      <T kind="small" color={c.muted}>
        Pagamento simulado. Não será cobrado qualquer valor nem enviada uma
        transacção para o banco.
      </T>
      {!!error && <T color={c.red}>{error}</T>}
    </Screen>
  );
}
export function BookingConfirmationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useMobile();
  const order = orders.find((o) => o.id === id);
  return (
    <Screen header={<Header title="Reserva enviada" back={false} />}>
      <View style={{ alignItems: "center", gap: 20, paddingVertical: 25 }}>
        <Icon name="check-circle" color={c.green} size={85} />
        <T kind="title" style={{ textAlign: "center" }}>
          Está tudo encaminhado!
        </T>
        <T color={c.muted} style={{ textAlign: "center" }}>
          A tua reserva de demonstração foi enviada e aguarda confirmação do
          parceiro.
        </T>
      </View>
      {order && (
        <Card>
          <T kind="heading">{order.wash}</T>
          <T>{services.find((s) => s.id === order.serviceId)?.name}</T>
          <T color={c.muted}>
            {order.date} · {order.time} · {order.car}
          </T>
          <Badge title={statusNames[order.status]} color={c.red} />
          <T kind="heading" color={c.red}>
            {money(order.price)}
          </T>
          <T kind="small">{order.payment} · Pagamento simulado</T>
        </Card>
      )}
      <Button
        title="Acompanhar reserva"
        onPress={() => router.replace(`/reservation/${id}`)}
      />
      <Button
        secondary
        title="Voltar ao início"
        onPress={() => router.replace("/mobile/client")}
      />
    </Screen>
  );
}
export function ClientReservationsScreen() {
  const { orders } = useMobile();
  const [tab, setTab] = useState("Activas");
  const mine = orders.filter(
    (o) =>
      o.mine &&
      (tab === "Activas"
        ? ["pending", "confirmed", "active"].includes(o.status)
        : !["pending", "confirmed", "active"].includes(o.status)),
  );
  return (
    <Screen header={<Header title="As minhas Reservas" back={false} />}>
      <Row>
        {["Activas", "Histórico"].map((v) => (
          <Pill
            key={v}
            title={v}
            selected={tab === v}
            onPress={() => setTab(v)}
          />
        ))}
      </Row>
      {mine.map((o) => (
        <OrderSummary
          key={o.id}
          order={o}
          onPress={() => router.push(`/reservation/${o.id}`)}
        />
      ))}
      {!mine.length && (
        <>
          <Empty
            title="Nenhuma reserva"
            message="As tuas lavagens aparecem aqui. Encontra um Car Wash e reserva o próximo cuidado do teu carro."
          />
          <Button
            title="Encontrar Car Wash"
            onPress={() => router.push("/mobile/client/explore")}
          />
        </>
      )}
    </Screen>
  );
}
export function OrderSummary({
  order,
  onPress,
}: {
  order: Order;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={s.card}>
      <Row style={{ justifyContent: "space-between" }}>
        <T kind="label" style={{ flex: 1 }}>
          {order.mine ? order.wash : order.client}
        </T>
        <Badge
          title={statusNames[order.status]}
          color={order.status === "completed" ? c.green : c.red}
        />
      </Row>
      <T kind="heading">
        {services.find((s) => s.id === order.serviceId)?.name}
      </T>
      <T kind="small" color={c.muted}>
        {order.car}
      </T>
      <Row style={{ justifyContent: "space-between" }}>
        <T color={c.muted}>
          {order.date} · {order.time}
        </T>
        <T kind="label" color={c.red}>
          {money(order.price)}
        </T>
        <Icon name="chevron-right" color={c.muted} />
      </Row>
    </Pressable>
  );
}
export function ReservationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, changeStatus, confirmClientCompletion } = useMobile();
  const order = orders.find((o) => o.id === id && o.mine);
  if (!order)
    return (
      <Screen header={<Header title="Reserva" />}>
        <Empty
          title="Reserva não encontrada"
          message="Consulta a lista das tuas reservas."
        />
      </Screen>
    );
  return (
    <Screen
      header={<Header title="Acompanhar reserva" subtitle={`#${order.id}`} />}
    >
      <Card>
        <Badge
          title={statusNames[order.status]}
          color={
            ["completed", "active"].includes(order.status) ? c.green : c.red
          }
        />
        <T kind="title">{order.wash}</T>
        <T>{services.find((s) => s.id === order.serviceId)?.name}</T>
        <T color={c.muted}>{order.car}</T>
        <T>
          {order.date} · {order.time}
        </T>
        <T kind="heading" color={c.red}>
          {money(order.price)}
        </T>
        <T kind="small" color={c.muted}>
          {order.payment || "Pagamento no local"} · demonstração
        </T>
      </Card>
      {["confirmed", "active", "completed"].includes(order.status) && (
        <>
          <Section title="Progresso do Serviço" />
          <Progress stage={order.stage} />
        </>
      )}
      {order.status === "pending" && (
        <Card>
          <T color={c.muted}>
            A aguardar aceitação. Podes trocar para o perfil Car Wash para gerir
            este pedido nesta demonstração.
          </T>
        </Card>
      )}
      {order.status === "completed" && (
        <Card style={{ backgroundColor: c.mint }}>
          <T kind="heading" color={c.green}>
            Carro pronto! ✨
          </T>
          {order.review ? (
            <T kind="label">
              A tua avaliação: {"★".repeat(order.review.stars)} · Obrigado!
            </T>
          ) : (
            <Button
              title={
                order.clientConfirmedAt
                  ? "Avaliar serviço"
                  : "Concluído — avaliar serviço"
              }
              icon="star"
              onPress={() => {
                confirmClientCompletion(order.id);
                router.push(`/review/${order.id}`);
              }}
            />
          )}
          <T>
            Ganhaste {Math.floor(order.price / 100) * 10} pontos nesta lavagem.
          </T>
          <Button
            secondary
            title="Ver os meus pontos"
            onPress={() => router.push("/mobile/client/points")}
          />
        </Card>
      )}
      {["pending", "confirmed"].includes(order.status) && (
        <Button
          secondary
          title="Cancelar reserva"
          onPress={() =>
            Alert.alert(
              "Cancelar reserva?",
              "A reserva será cancelada nesta demonstração.",
              [
                { text: "Manter", style: "cancel" },
                {
                  text: "Cancelar reserva",
                  style: "destructive",
                  onPress: () => changeStatus(order.id, "cancelled"),
                },
              ],
            )
          }
        />
      )}
      <Button
        title="Explorar enquanto esperas"
        icon="creation"
        onPress={() => router.push("/assistant?kind=explore")}
      />
    </Screen>
  );
}
export function Progress({ stage }: { stage: number }) {
  return (
    <Card>
      <Row style={{ alignItems: "flex-start", gap: 5 }}>
        {["Chegada", "Início", "Lavagem", "Secagem", "Concluído"].map(
          (label, i) => (
            <View key={label} style={{ flex: 1, alignItems: "center", gap: 8 }}>
              <Icon
                name={
                  i < stage || stage === 4
                    ? "check-circle"
                    : i === stage
                      ? "progress-clock"
                      : "circle-outline"
                }
                color={
                  i < stage || stage === 4
                    ? c.green
                    : i === stage
                      ? c.red
                      : c.muted
                }
                size={25}
              />
              <T
                kind="small"
                color={i === stage ? c.red : c.muted}
                style={{ textAlign: "center", fontSize: 10 }}
              >
                {label}
              </T>
            </View>
          ),
        )}
      </Row>
    </Card>
  );
}
export function PointsScreen() {
  const { points, transactions, redeem } = useMobile();
  const claim = (name: string, price: number) => {
    if (points < price) {
      Alert.alert(
        "Pontos insuficientes",
        `Precisas de ${price - points} pontos adicionais.`,
      );
      return;
    }
    Alert.alert(
      "Resgatar recompensa?",
      `${name} por ${price} pontos. Resgate apenas de demonstração.`,
      [
        { text: "Agora não", style: "cancel" },
        { text: "Resgatar", onPress: () => redeem(name, price) },
      ],
    );
  };
  return (
    <Screen>
      <View
        style={{
          backgroundColor: c.navy,
          margin: -22,
          marginBottom: 0,
          padding: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          gap: 18,
        }}
      >
        <Row style={{ justifyContent: "space-between" }}>
          <T kind="heading" color={c.white}>
            Lava Já Pontos
          </T>
          <IconButton
            name="information-outline"
            color={c.white}
            label="Como funcionam os pontos"
            onPress={() =>
              Alert.alert(
                "Lava Já Pontos",
                "Ganhas 10 pontos por cada 100 MT de um serviço concluído. Os resgates são demonstrativos e ficam no histórico local.",
              )
            }
          />
        </Row>
        <T color="#CBD5E1">O teu saldo actual</T>
        <T kind="big" color={c.white}>
          ★ {points.toLocaleString("pt-PT")} <T color={c.white}>Pts</T>
        </T>
        <Row style={{ justifyContent: "space-between" }}>
          <T color="#CBD5E1">
            {points >= 1500 ? "Nível Silver" : "Próximo nível: Silver"}
          </T>
          <T color={c.white}>
            {Math.min(100, Math.round((points / 1500) * 100))}%
          </T>
        </Row>
        <View style={{ height: 8, backgroundColor: "#E5DCF4" }}>
          <View
            style={{
              backgroundColor: c.red,
              height: 8,
              width: `${Math.min(100, (points / 1500) * 100)}%`,
            }}
          />
        </View>
        <T kind="small" color="#CBD5E1">
          {points >= 1500
            ? "Parabéns! Atingiste o nível Silver."
            : `Faltam ${1500 - points} pontos para atingires o nível Silver.`}
        </T>
      </View>
      <Section title="Recompensas Disponíveis" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
      >
        {[
          { name: "Lavagem Simples", price: 500, photo: photos.reward },
          { name: "Ambientador Premium", price: 200, photo: photos.air },
        ].map((item) => (
          <Pressable
            key={item.name}
            accessibilityRole="button"
            accessibilityLabel={`Resgatar ${item.name}`}
            onPress={() => claim(item.name, item.price)}
            style={[s.card, { width: 230, padding: 0, overflow: "hidden" }]}
          >
            <Image source={item.photo} style={{ height: 125, width: "100%" }} />
            <View style={{ padding: 15, gap: 9 }}>
              <T kind="label">{item.name}</T>
              <Row style={{ justifyContent: "space-between" }}>
                <T color={c.red}>★ {item.price} Pts</T>
                <Icon
                  name={points >= item.price ? "check-circle" : "lock-outline"}
                  color={points >= item.price ? c.green : c.muted}
                />
              </Row>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <Card style={{ backgroundColor: c.pink, borderColor: "#EAB4C0" }}>
        <Row>
          <Icon name="check-decagram-outline" size={35} color={c.red} />
          <View style={{ flex: 1 }}>
            <T kind="heading">Ganha mais pontos</T>
            <T color={c.muted}>
              Ganha 10 pontos por cada 100 MT gastos num serviço concluído.
            </T>
          </View>
        </Row>
      </Card>
      <Section title="Histórico de Pontos" />
      <Card>
        {transactions.map((t, i) => (
          <View key={t.id}>
            <Row>
              <View style={{ flex: 1 }}>
                <T>{t.label}</T>
                <T kind="small" color={c.muted}>
                  {t.date}
                </T>
              </View>
              <T kind="heading" color={t.points >= 0 ? c.green : c.red}>
                {t.points >= 0 ? "+" : ""}
                {t.points}
              </T>
            </Row>
            {i < transactions.length - 1 && <View style={s.divider} />}
          </View>
        ))}
      </Card>
    </Screen>
  );
}
