import { useState } from "react";
import { router } from "expo-router";
import { useMobile } from "./store";
import { services, money } from "./data";
import {
  Button,
  Card,
  Empty,
  Header,
  Pill,
  Row,
  Screen,
  Section,
  T,
} from "./ui";
import { c } from "./theme";
export default function ProviderBookingScreen() {
  const { partners, vehicles, profile, createBooking } = useMobile();
  const providers = partners.filter((p) => p.pillar === "provider");
  const [partnerId, setPartnerId] = useState(providers[0]?.id || "");
  const [serviceId, setServiceId] = useState("complete");
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || "");
  const [time, setTime] = useState("14:30");
  const [date, setDate] = useState("Hoje");
  const [saved, setSaved] = useState(false);
  const service = services.find((s) => s.id === serviceId)!;
  return (
    <Screen
      header={
        <Header
          title="Rampa de bairro"
          subtitle="Reservar um Prestador de Serviços"
        />
      }
      footer={
        <Button
          title={`Preencher vaga · ${money(service.price)}`}
          disabled={!partnerId || !vehicleId || saved}
          onPress={() => {
            const partner = providers.find((p) => p.id === partnerId);
            const car = vehicles.find((v) => v.id === vehicleId);
            if (!partner || !car) return;
            setSaved(true);
            const id = createBooking({
              client: profile.name,
              car: `${car.brand} · ${car.plate}`,
              serviceId,
              price: service.price,
              time,
              date,
              channel: "provider",
              wash: partner.name,
              partnerId,
              payment: "M-Pesa (simulado)",
            });
            router.replace(`/booking-confirmation?id=${id}`);
          }}
        />
      }
    >
      <T kind="title">Escolhe quem cuida do teu carro</T>
      <Section title="Prestador" />
      {providers.map((p) => (
        <Pill
          key={p.id}
          title={p.name}
          selected={partnerId === p.id}
          onPress={() => setPartnerId(p.id)}
        />
      ))}
      {!providers.length && (
        <Empty
          title="Sem prestadores"
          message="Regista um Prestador para experimentar este pilar."
        />
      )}
      <Section title="Serviço" />
      {services.map((s) => (
        <Pill
          key={s.id}
          title={`${s.name} · ${money(s.price)}`}
          selected={serviceId === s.id}
          onPress={() => setServiceId(s.id)}
        />
      ))}
      <Section title="Veículo" />
      {vehicles.map((v) => (
        <Pill
          key={v.id}
          title={`${v.brand} · ${v.plate}`}
          selected={v.id === vehicleId}
          onPress={() => setVehicleId(v.id)}
        />
      ))}
      {!vehicles.length && (
        <Button
          secondary
          title="Adicionar carro"
          onPress={() => router.push("/garage")}
        />
      )}
      <Section title="Dia e horário" />
      <Row>
        {["Hoje", "Amanhã"].map((v) => (
          <Pill
            key={v}
            title={v}
            selected={date === v}
            onPress={() => setDate(v)}
          />
        ))}
      </Row>
      <Row style={{ flexWrap: "wrap" }}>
        {["09:00", "10:30", "14:30", "16:00"].map((v) => (
          <Pill
            key={v}
            title={v}
            selected={time === v}
            onPress={() => setTime(v)}
          />
        ))}
      </Row>
      <Card style={{ backgroundColor: c.pink }}>
        <T kind="label">Pilar 2 · Comissão de 5%</T>
        <T>
          A plataforma cobra 5% ao prestador por vaga preenchida e aceite. O teu
          preço mantém-se em {money(service.price)}. Pagamento e reserva de
          demonstração.
        </T>
      </Card>
    </Screen>
  );
}
