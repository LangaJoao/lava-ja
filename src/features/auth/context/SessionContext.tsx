import { createContext, useContext, useState, type ReactNode } from "react";
import type { MobileRole } from "../../mobile/data";

type Role = MobileRole | "admin";
const SessionContext = createContext<{
  role: Role | null;
  signIn: (role: Role) => void;
  signOut: () => void;
} | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  return (
    <SessionContext.Provider
      value={{ role, signIn: setRole, signOut: () => setRole(null) }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (session === null) {
    throw new Error(
      "A sessão não foi inicializada. Fecha o app e abre novamente pelo servidor atual.",
    );
  }
  return session;
}
