import { NotificationsScreen } from "../features/mobile/SharedScreens";
import { RouteGuard } from "../features/mobile/RouteGuard";
export default function ScreenRoute() {
  return (
    <RouteGuard roles={["client"]}>
      <NotificationsScreen />
    </RouteGuard>
  );
}
