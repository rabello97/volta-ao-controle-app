import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { clearStoredUser, clearToken, getStoredUser, getToken, setToken } from "@/lib/session";
import type { User } from "@/api/types";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    name: "Ana",
    email: "ana@example.com",
    theme: null,
    savingsGoalTarget: null,
    savingsGoalSaved: null,
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  clearToken();
  clearStoredUser();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AuthProvider", () => {
  it("começa como unauthenticated quando não há token salvo", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));
  });

  it("login() autentica e salva o token na sessão", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));

    act(() => {
      result.current.login({ token: "abc123", user: makeUser() });
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.user?.name).toBe("Ana");
    expect(getToken()).toBe("abc123");
    expect(getStoredUser()?.name).toBe("Ana");
  });

  it("mantém o nome do usuário salvo entre remontagens (sobrevive a um refresh)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => (makeUser()),
      }),
    );

    const { result: first } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(first.current.status).toBe("unauthenticated"));
    act(() => {
      first.current.login({ token: "abc123", user: makeUser() });
    });

    const { result: second } = renderHook(() => useAuth(), { wrapper });
    expect(second.current.user?.name).toBe("Ana");
  });

  it("logout() limpa sessão e usuário", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));

    act(() => {
      result.current.login({ token: "abc123", user: makeUser() });
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.user).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("entra autenticado imediatamente quando há um token salvo (otimista, sem tela de carregamento)", () => {
    setToken("valid-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => (makeUser()),
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.status).toBe("authenticated");
  });

  it("mantém a sessão quando a validação em segundo plano falha por erro de rede (não por 401)", async () => {
    setToken("valid-token");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.status).toBe("authenticated");

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result.current.status).toBe("authenticated");
    expect(getToken()).toBe("valid-token");
  });

  it("atualiza os dados do usuário a partir de /auth/me após restaurar a sessão", async () => {
    setToken("valid-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => (makeUser({ name: "Ana Atualizada" })),
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.name).toBe("Ana Atualizada"));
    expect(getStoredUser()?.name).toBe("Ana Atualizada");
  });

  it("updateUser() atualiza o usuário em memória e na sessão salva", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));

    act(() => {
      result.current.login({ token: "abc123", user: makeUser() });
    });
    act(() => {
      result.current.updateUser(makeUser({ name: "Ana Paula" }));
    });

    expect(result.current.user?.name).toBe("Ana Paula");
    expect(getStoredUser()?.name).toBe("Ana Paula");
  });

  it("limpa o token quando a validação da sessão restaurada falha com 401", async () => {
    setToken("expired-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: "Token inválido" }),
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));
    expect(getToken()).toBeNull();
  });
});
