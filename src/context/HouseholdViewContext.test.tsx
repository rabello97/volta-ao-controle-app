import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { HouseholdViewProvider, useHouseholdView } from "./HouseholdViewContext";
import { clearToken } from "@/lib/session";
import * as householdApi from "@/api/household";

vi.mock("@/api/household");

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HouseholdViewProvider>{children}</HouseholdViewProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function useTestHooks() {
  return { auth: useAuth(), view: useHouseholdView() };
}

beforeEach(() => {
  clearToken();
  vi.mocked(householdApi.getHousehold).mockReset();
});

describe("HouseholdViewProvider", () => {
  it("sem household, só mostra a opção própria e não expõe parceiro", async () => {
    vi.mocked(householdApi.getHousehold).mockResolvedValue({ members: [] });
    const { result } = renderHook(() => useTestHooks(), { wrapper });

    act(() => {
      result.current.auth.login({
        token: "t",
        user: { id: "u1", name: "Ana", email: "ana@example.com", theme: null, savingsGoalTarget: null, savingsGoalSaved: null, monthlyIncome: null },
      });
    });

    await waitFor(() => expect(result.current.view.isLoading).toBe(false));
    expect(result.current.view.hasHousehold).toBe(false);
    expect(result.current.view.partner).toBeNull();
    expect(result.current.view.view).toBe("self");
  });

  it("com household ativo, expõe o parceiro e permite trocar de visão", async () => {
    vi.mocked(householdApi.getHousehold).mockResolvedValue({
      members: [
        { id: "u1", name: "Ana", email: "ana@example.com" },
        { id: "u2", name: "Bruno", email: "bruno@example.com" },
      ],
    });
    const { result } = renderHook(() => useTestHooks(), { wrapper });

    act(() => {
      result.current.auth.login({
        token: "t",
        user: { id: "u1", name: "Ana", email: "ana@example.com", theme: null, savingsGoalTarget: null, savingsGoalSaved: null, monthlyIncome: null },
      });
    });

    await waitFor(() => expect(result.current.view.hasHousehold).toBe(true));
    expect(result.current.view.partner?.id).toBe("u2");

    act(() => {
      result.current.view.setView("household");
    });
    expect(result.current.view.view).toBe("household");
  });
});
