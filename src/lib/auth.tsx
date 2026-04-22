import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type User = { name: string; email: string };

const Ctx = createContext<{
  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;
} | null>(null);

const KEY = "simba.user.v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const signIn = (u: User) => {
    setUser(u);
    localStorage.setItem(KEY, JSON.stringify(u));
  };
  const signOut = () => {
    setUser(null);
    localStorage.removeItem(KEY);
  };

  return <Ctx.Provider value={{ user, signIn, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
