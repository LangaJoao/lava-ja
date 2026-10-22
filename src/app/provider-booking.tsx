import ProviderBookingScreen from "../features/mobile/ProviderBookingScreen";
import { RouteGuard } from "../features/mobile/RouteGuard";
export default function ProviderBookingRoute() {
  return (
    <RouteGuard roles={["client"]}>
      <ProviderBookingScreen />
    </RouteGuard>
  );
}
