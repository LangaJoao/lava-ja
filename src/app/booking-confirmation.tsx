import { BookingConfirmationScreen } from "../features/mobile/ClientScreens";
import { RouteGuard } from "../features/mobile/RouteGuard";
export default function ScreenRoute() {
  return (
    <RouteGuard roles={["client"]}>
      <BookingConfirmationScreen />
    </RouteGuard>
  );
}
