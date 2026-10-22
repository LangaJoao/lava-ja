import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useMobile } from "./store";
import { c } from "./theme";
import { services } from "./data";
import {
  Button,
  Card,
  Empty,
  Field,
  Header,
  Icon,
  IconButton,
  Row,
  Screen,
  T,
} from "./ui";
export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, reviewOrder } = useMobile();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const order = orders.find((o) => o.id === id && o.mine);
  if (!order || order.status !== "completed" || !order.clientConfirmedAt)
    return (
      <Screen header={<Header title="Avaliar serviço" />}>
        <Empty
          title="Serviço ainda não confirmado"
          message="Abre a tua reserva concluída e toca em Concluído para avaliar."
        />
      </Screen>
    );
  if (order.review)
    return (
      <Screen header={<Header title="Avaliação enviada" />}>
        <Card>
          <Icon name="check-circle" color={c.green} size={55} />
          <T kind="heading">Obrigado pela tua avaliação!</T>
          <T color={c.red}>{"★".repeat(order.review.stars)}</T>
          <T>{order.review.comment}</T>
          <Button
            title="Voltar às reservas"
            onPress={() => router.replace("/mobile/client/reservations")}
          />
        </Card>
      </Screen>
    );
  return (
    <Screen header={<Header title="Como correu o serviço?" />}>
      <T kind="title">
        Avalia {order.channel === "carwash" ? "o Car Wash" : "o Prestador"}
      </T>
      <T>{order.wash}</T>
      <T color={c.muted}>
        {services.find((s) => s.id === order.serviceId)?.name} · {order.car}
      </T>
      <Card>
        <Row style={{ justifyContent: "center", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <IconButton
              key={value}
              name={value <= stars ? "star" : "star-outline"}
              color={c.yellow}
              label={`${value} estrelas`}
              onPress={() => setStars(value)}
            />
          ))}
        </Row>
        <T style={{ textAlign: "center" }}>
          {stars ? `${stars} de 5 estrelas` : "Selecciona a tua classificação"}
        </T>
      </Card>
      <Field
        label="Comentário (opcional)"
        placeholder="Partilha a tua experiência…"
        multiline
        maxLength={1000}
        value={comment}
        onChangeText={setComment}
      />
      <Button
        title="Enviar avaliação"
        disabled={!stars}
        onPress={() => reviewOrder(order.id, stars, comment)}
      />
      <T kind="small" color={c.muted}>
        Uma avaliação por serviço concluído.
      </T>
    </Screen>
  );
}
