import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  authenticateUser,
  ensureDemoState,
  getSessionUser,
  registerCustomer,
  signOutUser,
  type SessionUser,
} from "@/lib/demo-store";

type SignInInput = {
  credential: string;
  password: string;
};

type SignUpInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

const Ctx = createContext<{
  user: SessionUser | null;
  hydrated: boolean;
  signIn: (input: SignInInput) => { ok: true } | { ok: false; error: string };
  signUp: (input: SignUpInput) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureDemoState();
    setUser(getSessionUser());
    setHydrated(true);
  }, []);

  const signIn = (input: SignInInput) => {
    const result = authenticateUser(input);
    if (!result.ok) {
      return result;
    }

    setUser(result.user);
    return { ok: true as const };
  };

  const signUp = (input: SignUpInput) => {
    const result = registerCustomer(input);
    if (!result.ok) {
      return result;
    }

    setUser(result.user);
    return { ok: true as const };
  };

  const signOut = () => {
    signOutUser();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, hydrated, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
