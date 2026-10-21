import { createContext, useContext, useState } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [role, setRole] = useState(null);
  return <SessionContext.Provider value={{ role, signIn: setRole, signOut: () => setRole(null) }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (session === null) {
    throw new Error('A sessão não foi inicializada. Fecha o app e abre novamente pelo servidor atual.');
  }
  return session;
}
