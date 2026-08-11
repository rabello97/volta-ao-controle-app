import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clearToken, getToken, setToken } from "@/lib/session";
import { apiRequest } from "@/api/client";
import type { AuthResult, User } from "@/api/types";

export interface AuthContextValue {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (result: AuthResult) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    apiRequest<{ income: number; expense: number; balance: number; debts: number }>("/dashboard/me")
      .then(() => {
        // Sessão válida, mas ainda não temos os dados do usuário (só o dashboard) —
        // o login/loginWithGoogle preenchem `user` diretamente; numa restauração de
        // sessão sem esses dados, mantemos autenticado com user desconhecido até a
        // primeira tela buscar algo que o traga (ex.: household).
        setStatus("authenticated");
      })
      .catch(() => {
        clearToken();
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback((result: AuthResult) => {
    setToken(result.token);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return ctx;
}
