import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { clearToken, getToken, setToken } from "@/lib/session";

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
});

afterEach(() => {
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
      result.current.login({ token: "abc123", user: { id: "u1", name: "Ana", email: "ana@example.com" } });
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.user?.name).toBe("Ana");
    expect(getToken()).toBe("abc123");
  });

  it("logout() limpa sessão e usuário", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("unauthenticated"));

    act(() => {
      result.current.login({ token: "abc123", user: { id: "u1", name: "Ana", email: "ana@example.com" } });
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.user).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("restaura a sessão quando há um token salvo e o backend confirma", async () => {
    setToken("valid-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ income: 0, expense: 0, balance: 0, debts: 0 }),
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.status).toBe("authenticated"));
  });

  it("limpa o token quando a validação da sessão restaurada falha", async () => {
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
