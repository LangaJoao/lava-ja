import { router } from "expo-router";
import { Button, Empty, Screen } from "../features/mobile/ui";
export default function NotFound() {
  return (
    <Screen>
      <Empty
        title="Ecrã não encontrado"
        message="Volta ao início para continuar no Lava Já."
      />
      <Button
        title="Voltar ao início"
        onPress={() => router.replace("/onboarding")}
      />
    </Screen>
  );
}
