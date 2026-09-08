import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TransactionFormDialog } from "./TransactionFormDialog";
import * as creditCardsApi from "@/api/creditCards";
import { HouseholdViewProvider } from "@/context/HouseholdViewContext";
import { AuthProvider } from "@/context/AuthContext";
import * as authApi from "@/api/auth";

vi.mock("@/api/creditCards");
vi.mock("@/api/auth");

function renderDialog() {
  vi.mocked(creditCardsApi.listCreditCards).mockResolvedValue([
    {
      id: "card-1",
      nickname: "Nubank",
      closingDay: 10,
      dueDay: 17,
      creditLimit: null,
      currentInvoiceTotal: 0,
      utilizationPct: null,
    },
  ]);

  vi.mocked(authApi.getCurrentUser).mockRejectedValue(new Error("sem sessão"));
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HouseholdViewProvider>
        <TransactionFormDialog open onOpenChange={() => {}} onSubmit={vi.fn()} isSubmitting={false} />
        </HouseholdViewProvider>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("TransactionFormDialog", () => {
  it("mostra o campo de cartão quando o tipo é saída (padrão)", () => {
    renderDialog();
    expect(screen.getByText("Cartão (opcional)")).toBeInTheDocument();
  });

  it("oculta o campo de cartão quando o tipo é entrada", async () => {
    renderDialog();
    const user = (await import("@testing-library/user-event")).default.setup();
    await user.click(screen.getByRole("button", { name: "Entrada" }));

    expect(screen.queryByText("Cartão (opcional)")).not.toBeInTheDocument();
  });

  it("já marca a fatura atual ao escolher um cartão", async () => {
    const user = userEvent.setup();
    renderDialog();

    // O gatilho do Select mostra o placeholder "Nenhum" enquanto não há cartão.
    const gatilho = screen.getAllByRole("combobox").find((el) => el.textContent?.includes("Nenhum"));
    await user.click(gatilho as HTMLElement);
    await user.click(await screen.findByRole("option", { name: "Nubank" }));

    // Sem um padrão, nenhuma das duas opções ficava marcada e o servidor
    // recusava o salvamento.
    expect(screen.getByRole("button", { name: "Atual" })).toHaveAttribute("aria-pressed", "true");
  });
});

