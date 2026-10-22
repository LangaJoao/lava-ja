import { Redirect } from "expo-router";
import type { ReactNode } from "react";
import { useSession } from "../auth/context/SessionContext";
import { homeFor, type MobileRole } from "./data";

/** Demo navigation guard; real authorization belongs in a future backend. */
export function RouteGuard({
  roles,
  children,
}: {
  roles: MobileRole[];
  children: ReactNode;
}) {
  const { role } = useSession();
  if (!role) return <Redirect href={`/login?role=${roles[0]}`} />;
  if (role === "admin" || !roles.includes(role))
    return <Redirect href={homeFor(role)} />;
  return children;
}
