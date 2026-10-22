import EarningsScreen from "./EarningsScreen";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, Switch, View } from "react-native";
import { useMobile } from "./store";
import { dayKey, inRange, orderAmounts, ratingFor, reportFor } from "./finance";
import { c } from "./theme";
import {
  money,
  services,
  statusNames,
  type Order,
  type OrderStatus,
} from "./data";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Field,
  Header,
  Icon,
  IconButton,
  Pill,
  Row,
  Screen,
  Section,
  T,
  TextAction,
  s,
} from "./ui";
import { Progress } from "./ClientScreens";

export function BusinessAICard({ provider = false }: { provider?: boolean }) {
  return (
    <Card
      style={{
        backgroundColor: provider ? c.white : c.navy,
        borderColor: provider ? c.border : c.navy,
        gap: 14,
      }}
    >
      <Row>
        <Icon name="creation" color={provider ? c.red : c.white} />
        <T kind="label" color={provider ? c.red : c.white}>
          Lava Já Business AI
        </T>
      </Row>
      <T kind="heading" color={provider ? c.text : c.white}>
        {provider
          ? "Aprende e faz crescer o teu negócio"
          : "O teu assistente de negócio"}
      </T>
      <T color={provider ? c.muted : "#D9DDE5"}>
        {provider
          ? "O teu assistente ajuda-te a compreender os teus ganhos, organizar serviços e melhorar a gestão da tua actividade."
          : "Aprende a gerir o teu Car Wash, analisa as tuas receitas e descobre oportunidades para crescer."}
      </T>
      <Button
        title="Conversar com a IA"
        icon="creation"
        onPress={() =>
          router.push(`/assistant?kind=${provider ? "provider" : "business"}`)
        }
      />
      {provider && (
        <T kind="small" color={c.muted} style={{ textAlign: "center" }}>
          Recebe orientação sobre preços, ganhos, clientes e organização do
          trabalho.
        </T>
      )}
    </Card>
  );
}
export function OrderCard({
  order,
  provider = false,
}: {
  order: Order;
  provider?: boolean;
}) {
  const { changeStatus } = useMobile();
  const service = services.find((s) => s.id === order.serviceId);
  const decide = (status: OrderStatus) => {
    if (status === "rejected")
      Alert.alert("Rejeitar pedido?", `Pedido de ${order.client}.`, [
        { text: "Voltar", style: "cancel" },
        {
          text: "Rejeitar",
          style: "destructive",
          onPress: () => changeStatus(order.id, status),
        },
      ]);
    else changeStatus(order.id, status);
  };
  return (
    <Card>
      <Row>
        {!provider && <Avatar name={order.client} />}
        <View style={{ flex: 1 }}>
          <T kind="heading">{provider ? service?.name : order.client}</T>
          <T kind="small" color={c.muted}>
            {order.car}
          </T>
        </View>
      </Row>
      {!provider && <T>{service?.name}</T>}
      <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <T kind="small" color={c.muted}>
          {provider ? "📍 Matola · 1.2 km · " : ""}
          {order.date} · {order.time}
        </T>
        <T kind="label" color={c.red}>
          {money(order.price)}
        </T>
      </Row>
      <T kind="small" color={c.muted}>
        Comissão {order.channel === "carwash" ? "10%" : "5%"}:{" "}
        {money(orderAmounts(order).feeCents / 100)} · Líquido:{" "}
        {money(orderAmounts(order).netCents / 100)}
      </T>
      {order.status === "pending" ? (
        <Row>
          <Button
            title="Rejeitar"
            secondary
            style={{ flex: 1 }}
            onPress={() => decide("rejected")}
          />
          <Button
            title="Aceitar"
            style={{ flex: 1 }}
            onPress={() => decide("confirmed")}
          />
        </Row>
      ) : (
        <>
          <Badge
            title={statusNames[order.status]}
            color={order.status === "completed" ? c.green : c.red}
          />
          <Button
            secondary
            title={
              order.status === "confirmed"
                ? "Iniciar atendimento"
                : "Ver trabalho"
            }
            onPress={() => {
              if (order.status === "confirmed")
                changeStatus(order.id, "active");
              router.push(`/job/${order.id}`);
            }}
          />
        </>
      )}
    </Card>
  );
}
export function BusinessDashboardScreen() {
  const { profile, orders, activePartnerIds } = useMobile();
  const list = orders.filter(
    (o) => o.channel === "carwash" && o.partnerId === activePartnerIds.carwash,
  );
  const pending = list.filter((o) => o.status === "pending");
  const completed = list.filter(
    (o) =>
      o.status === "completed" && inRange(o.completedAt, dayKey(), dayKey()),
  );
  return (
    <Screen>
      <View
        style={{
          backgroundColor: c.navy,
          margin: -22,
          marginBottom: 0,
          padding: 24,
          gap: 22,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <Row>
          <View style={{ flex: 1 }}>
            <T kind="title" color={c.white}>
              {profile.business}
            </T>
            <T kind="small" color="#CED5DE">
              🟢 Em funcionamento
            </T>
          </View>
          <Avatar name={profile.business} />
        </Row>
        <Card style={{ backgroundColor: c.red, borderColor: c.red }}>
          <T kind="label" color="#FFE1E8">
            Resumo de Hoje
          </T>
          <T kind="title" color={c.white}>
            {money(completed.reduce((sum, o) => sum + o.price, 0))}
          </T>
          <T color={c.white}>
            {
              list.filter((o) => inRange(o.createdAt, dayKey(), dayKey()))
                .length
            }{" "}
            Reservas
          </T>
          <T kind="small" color={c.white}>
            Comissão 10%:{" "}
            {money(
              completed.reduce((n, o) => n + orderAmounts(o).feeCents / 100, 0),
            )}{" "}
            · Líquido:{" "}
            {money(
              completed.reduce((n, o) => n + orderAmounts(o).netCents / 100, 0),
            )}
          </T>
          <Button
            secondary
            title="Adicionar Serviço"
            icon="plus-circle-outline"
            onPress={() => router.push("/service-editor")}
          />
        </Card>
      </View>
      <Row>
        {[
          {
            label: "Pendente",
            n: pending.length,
            icon: "clipboard-clock-outline" as const,
            color: c.yellow,
          },
          {
            label: "Confirmada",
            n: list.filter((o) => o.status === "confirmed").length,
            icon: "calendar-check-outline" as const,
            color: c.blue,
          },
          {
            label: "Em serviço",
            n: list.filter((o) => o.status === "active").length,
            icon: "car-wash" as const,
            color: c.green,
          },
        ].map((v) => (
          <Card key={v.label} style={{ flex: 1, padding: 13 }}>
            <Icon name={v.icon} color={v.color} />
            <T kind="title">{v.n}</T>
            <T kind="small" color={c.muted}>
              {v.label}
            </T>
          </Card>
        ))}
      </Row>
      <BusinessAICard />
      <Section
        title="Reservas Pendentes"
        action="Ver todas"
        onPress={() => router.push("/mobile/carwash/reservations")}
      />
      {pending.slice(0, 3).map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
      {!pending.length && (
        <Empty
          title="Tudo em dia"
          message="Não há reservas pendentes. As novas reservas aparecem aqui."
        />
      )}
    </Screen>
  );
}
export function ReservationManagementScreen() {
  const { orders, profile, activePartnerIds } = useMobile();
  const [tab, setTab] = useState("Pendente");
  const list = orders.filter(
    (o) => o.channel === "carwash" && o.partnerId === activePartnerIds.carwash,
  );
  const statuses =
    tab === "Pendente"
      ? ["pending"]
      : tab === "Atendimento"
        ? ["confirmed", "active"]
        : ["completed", "rejected", "cancelled"];
  const shown = list.filter((o) => statuses.includes(o.status));
  return (
    <Screen
      header={
        <Header
          title="Gestão de Reservas"
          subtitle={profile.business}
          back={false}
          right={
            <IconButton
              name="cog"
              label="Configurar negócio"
              onPress={() => router.push("/business-setup")}
            />
          }
        />
      }
    >
      <Row style={{ flexWrap: "wrap" }}>
        {["Pendente", "Atendimento", "Concluída"].map((v) => (
          <Pill
            key={v}
            title={v}
            selected={tab === v}
            onPress={() => setTab(v)}
          />
        ))}
      </Row>
      <Row>
        {[
          [
            "Hoje",
            String(
              list.filter((o) => inRange(o.createdAt, dayKey(), dayKey()))
                .length,
            ),
          ],
          [
            "Ganhos",
            money(
              list
                .filter(
                  (o) =>
                    o.status === "completed" &&
                    inRange(o.completedAt, dayKey(), dayKey()),
                )
                .reduce((n, o) => n + orderAmounts(o).netCents / 100, 0),
            ),
          ],
          [
            "Fila",
            `${list.filter((o) => o.status === "active").length * 15} min`,
          ],
        ].map(([label, value]) => (
          <Card key={label} style={{ flex: 1, padding: 12 }}>
            <T kind="small" color={c.muted}>
              {label}
            </T>
            <T kind="heading" color={label === "Ganhos" ? c.green : c.text}>
              {value}
            </T>
          </Card>
        ))}
      </Row>
      <Section
        title={
          tab === "Pendente"
            ? "Novas Solicitações"
            : tab === "Atendimento"
              ? "Em atendimento"
              : "Histórico de reservas"
        }
      />
      {shown.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
      {!shown.length && (
        <Empty
          title="Sem reservas neste estado"
          message="As alterações feitas nos pedidos aparecem aqui."
        />
      )}
    </Screen>
  );
}
export function ProviderDashboardScreen() {
  const { profile, orders, available, toggleAvailable, activePartnerIds } =
    useMobile();
  const list = orders.filter(
    (o) =>
      o.channel === "provider" && o.partnerId === activePartnerIds.provider,
  );
  const today = dayKey();
  const financials = reportFor(list, today, today);
  const rating = ratingFor(list, activePartnerIds.provider);
  const done = list.filter((o) => o.status === "completed");
  const pending = list.filter((o) => o.status === "pending");
  const active = list.filter((o) => ["active", "confirmed"].includes(o.status));
  return (
    <Screen
      header={
        <Header
          back={false}
          title={`Olá, ${profile.name.split(" ")[0]}`}
          subtitle="Prestador Independente"
          right={
            <Pressable
              accessibilityRole="switch"
              accessibilityLabel="Disponibilidade do prestador"
              accessibilityState={{ checked: available }}
              accessibilityHint={
                available
                  ? "Ficar offline e deixar de receber novos pedidos"
                  : "Ficar online para receber novos pedidos"
              }
              onPress={toggleAvailable}
              style={({ pressed }) => ({
                minHeight: 52,
                minWidth: 112,
                paddingVertical: 9,
                paddingHorizontal: 13,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: available ? c.green : c.border,
                backgroundColor: available ? c.mint : c.bg,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Row style={{ gap: 7, justifyContent: "center" }}>
                <Icon
                  name="power"
                  size={20}
                  color={available ? c.green : c.muted}
                />
                <T kind="label" color={available ? c.green : c.muted}>
                  {available ? "Online" : "Offline"}
                </T>
              </Row>
              <T
                kind="small"
                color={c.muted}
                style={{ textAlign: "center", fontSize: 10 }}
              >
                {available ? "Ficar offline" : "Ficar online"}
              </T>
            </Pressable>
          }
        />
      }
    >
      <T kind="small" color={available ? c.green : c.muted}>
        {available
          ? "Estás online e disponível para novos pedidos."
          : "Estás offline. Fica online para receber novos pedidos."}
      </T>
      <Card style={{ backgroundColor: c.navy, borderColor: c.navy }}>
        <Row style={{ justifyContent: "space-between" }}>
          <T kind="label" color="#C9D0DB">
            Líquido de Hoje · após comissão de 5%
          </T>
          <Icon name="cash-multiple" color={c.white} />
        </Row>
        <T kind="big" color={c.white}>
          {money(financials.netCents / 100)}
        </T>
        <View style={[s.divider, { backgroundColor: "#FFFFFF33" }]} />
        <Row style={{ justifyContent: "space-between" }}>
          <View>
            <T kind="small" color="#C9D0DB">
              Serviços
            </T>
            <T kind="label" color={c.white}>
              {done.length} concluídos
            </T>
          </View>
          <View>
            <T kind="small" color="#C9D0DB">
              Avaliação
            </T>
            <T kind="label" color={c.white}>
              {rating.count
                ? `⭐ ${rating.average.toFixed(1)} (${rating.count})`
                : "Sem avaliações"}
            </T>
          </View>
        </Row>
      </Card>
      {active.length > 0 && (
        <>
          <Section title="Trabalho em curso" />
          {active.map((o) => (
            <OrderCard key={o.id} order={o} provider />
          ))}
        </>
      )}
      <BusinessAICard provider />
      <Section title={`Novos Pedidos · ${available ? pending.length : 0}`} />
      {available ? (
        pending.map((o) => <OrderCard key={o.id} order={o} provider />)
      ) : (
        <Empty
          title="Estás offline"
          message="Toca em Ficar online, no topo, para receber novos pedidos. Os trabalhos já aceites continuam disponíveis."
        />
      )}
      {available && !pending.length && (
        <Empty
          title="Sem novos pedidos"
          message="Os próximos pedidos vão aparecer aqui."
        />
      )}
      <Card style={{ backgroundColor: c.mint }}>
        <Row>
          <Icon name="creation" />
          <T style={{ flex: 1 }}>
            Dica: Há muita procura na zona da Polana hoje. Move-te para lá para
            ganhar mais!
          </T>
        </Row>
      </Card>
      <T kind="small" color={c.muted}>
        Os valores reflectem as vagas aceites, com comissão de 5% da plataforma.
        Pagamentos de demonstração.
      </T>
    </Screen>
  );
}
export function ProviderOrdersScreen({ agenda = false }: { agenda?: boolean }) {
  const { orders, available, activePartnerIds } = useMobile();
  const [tab, setTab] = useState(agenda ? "Agendados" : "Novos");
  const statuses =
    tab === "Novos"
      ? ["pending"]
      : tab === "Agendados"
        ? ["confirmed", "active"]
        : ["completed", "rejected"];
  const shown = orders.filter(
    (o) =>
      o.channel === "provider" &&
      o.partnerId === activePartnerIds.provider &&
      statuses.includes(o.status) &&
      (tab !== "Novos" || available),
  );
  return (
    <Screen
      header={
        <Header
          title={agenda ? "A minha Agenda" : "Os meus Pedidos"}
          back={false}
        />
      }
    >
      <Row style={{ flexWrap: "wrap" }}>
        {["Novos", "Agendados", "Histórico"].map((v) => (
          <Pill
            key={v}
            title={v}
            selected={v === tab}
            onPress={() => setTab(v)}
          />
        ))}
      </Row>
      {shown.map((o) => (
        <OrderCard key={o.id} order={o} provider />
      ))}
      {!shown.length && (
        <Empty
          title="Nada por aqui"
          message={
            available
              ? "Os pedidos neste estado aparecem aqui."
              : "Activa a disponibilidade no início para receber pedidos."
          }
        />
      )}
    </Screen>
  );
}
export function ProviderAgendaScreen() {
  return <ProviderOrdersScreen agenda />;
}
export function ActiveJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, updateOrder, changeStatus } = useMobile();
  const order = orders.find((o) => o.id === id);
  const [notice, setNotice] = useState("");
  if (!order)
    return (
      <Screen header={<Header title="Trabalho" />}>
        <Empty
          title="Trabalho não encontrado"
          message="Abre um pedido a partir da tua área."
        />
      </Screen>
    );
  const done = order.tasks.filter(Boolean).length;
  const completed = order.status === "completed";
  const actionable = ["confirmed", "active"].includes(order.status);
  function finish() {
    if (!order || !actionable) return;
    if (done < 4) {
      setNotice("Conclui os quatro itens antes de terminar o serviço.");
      return;
    }
    changeStatus(order.id, "completed");
    setNotice(
      "Serviço concluído. Os ganhos e os pontos do cliente foram actualizados na demonstração.",
    );
  }
  return (
    <Screen
      header={
        <Header
          title={completed ? "Serviço concluído" : "Trabalho em curso"}
          subtitle={`ID #${order.id}`}
        />
      }
      footer={
        actionable ? (
          <>
            <Button
              title="Concluir Serviço"
              icon="check-circle"
              disabled={done < 4}
              onPress={finish}
            />
            <TextAction
              title="Reportar Problema"
              onPress={() => router.push(`/report-problem?id=${id}`)}
            />
          </>
        ) : (
          <Button
            title="Voltar aos pedidos"
            secondary
            onPress={() => router.back()}
          />
        )
      }
    >
      <Card>
        <Badge title={statusNames[order.status]} />
        <Row>
          <Avatar name={order.client} />
          <View style={{ flex: 1 }}>
            <T kind="heading">{order.client}</T>
            <T color={c.muted}>{order.car}</T>
          </View>
          <IconButton
            name="phone"
            color={c.green}
            label="Contactar cliente"
            onPress={() =>
              Alert.alert(
                "Contacto do cliente",
                "Este pedido contém dados de demonstração. Nenhuma chamada será iniciada.",
              )
            }
          />
        </Row>
      </Card>
      <Section title="Progresso do Serviço" />
      <Progress stage={order.stage} />
      {actionable && (
        <Button
          secondary
          title={
            order.stage === 0
              ? "Registar chegada"
              : order.stage === 1
                ? "Iniciar lavagem"
                : order.stage === 2
                  ? "Avançar para secagem"
                  : "Serviço pronto para concluir"
          }
          disabled={order.stage >= 3}
          onPress={() => {
            changeStatus(order.id, "active");
            updateOrder(order.id, { stage: Math.min(3, order.stage + 1) });
          }}
        />
      )}
      <Row style={{ justifyContent: "space-between" }}>
        <T kind="heading">
          {services.find((s) => s.id === order.serviceId)?.name}
        </T>
        <T kind="small" color={c.muted}>
          {done}/4 Concluído
        </T>
      </Row>
      {[
        "Limpeza de tapetes",
        "Lavagem exterior",
        "Secagem manual",
        "Pretinho nos pneus",
      ].map((label, index) => (
        <Button
          key={label}
          secondary
          title={label}
          icon={
            order.tasks[index] ? "checkbox-marked" : "checkbox-blank-outline"
          }
          disabled={!actionable}
          onPress={() =>
            updateOrder(order.id, {
              tasks: order.tasks.map((v, i) => (i === index ? !v : v)),
            })
          }
        />
      ))}
      {actionable && done < 4 && (
        <T kind="small" color={c.muted}>
          Marca todos os itens para activar a conclusão do serviço.
        </T>
      )}
      {completed && (
        <Card style={{ backgroundColor: c.mint }}>
          <T kind="heading" color={c.green}>
            Obrigado pelo teu trabalho!
          </T>
          <T>
            Bruto: {money(order.price)} · Comissão:{" "}
            {money(orderAmounts(order).feeCents / 100)}
          </T>
          <T>
            Líquido do parceiro: {money(orderAmounts(order).netCents / 100)}
          </T>
        </Card>
      )}
      {!!notice && <T color={c.green}>{notice}</T>}
    </Screen>
  );
}
export function ReportProblemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { report, orders } = useMobile();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Screen
      header={<Header title="Reportar Problema" subtitle={`Trabalho #${id}`} />}
    >
      {sent ? (
        <Card>
          <Icon name="check-circle" color={c.green} size={40} />
          <T kind="heading">Problema registado</T>
          <T>
            O relato foi guardado neste dispositivo. Na demonstração não é
            enviado a uma equipa de suporte.
          </T>
          <Button title="Voltar ao trabalho" onPress={() => router.back()} />
        </Card>
      ) : (
        <>
          <T color={c.muted}>
            Descreve o que aconteceu para ficar associado ao trabalho.
          </T>
          <Field
            label="Descrição do problema"
            multiline
            numberOfLines={5}
            placeholder="Explica a situação…"
            value={message}
            onChangeText={setMessage}
          />
          <Button
            title="Guardar relato"
            disabled={
              message.trim().length < 10 || !orders.some((o) => o.id === id)
            }
            onPress={() => {
              report(id, message.trim());
              setSent(true);
            }}
          />
          <T kind="small" color={c.muted}>
            Escreve pelo menos 10 caracteres.
          </T>
        </>
      )}
    </Screen>
  );
}
export function Chart({
  values = [24, 30, 36, 28, 44, 88, 74],
  labels = ["S", "T", "Q", "Q", "S", "S", "D"],
}: {
  values?: number[];
  labels?: string[];
}) {
  return (
    <Row
      style={{
        alignItems: "flex-end",
        height: 145,
        justifyContent: "space-around",
        paddingTop: 10,
      }}
    >
      {values.map((value, i) => (
        <View key={i} style={{ alignItems: "center", gap: 7, flex: 1 }}>
          <View
            accessibilityLabel={`${labels[i]}: ${value}`}
            style={{
              width: 16,
              height: Math.max(5, value),
              borderRadius: 5,
              backgroundColor: c.red,
            }}
          />
          <T kind="small" color={c.muted}>
            {labels[i]}
          </T>
        </View>
      ))}
    </Row>
  );
}
export function PerformanceScreen({
  provider = false,
}: {
  provider?: boolean;
}) {
  return <EarningsScreen provider={provider} />;
}
export function ProviderEarningsScreen() {
  return <EarningsScreen provider />;
}
export function BusinessServicesScreen() {
  const { profile, updateProfile } = useMobile();
  return (
    <Screen header={<Header title="Os meus Serviços" back={false} />}>
      <Button
        title="Adicionar Serviço"
        icon="plus"
        onPress={() => router.push("/service-editor")}
      />
      {services.map((service) => (
        <Card key={service.id}>
          <Row>
            <View style={{ flex: 1 }}>
              <T kind="heading">{service.name}</T>
              <T color={c.muted}>{service.description}</T>
            </View>
            <Switch
              accessibilityLabel={`Disponibilizar ${service.name}`}
              value={profile.enabledServices.includes(service.id)}
              onValueChange={(on) =>
                updateProfile({
                  enabledServices: on
                    ? [...profile.enabledServices, service.id]
                    : profile.enabledServices.filter((id) => id !== service.id),
                })
              }
              trackColor={{ true: c.red }}
            />
          </Row>
          <Row style={{ justifyContent: "space-between" }}>
            <T kind="heading" color={c.red}>
              {money(profile.servicePrices[service.id] ?? service.price)}
            </T>
            <TextAction
              title="Editar preço"
              onPress={() => router.push(`/service-editor?id=${service.id}`)}
            />
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
export function ServiceEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile, updateProfile } = useMobile();
  const [selected, setSelected] = useState(id || "complete");
  const [price, setPrice] = useState(
    String(
      profile.servicePrices[selected] ??
        services.find((s) => s.id === selected)?.price ??
        600,
    ),
  );
  const [error, setError] = useState("");
  return (
    <Screen
      header={<Header title={id ? "Editar Serviço" : "Adicionar Serviço"} />}
    >
      <T color={c.muted}>
        Selecciona um serviço do catálogo e define o preço do teu
        estabelecimento.
      </T>
      {services.map((service) => (
        <Pill
          key={service.id}
          title={service.name}
          selected={selected === service.id}
          onPress={() => {
            setSelected(service.id);
            setPrice(
              String(profile.servicePrices[service.id] ?? service.price),
            );
          }}
        />
      ))}
      <Field
        label="Preço (MT)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      {!!error && <T color={c.red}>{error}</T>}
      <Button
        title="Guardar Serviço"
        onPress={() => {
          if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
            setError("Indica um preço válido maior que zero.");
            return;
          }
          updateProfile({
            servicePrices: {
              ...profile.servicePrices,
              [selected]: Number(price),
            },
            enabledServices: [
              ...new Set([...profile.enabledServices, selected]),
            ],
          });
          router.back();
        }}
      />
    </Screen>
  );
}
