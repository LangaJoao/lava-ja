import { ServiceEditorScreen } from "../features/mobile/OperationScreens";
import { RouteGuard } from "../features/mobile/RouteGuard";
export default function ScreenRoute() {
  return (
    <RouteGuard roles={["carwash"]}>
      <ServiceEditorScreen />
    </RouteGuard>
  );
}
