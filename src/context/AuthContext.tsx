import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clearStoredUser, clearToken, getStoredUser, getToken, setStoredUser, setToken } from "@/lib/session";
import { apiRequest, ApiError } from "@/api/client";
import type { AuthResult, User } from "@/api/types";

export interface AuthContextValue {
  user: User | null;
  status: "authenticated" | "unauthenticated";
  login: (result: AuthResult) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Nome/e-mail vêm junto do token no login e ficam salvos localmente, para que
  // a barra lateral já mostre a pessoa certa mesmo depois de um refresh —
  // sem isso, só teríamos esses dados de volta no próximo login().
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  // Otimista: se há um token salvo, entra direto como autenticado (sem tela de
  // carregamento bloqueante). A validação roda em segundo plano — só desloga se
  // o backend confirmar explicitamente que o token é inválido (401). Um erro de
  // rede/timeout nessa checagem não derruba a sessão nem trava o app.
  const [status, setStatus] = useState<AuthContextValue["status"]>(() =>
    getToken() ? "authenticated" : "unauthenticated",
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    apiRequest<unknown>("/dashboard/me").catch((error) => {
      if (error instanceof ApiError && error.status === 401) {
        clearToken();
        clearStoredUser();
        setUser(null);
        setStatus("unauthenticated");
      }
    });
  }, []);

  const login = useCallback((result: AuthResult) => {
    setToken(result.token);
    setStoredUser(result.user);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearStoredUser();
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
