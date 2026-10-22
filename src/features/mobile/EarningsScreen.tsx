import { useState } from "react";
import { useMobile } from "./store";
import {
  dayKey,
  earnedAt,
  inRange,
  orderAmounts,
  periodRange,
  reportFor,
  settlementCandidates,
} from "./finance";
import { money } from "./data";
import { Badge, Card, Header, Pill, Row, Screen, Section, T } from "./ui";
import { c } from "./theme";
export default function EarningsScreen({
  provider = false,
}: {
  provider?: boolean;
}) {
  const { orders, activePartnerIds, settlements } = useMobile();
  const [period, setPeriod] = useState("day");
  const [anchor] = useState(() => dayKey());
  const { start, end } = periodRange(period, anchor);
  const partnerId = provider
    ? activePartnerIds.provider
    : activePartnerIds.carwash;
  const totals = reportFor(orders, start, end, partnerId);
  const selected = orders.filter(
    (o) => o.partnerId === partnerId && inRange(earnedAt(o), start, end),
  );
  const eligible = settlementCandidates(
    orders,
    settlements,
    partnerId,
    periodRange("week", anchor).start,
  );
  const balance = eligible.reduce(
    (sum, o) => sum + orderAmounts(o).netCents,
    0,
  );
  return (
    <Screen
      header={
        <Header
          title={provider ? "Os meus Ganhos" : "Desempenho financeiro"}
          back={false}
        />
      }
    >
      <Row>
        {[
          ["day", "Hoje"],
          ["week", "Semana"],
          ["month", "Mês"],
        ].map(([id, label]) => (
          <Pill
            key={id}
            title={label}
            selected={period === id}
            onPress={() => setPeriod(id)}
          />
        ))}
      </Row>
      <T kind="small" color={c.muted}>
        {start} a {end} · Africa/Maputo
      </T>
      <Card style={{ backgroundColor: c.navy }}>
        <T color={c.white}>Líquido após comissão</T>
        <T kind="big" color={c.white}>
          {money(totals.netCents / 100)}
        </T>
        <T color={c.white}>
          {totals.count}{" "}
          {provider ? "vagas preenchidas" : "serviços concluídos"}
        </T>
      </Card>
      <Row>
        <Card style={{ flex: 1 }}>
          <T kind="small" color={c.muted}>
            Valor bruto
          </T>
          <T kind="heading">{money(totals.grossCents / 100)}</T>
        </Card>
        <Card style={{ flex: 1 }}>
          <T kind="small" color={c.muted}>
            Comissão {provider ? "5%" : "10%"}
          </T>
          <T kind="heading" color={c.red}>
            {money(totals.feeCents / 100)}
          </T>
        </Card>
      </Row>
      {!provider && (
        <Card>
          <T kind="heading">Liquidação semanal</T>
          <T>Saldo de semanas encerradas: {money(balance / 100)}</T>
          <T color={c.muted}>
            Os saldos digitais acumulados são liquidados por transferência
            bancária formal. Nesta demonstração, os lotes são registados pela
            administração web. Pagamentos no local originam comissão a cobrar e
            não um novo pagamento ao parceiro.
          </T>
        </Card>
      )}
      <Badge
        title={
          provider
            ? "5% por vaga aceite na rampa de bairro"
            : "10% retidos por serviço"
        }
        color={c.red}
      />
      <Section title="Movimentos do período" />
      {selected.map((o) => {
        const a = orderAmounts(o);
        return (
          <Card key={o.id}>
            <T kind="label">{o.client}</T>
            <T kind="small" color={c.muted}>
              {dayKey(new Date(earnedAt(o)!))} · {o.id}
            </T>
            <T>Bruto: {money(a.grossCents / 100)}</T>
            <T color={c.red}>Comissão: {money(a.feeCents / 100)}</T>
            <T kind="heading" color={c.green}>
              Líquido: {money(a.netCents / 100)}
            </T>
          </Card>
        );
      })}
      {!selected.length && <T color={c.muted}>Sem movimentos neste período.</T>}
      <T kind="small" color={c.muted}>
        Valores de demonstração. Não representam transferências ou fundos
        bancários reais.
      </T>
    </Screen>
  );
}
