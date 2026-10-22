import ReviewScreen from "../../features/mobile/ReviewScreen";
import { RouteGuard } from "../../features/mobile/RouteGuard";
export default function ReviewRoute() {
  return (
    <RouteGuard roles={["client"]}>
      <ReviewScreen />
    </RouteGuard>
  );
}
